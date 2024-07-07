import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core'
import { Store } from '@ngrx/store'
import { EntityType, NULL_PARENT, allowedParentEntitiesMap, isTruthy, valuesOf } from '@rockket/commons'
import { escapeForRegEx } from '@tiptap/core'
import {
    BehaviorSubject,
    ReplaySubject,
    Subject,
    combineLatest,
    distinctUntilChanged,
    filter,
    first,
    fromEvent,
    map,
    merge,
    of,
    scan,
    shareReplay,
    startWith,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs'
import { EntityMenuItemData } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import {
    flattenEntityTreeWithFullPath,
    flattenTaskTreeWithFullPath,
    getEntityById,
    getTaskById,
    visitDescendants,
} from 'src/app/store/entities/utils'
import { isNotNullish } from 'src/app/utils'
import { IconKey } from '../../atoms/icons/icon/icons'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

type Result = {
    id: string | null
    entityType: EntityType | null
    title: string
    icon: IconKey
    path: string[]
}

const buildEntityMatcher = (query: string) => {
    const regex = new RegExp(escapeForRegEx(query), 'i')
    return (entity: { title: string }) => regex.test(entity.title)
}

@UntilDestroy()
@Component({
    selector: 'app-entity-parent-selector',
    templateUrl: './entity-parent-selector.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'app-overlay',
    },
})
export class EntityParentSelectorComponent {
    constructor(
        private store: Store<AppState>,
        public dialogRef: DialogRef,
        @Inject(DIALOG_DATA) private data: EntityMenuItemData,
    ) {}

    @ViewChild('list') resultsList?: ElementRef<HTMLUListElement>
    listScrollPadding = 8

    searchQuery$ = new ReplaySubject<string>()
    allowedParentEntityTypes$ = new BehaviorSubject<EntityType[]>([EntityType.TASKLIST, EntityType.TASK])

    onMoveSelection$ = new Subject<'up' | 'down'>()

    searchableContent$ = this.store
        .select(state => state.entities)
        .pipe(
            map(entitiesState => {
                const taskTree = valuesOf(entitiesState.taskTreeMap || {}).flat()

                const allowedParentEntityTypes = allowedParentEntitiesMap[this.data.entityType]
                const forbiddenParentIds = [this.data.id]

                if (this.data.entityType == EntityType.TASK) {
                    const task = getTaskById(taskTree, this.data.id)
                    if (task?.children)
                        visitDescendants(task.children, child => forbiddenParentIds.push(child.id))
                } else {
                    const entity = getEntityById(entitiesState.entityTree || [], this.data.id)
                    if (entity?.children)
                        visitDescendants(entity.children, child => forbiddenParentIds.push(child.id))
                    if (!entity?.parentId) {
                        forbiddenParentIds.push(NULL_PARENT)
                    }
                }

                const flatEntityTree = flattenEntityTreeWithFullPath(entitiesState.entityTree || [])

                const flatTaskTree = allowedParentEntityTypes.includes(EntityType.TASK)
                    ? flattenTaskTreeWithFullPath(taskTree).map(task => {
                          // Join the task's ancestor entities into the path
                          const parentEntity = flatEntityTree.find(entity => entity.id == task.listId)
                          return {
                              ...task,
                              path: [...(parentEntity?.path || []), parentEntity, ...task.path].filter(
                                  isTruthy,
                              ),
                          }
                      })
                    : []

                return {
                    entitiesState,
                    flatEntityTree,
                    flatTaskTree,
                    allowedParentEntityTypes,
                    forbiddenParentIds,
                }
            }),
        )

    results$ = combineLatest([this.searchQuery$.pipe(map(v => v.trim())), this.searchableContent$]).pipe(
        map(
            ([searchQuery, { flatEntityTree, flatTaskTree, allowedParentEntityTypes, forbiddenParentIds }]):
                | Result[]
                | null => {
                if (!searchQuery) return null

                const matchEntity = buildEntityMatcher(searchQuery)
                const nonTaskEntityResults = flatEntityTree
                    .filter(entity => {
                        return (
                            !forbiddenParentIds.includes(entity.id) &&
                            allowedParentEntityTypes.includes(entity.entityType) &&
                            matchEntity(entity)
                        )
                    })
                    .map<Result>(entity => ({
                        ...entity,
                        icon: entity.entityType,
                        path:
                            entity.path.length < 3
                                ? entity.path.map(entity => entity.title)
                                : [entity.path[0].title, '...', entity.path.at(-1)!.title],
                    }))
                const taskResults = flatTaskTree
                    .filter(task => !forbiddenParentIds.includes(task.id) && matchEntity(task))
                    .map<Result>(task => {
                        return {
                            ...task,
                            icon: task.status,
                            entityType: EntityType.TASK,
                            path:
                                task.path.length < 3
                                    ? task.path.map(entity => entity.title)
                                    : [task.path[0].title, '...', task.path.at(-1)!.title],
                        }
                    })

                const extraResults = [] as Result[]
                if (
                    allowedParentEntityTypes.includes(NULL_PARENT) &&
                    !forbiddenParentIds.includes(NULL_PARENT) &&
                    (matchEntity({ title: 'No Parent' }) || matchEntity({ title: 'Root' }))
                ) {
                    extraResults.push({
                        title: 'No Parent',
                        entityType: null,
                        icon: 'blocking',
                        id: null,
                        path: [],
                    })
                }

                return [...extraResults, ...taskResults, ...nonTaskEntityResults]
            },
        ),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    selectedIndex$ = this.results$.pipe(
        switchMap(results => {
            const resultCount = results?.length || 0

            return merge(
                this.onMoveSelection$,
                fromEvent(document, 'mousemove').pipe(
                    withLatestFrom(this.onMouseEnter$),
                    map(([_, index]) => index),
                ),
            ).pipe(
                scan<'up' | 'down' | number, [index: number | null, shouldScroll: boolean]>(
                    ([selectedIndex], kbdMoveOrMousePoint) => {
                        if (typeof kbdMoveOrMousePoint == 'number') return [kbdMoveOrMousePoint, false]

                        if (resultCount == 0) return [null, false]
                        if (selectedIndex == null) {
                            if (kbdMoveOrMousePoint == 'down') return [0, true]
                            return [resultCount - 1, true]
                        }

                        if (kbdMoveOrMousePoint == 'down')
                            return [Math.min(selectedIndex + 1, resultCount - 1), true]
                        return [Math.max(selectedIndex - 1, 0), true]
                    },
                    [null, false],
                ),
                startWith([null, false] as const),
            )
        }),
        distinctUntilChanged(),
        tap(([selectedIndex, shouldScrollIntoView]) => {
            const listElem = this.resultsList?.nativeElement
            if (selectedIndex === null || !listElem) return

            const selectedElem = listElem.children[selectedIndex]
            if (!selectedElem) return

            for (let i = 0; i < listElem.children.length; i++) {
                const elem = listElem.children[i]
                if (elem == selectedElem) selectedElem.classList.add('selected')
                else elem.classList.remove('selected')
            }

            if (!shouldScrollIntoView) return

            const listRect = listElem.getBoundingClientRect()
            const rect = selectedElem.getBoundingClientRect()

            // If the element is not visible in the current scrolled view of the `listElem` we need to scroll it into view
            if (rect.top < listRect.top + this.listScrollPadding)
                selectedElem?.scrollIntoView({ block: 'start' })
            if (rect.bottom > listRect.bottom - this.listScrollPadding)
                selectedElem?.scrollIntoView({ block: 'end' })
        }),
        map(([selectedIndex]) => selectedIndex),
        shareReplay({ bufferSize: 1, refCount: true }),
        untilDestroyed(this),
    )
    private selectionSubscription = this.selectedIndex$.subscribe()

    onClick$ = new Subject<number | void>()
    onMouseEnter$ = new ReplaySubject<number>()

    private _onCommitParentSubscription = this.onClick$
        .pipe(
            switchMap(index => {
                if (isNotNullish(index)) return of(index)

                return this.selectedIndex$.pipe(first(), filter(isNotNullish))
            }),
            switchMap(index => {
                return this.results$.pipe(
                    first(),
                    map(results => results?.[index]),
                )
            }),
            filter(isTruthy),
            untilDestroyed(this),
        )
        .subscribe(newParent => {
            this.close()
            this.store.dispatch(
                entitiesActions.move({
                    id: this.data.id,
                    entityType: this.data.entityType,
                    newParentId: newParent.id,
                    newParentEntityType: newParent.entityType,
                }),
            )
        })

    onKeydown(event: KeyboardEvent) {
        if (event.key == 'ArrowDown') {
            this.onMoveSelection$.next('down')
            event.preventDefault()
        }
        if (event.key == 'ArrowUp') {
            this.onMoveSelection$.next('up')
            event.preventDefault()
        }
        if (event.key == 'Enter') {
            this.onClick$.next()
            event.preventDefault()
        }
    }

    close() {
        this.dialogRef.close()
    }
}
