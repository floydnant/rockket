import { DialogRef } from '@angular/cdk/dialog'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { EntityType, isTruthy, valuesOf } from '@rockket/commons'
import {
    Observable,
    ReplaySubject,
    Subject,
    delay,
    first,
    fromEvent,
    isObservable,
    map,
    of,
    share,
    skip,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs'
import { CommandPaletteComponent } from 'src/app/command-palette/command-palette.component'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { DialogService } from 'src/app/modal/dialog.service'
import { environment } from 'src/environments/environment'
import { AppState } from '../store'
import { flattenEntityTreeWithFullPath, flattenTaskTreeWithFullPath } from '../store/entities/utils'

type EntityCommandPaletteSearchItem = CommandPaletteItem & {
    resultType: 'entity'
    id: string
    entityType: EntityType
    route: string
}

// @TODO: move this somewhere shared
const truncatePath = <T>(path: T[]): (T | '...')[] => {
    return path.length < 3 ? path : [path[0], '...', path.at(-1)!]
}

export type CommandPaletteContext = {
    enter(data: CommandPaletteItem): void
    items$: Observable<CommandPaletteItem[]>
    itemsIfNoMatch:
        | ((searchQuery: string) => CommandPaletteItem[] | Observable<CommandPaletteItem[]>)
        | undefined
    preserveSearchQuery: boolean
    renderItemsOnEmptySearchQuery: boolean
    placeholder: string
    width: number
    maxHeight: number
}

export type CommandPaletteItem = {
    title: string
    icon?: IconKey
    breadcrumbs?: string[]
    keywords?: string[]
    keepOpen?: boolean
}

export type CommandPaletteOptions<
    TItem extends CommandPaletteItem,
    TFallbackItem extends CommandPaletteItem,
> = {
    prompt: string
    items: TItem[] | Observable<TItem[]>
    itemsIfNoMatch?: (searchQuery: string) => TFallbackItem[] | Observable<TFallbackItem[]>
    /**
     * Keep the command palette open after a result was returned.
     * This is useful for nested command palettes. I.e. so that the next
     * context can claim the palette and reuse the dom (w/o flickering).
     *
     * Most of the time, you probably want to specify this option on the item level.
     */
    keepOpen?: boolean
    /**
     * If there is already a command palette open, it's search query gets cleared by default.
     * This option prevents that.
     */
    preserveSearchQuery?: boolean
    /**
     * Whether to render the items although the search query is empty (e.g. on first render)
     *
     * Note: avoid this option if you have a lot of items.
     */
    renderItemsOnEmptySearchQuery?: boolean
}

export type CommandPaletteResult<T extends CommandPaletteItem> =
    | {
          result: T
          type: 'selected'
          keptOpen: boolean
      }
    | {
          result: undefined
          type: 'dismissed'
          keptOpen: boolean
      }

@Injectable({
    providedIn: 'root',
})
export class CommandPaletteService {
    constructor(
        private overlayService: DialogService,
        private store: Store<AppState>,
        private router: Router,
    ) {}

    // @TODO: connect this to a proper keybinding mechanism
    private _keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(e => {
        if (
            (e.key == 'k' || e.key == 'p') &&
            (e.metaKey || e.ctrlKey) &&
            !e.shiftKey &&
            !e.altKey &&
            !e.isComposing &&
            !e.repeat
        ) {
            this.navigateToSelectedEntity()
        }
    })

    selectEntity(options?: { keepOpen?: boolean }): Observable<EntityCommandPaletteSearchItem | null>
    selectEntity(options?: {
        keepOpen?: boolean
        allowNavToSearchPage?: true
    }): Observable<EntityCommandPaletteSearchItem | { resultType: 'search-page'; route: string } | null>
    selectEntity(options?: {
        keepOpen?: boolean
        allowNavToSearchPage?: boolean
    }): Observable<EntityCommandPaletteSearchItem | { resultType: 'search-page'; route: string } | null> {
        return this.searchableEntityCommandPaletteItems$.pipe(
            first(),
            switchMap(items => {
                const ref = this.openCommandPalette({
                    prompt: 'Search for stuff',
                    items,
                    itemsIfNoMatch: options?.allowNavToSearchPage
                        ? query => [
                              {
                                  resultType: 'search-page' as const,
                                  title: 'Extend search for: ' + query,
                                  icon: 'search' as IconKey,
                                  // @TODO: this must be properly encoded/escaped
                                  route: '/home/search?q=' + query,
                              },
                          ]
                        : undefined,
                    keepOpen: options?.keepOpen,
                })
                return ref.result$
            }),
            map(res => {
                if (res.type == 'selected') {
                    return res.result
                }

                return null
            }),
        )
    }

    navigateToSelectedEntity() {
        this.selectEntity({ allowNavToSearchPage: true }).subscribe(result => {
            if (!result) return

            this.router.navigateByUrl(result.route)
        })
    }

    launchCommandPaletteDemo() {
        this.selectEntity({ keepOpen: true })
            .pipe(
                switchMap(entity => {
                    if (!entity) return of(null)

                    const result$ = this.openCommandPalette({
                        prompt: 'What should we do with this?',
                        items: [
                            { title: 'Second command palette for: ' + entity.title, action: () => {} },
                            { title: 'With followup options for: ' + entity.title, action: () => {} },
                        ],
                        renderItemsOnEmptySearchQuery: true,
                    })
                    return result$.result$.pipe(
                        map(res => {
                            console.log('second command palette returned', res)
                            if (res.type == 'selected') res.result.action()
                        }),
                    )
                }),
            )
            .subscribe()
    }

    private commandPaletteContext$ = new ReplaySubject<CommandPaletteContext>(1)

    /**
     * Fired when `openCommandPalette()` is called, but there is already an active
     * command palette, so we want to focus it in case the focus got lost somehow.
     */
    onShouldFocusPalette$ = new Subject<void>()

    private dialogRef: DialogRef | null = null
    openCommandPalette<TItem extends CommandPaletteItem, TFallbackItem extends CommandPaletteItem = never>(
        options: CommandPaletteOptions<TItem, TFallbackItem>,
    ) {
        const enter$ = new Subject<CommandPaletteItem>()

        const paletteWidth = 600
        const paletteMaxHeight = 350
        this.commandPaletteContext$.next({
            enter: selectedItem => enter$.next(selectedItem),
            items$: isObservable(options.items) ? options.items : of(options.items),
            itemsIfNoMatch: options.itemsIfNoMatch,
            preserveSearchQuery: options?.preserveSearchQuery || false,
            renderItemsOnEmptySearchQuery: options?.renderItemsOnEmptySearchQuery || false,
            placeholder: options.prompt,
            width: paletteWidth,
            maxHeight: paletteMaxHeight,
        })

        if (this.dialogRef && this.dialogRef?.overlayRef.hasAttached()) {
            if (!environment.isProduction) console.warn('CommandPalette is already open')
            this.onShouldFocusPalette$.next()
        } else {
            this.dialogRef = this.overlayService.showDialog<unknown, unknown>(
                CommandPaletteComponent,
                this.commandPaletteContext$,
                {
                    width: paletteWidth,
                    maxHeight: paletteMaxHeight,
                },
            )
        }
        // `commandPaletteContext$` is a ReplaySubject(1), so we need to skip the first value
        this.dialogRef.closed.pipe(takeUntil(this.commandPaletteContext$.pipe(skip(1)))).subscribe(() => {
            this.dialogRef = null
        })

        const result$: Observable<CommandPaletteResult<TItem | TFallbackItem>> = enter$.pipe(
            first(),
            map((result): CommandPaletteResult<TItem | TFallbackItem> => {
                const keptOpen = Boolean(result && (result.keepOpen || options?.keepOpen))

                if (result) return { keptOpen, result: result as TItem | TFallbackItem, type: 'selected' }
                return { keptOpen, result: undefined, type: 'dismissed' }
            }),
            // `commandPaletteContext$` is a ReplaySubject(1), so we need to skip the first value
            takeUntil(this.commandPaletteContext$.pipe(skip(1))),
            // `dialogRef.closed` is synchronous, so we need to move it to the macro queue
            // in order to allow our `result$` to complete first
            takeUntil(this.dialogRef.closed.pipe(delay(0))),
            tap(res => {
                if (!res?.keptOpen) this.dialogRef?.close()
            }),
            share(),
        )
        result$.subscribe()

        return { result$, close: () => this.dialogRef?.close() }
    }

    private searchableEntityCommandPaletteItems$: Observable<EntityCommandPaletteSearchItem[]> = this.store
        .select(state => state.entities)
        .pipe(
            map(entitiesState => {
                const flatEntityTree = flattenEntityTreeWithFullPath(entitiesState.entityTree || [])

                const taskTree = valuesOf(entitiesState.taskTreeMap || {}).flat()
                const flatTaskTree = flattenTaskTreeWithFullPath(taskTree).map(task => {
                    // Join the task's ancestor entities into the path
                    const parentEntity = flatEntityTree.find(entity => entity.id == task.listId)
                    return {
                        ...task,
                        path: [...(parentEntity?.path || []), parentEntity, ...task.path].filter(isTruthy),
                    }
                })

                return [
                    ...flatTaskTree.map(task => ({
                        title: task.title,
                        icon: task.status,
                        breadcrumbs: truncatePath(task.path.map(entity => entity.title)),
                        id: task.id,
                        entityType: EntityType.Task,
                        route: '/home/' + task.id,
                        resultType: 'entity' as const,
                    })),
                    ...flatEntityTree.map(entity => ({
                        title: entity.title,
                        icon: entity.entityType,
                        breadcrumbs: truncatePath(entity.path.map(entity => entity.title)),
                        id: entity.id,
                        entityType: entity.entityType,
                        route: '/home/' + entity.id,
                        resultType: 'entity' as const,
                    })),
                ] satisfies EntityCommandPaletteSearchItem[]
            }),
        )
}
