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
import { CommandPalletteComponent } from 'src/app/command-pallette/command-pallette.component'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { DialogService } from 'src/app/modal/dialog.service'
import { environment } from 'src/environments/environment'
import { AppState } from '../store'
import { flattenEntityTreeWithFullPath, flattenTaskTreeWithFullPath } from '../store/entities/utils'

// @TODO: move this somewhere shared
const truncatePath = <T>(path: T[]): (T | '...')[] => {
    return path.length < 3 ? path : [path[0], '...', path.at(-1)!]
}

export type CommandPalletteContext = {
    enter(data: CommandPalletteItem): void
    items$: Observable<CommandPalletteItem[]>
    preserveSearchQuery: boolean
    renderItemsOnEmptySearchQuery: boolean
    placeholder: string
    width: number
    maxHeight: number
}

export type CommandPalletteItem = {
    title: string
    icon?: IconKey
    breadcrumbs?: string[]
    keywords?: string[]
    keepOpen?: boolean
}

export type CommandPalletteResult<T extends CommandPalletteItem> =
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
export class CommandPalletteService {
    constructor(
        private overlayService: DialogService,
        private store: Store<AppState>,
        private router: Router,
    ) {}

    // @TODO: connect this to a proper keybinding mechanism
    private _keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(e => {
        if (e.key === 'k' && e.metaKey) {
            this.navigateToSelectedEntity()
        }
    })

    selectEntity(options?: { keepOpen?: boolean }) {
        return this.searchableEntityCommandPalletteItems$.pipe(
            first(),
            switchMap(items => {
                const ref = this.openCommandPallette({
                    prompt: 'Search for stuff',
                    items,
                    keepOpen: options?.keepOpen,
                })
                return ref.result$
            }),
            map(res => {
                if (res.type == 'selected') return res.result

                return null
            }),
        )
    }

    navigateToSelectedEntity() {
        this.selectEntity().subscribe(entity => {
            if (!entity) return

            this.router.navigateByUrl(`/home/${entity.id}`)
        })
    }

    launchCommandPaletteDemo() {
        this.selectEntity({ keepOpen: true })
            .pipe(
                switchMap(entity => {
                    if (!entity) return of(null)

                    const result$ = this.openCommandPallette({
                        prompt: 'What should we do with this?',
                        items: [
                            { title: 'Second command pallette for: ' + entity.title, action: () => {} },
                            { title: 'With followup options for: ' + entity.title, action: () => {} },
                        ],
                        renderItemsOnEmptySearchQuery: true,
                    })
                    return result$.result$.pipe(
                        map(res => {
                            console.log('second command pallette returned', res)
                            if (res.type == 'selected') res.result.action()
                        }),
                    )
                }),
            )
            .subscribe()
    }

    private commandPalletteContext$ = new ReplaySubject<CommandPalletteContext>(1)

    /**
     * Fired when `openCommandPallette()` is called, but there is already an active
     * command pallette, so we want to focus it in case the focus got lost somehow.
     */
    onShouldFocusPallette$ = new Subject<void>()

    private dialogRef: DialogRef | null = null
    openCommandPallette<T extends CommandPalletteItem>(options: {
        items: T[] | Observable<T[]>
        prompt: string

        /**
         * Keep the command pallette open after a result was returned.
         * This is useful for nested command pallettes. I.e. so that the next
         * context can claim the pallette and reuse the dom (w/o flickering).
         *
         * Most of the time, you probably want to specify this option on the item level.
         */
        keepOpen?: boolean
        /**
         * If there is already a command pallette open, it's search query gets cleared by default.
         * This option prevents that.
         */
        preserveSearchQuery?: boolean
        /**
         * Whether to render the items although the search query is empty (e.g. on first render)
         *
         * Note: avoid this option if you have a lot of items.
         */
        renderItemsOnEmptySearchQuery?: boolean

        // @TODO: option to allow committing the command pallette without a selected item (returns the search query instead)
    }) {
        const enter$ = new Subject<CommandPalletteItem>()

        const palletteWidth = 600
        const palletteMaxHeight = 350
        this.commandPalletteContext$.next({
            enter: selectedItem => enter$.next(selectedItem),
            items$: isObservable(options.items) ? options.items : of(options.items),
            preserveSearchQuery: options?.preserveSearchQuery || false,
            renderItemsOnEmptySearchQuery: options?.renderItemsOnEmptySearchQuery || false,
            placeholder: options.prompt,
            width: palletteWidth,
            maxHeight: palletteMaxHeight,
        })

        if (this.dialogRef && this.dialogRef?.overlayRef.hasAttached()) {
            if (!environment.isProduction) console.warn('CommandPallette is already open')
            this.onShouldFocusPallette$.next()
        } else {
            this.dialogRef = this.overlayService.showDialog<unknown, unknown>(
                CommandPalletteComponent,
                this.commandPalletteContext$,
                {
                    width: palletteWidth,
                    maxHeight: palletteMaxHeight,
                },
            )
        }
        // `commandPalletteContext$` is a ReplaySubject(1), so we need to skip the first value
        this.dialogRef.closed.pipe(takeUntil(this.commandPalletteContext$.pipe(skip(1)))).subscribe(() => {
            this.dialogRef = null
        })

        const result$ = enter$.pipe(
            first(),
            map((result): CommandPalletteResult<T> => {
                const keptOpen = Boolean(result && (result.keepOpen || options?.keepOpen))

                if (result) return { keptOpen, result: result as T, type: 'selected' }
                return { keptOpen, result: undefined, type: 'dismissed' }
            }),
            // `commandPalletteContext$` is a ReplaySubject(1), so we need to skip the first value
            takeUntil(this.commandPalletteContext$.pipe(skip(1))),
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

    private searchableEntityCommandPalletteItems$ = this.store
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
                        entityType: EntityType.TASK,
                    })),
                    ...flatEntityTree.map(entity => ({
                        title: entity.title,
                        icon: entity.entityType,
                        breadcrumbs: truncatePath(entity.path.map(entity => entity.title)),
                        id: entity.id,
                        entityType: entity.entityType,
                    })),
                ] satisfies CommandPalletteItem[]
            }),
        )
}
