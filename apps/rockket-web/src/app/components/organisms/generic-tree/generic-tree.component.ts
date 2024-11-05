import { ChangeDetectionStrategy, Component, Input, Output, Type } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { entriesOf } from '@rockket/commons'
import {
    distinctUntilChanged,
    EMPTY,
    filter,
    map,
    mergeWith,
    Observable,
    of,
    ReplaySubject,
    shareReplay,
    Subject,
} from 'rxjs'
import { debugObserver } from 'src/app/utils/observable.helpers'
import { GroupedItem } from 'src/app/utils/tree.helpers'

class ExpandedMapProxy {
    constructor(
        private collapsedEntities: Set<string>,
        private onWeUpdated$: Subject<string>,
        private onTheyUpdated$: Subject<string>,
        private cacheObservables = true,
    ) {}

    private selfNotifier$ = new Subject<string>()

    get(id: string) {
        const isExpanded = !this.collapsedEntities.has(id)
        return isExpanded
    }

    private observables = new Map<string, Observable<boolean>>()
    listen(id: string) {
        const cachedObservable = this.cacheObservables && this.observables.get(id)
        if (cachedObservable) return cachedObservable

        const isExpanded$ = of(id).pipe(
            mergeWith(this.selfNotifier$),
            mergeWith(this.onTheyUpdated$),
            filter(updatedId => updatedId == id),
            map(() => this.get(id)),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: true }),
        )
        if (this.cacheObservables) this.observables.set(id, isExpanded$)

        return isExpanded$
    }

    set(id: string, isExpanded: boolean, notifySelf = false) {
        if (this.get(id) == isExpanded) return

        if (isExpanded) {
            this.collapsedEntities.delete(id)
        } else {
            this.collapsedEntities.add(id)
        }

        if (notifySelf) {
            this.selfNotifier$.next(id)
        }
        this.onWeUpdated$.next(id)
    }
}

// const collapsedEntities = new Set<string>()
// const onWeUpdated$ = new Subject<string>()
// const onTheyUpdate$ = new Subject<string>()
// onTheyUpdate$.subscribe(id => console.log('they updated', id))

// const expandedMapProxy = new ExpandedMapProxy(collapsedEntities, onTheyUpdate$, onWeUpdated$)
// // expandedMapProxy.get('1')
// expandedMapProxy.set('1', false, true)
// const yeah = expandedMapProxy.listen('1').subscribe(yes => console.log('isExpanded', yes))

// expandedMapProxy.set('1', true, true)
// expandedMapProxy.set('1', true, true)

// expandedMapProxy.listen('1').subscribe(yes => console.log('isExpanded 2', yes))
// expandedMapProxy.set('1', true, true)
// expandedMapProxy.set('1', true, true)
// yeah.unsubscribe()

type AnyRecord = Record<string, unknown>

export type UiTreeNode<T extends Record<string, unknown>> = {
    id: string
    component: Type<{ data: T }>
    data: T
    path: string[]
    hasChildren: boolean
    indentationOffset?: number
}

export type UiTreeNodeWithControlls<T extends Record<string, unknown>> = UiTreeNode<T> & {
    expandedMap: { get: (id: string) => boolean }
    expandedMap$: Observable<{ get: (id: string) => boolean }>
    shouldRender$: Observable<boolean>
    setExpanded: (isExpanded: boolean) => void
}

export type IntermediateUiTreeNode = Omit<UiTreeNode<Record<string, unknown>>, 'path'> & {
    children: IntermediateUiTreeNode[]
}

export const mapGroupsToUiTreeNodes = <
    TItem extends { id: string; children: TItem[] | null },
    TGroupKey extends string | number | symbol,
    TGroupData extends { id: string },
>(
    groupedTree: Record<TGroupKey, GroupedItem<TItem, TGroupKey>[]>,
    itemComponent: Type<{
        // @TODO:
        data: Partial<TItem>
    }>,
    groupComponent: Type<{ data: TGroupData }>,
    // @TODO: Put a NoInfer around TGroupData here
    getGroupData: (key: TGroupKey, parentId: string | undefined) => TGroupData | null,
    parentId?: string,
    indentationOffset = 0,
    sortGroups?: (a: TGroupKey, b: TGroupKey) => number,
): IntermediateUiTreeNode[] => {
    const entries = entriesOf(groupedTree)
    const sorted = sortGroups ? entries.sort(([a], [b]) => sortGroups(a, b)) : entries

    return sorted.flatMap(([groupKey, items]) => {
        const children = items.map(
            (item): IntermediateUiTreeNode => ({
                id: item.id,
                component: itemComponent,
                data: item,
                hasChildren: Boolean(item.children?.length),
                children: mapGroupsToUiTreeNodes(
                    item.grouped,
                    itemComponent,
                    groupComponent,
                    getGroupData,
                    item.id,
                    indentationOffset - 1,
                    sortGroups,
                ),
                indentationOffset: indentationOffset - 1,
            }),
        )

        const groupData = getGroupData(groupKey, parentId)
        if (!groupData) return children

        return {
            id: groupData.id,
            component: groupComponent,
            data: groupData,
            hasChildren: Boolean(items.length),
            children: children,
            indentationOffset: -1,
        }
    })
}

const range = (number: number) => {
    return Array.from({ length: number }, (_, index) => index)
}

@UntilDestroy()
@Component({
    selector: 'app-tree',
    templateUrl: './generic-tree.component.html',
    styleUrls: ['./generic-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTreeComponent {
    @Input({ required: true }) expandedMap!: Map<string, boolean>
    @Input() expandedMapDidChange$?: Observable<unknown>

    /** Whether a node should be expanded by default if the `expandedMap` doesn't contain an entry for it. */
    @Input() expandedIfUnset = true
    @Input() enableIndentLineGradient = true

    nodes$ = new ReplaySubject<UiTreeNode<AnyRecord>[]>(1)
    nodes!: UiTreeNode<AnyRecord>[]
    @Input({ required: true, alias: 'nodes' }) set nodesSetter(nodes: UiTreeNode<AnyRecord>[]) {
        this.nodes = nodes
        this.nodes$.next(nodes)
    }

    @Output('nodeToggle') nodeToggleEvents$ = new Subject<{ id: string; isExpanded: boolean }>()

    setIsExpanded(node: { id: string }, isExpanded: boolean) {
        this.expandedMap.set(node.id, isExpanded)
        this.nodeToggleEvents$.next({ id: node.id, isExpanded })
    }
    getIsExpanded(id: string) {
        return this.expandedMap.get(id) ?? this.expandedIfUnset
    }

    expandedMapProxy = { get: (id: string) => this.getIsExpanded(id) }
    expandedMapProxy$ = of(null).pipe(
        mergeWith(this.expandedMapDidChange$ || EMPTY),
        mergeWith(this.nodeToggleEvents$),
        map(() => this.expandedMapProxy),
        // @TODO: we probably don't need to share this
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    nodesWithControlls$ = this.nodes$.pipe(
        map(nodes => {
            return nodes.map((node, nodeIndex) => {
                const shouldRender$ = of(null).pipe(
                    mergeWith(this.expandedMapDidChange$ || EMPTY),
                    mergeWith(this.nodeToggleEvents$),
                    map(() => this.shouldRender(node)),
                )

                const linesCount = Math.max(node.path.length + (node.indentationOffset || 0), 0)
                const linesArr = range(linesCount).reverse()

                const lines$ = shouldRender$.pipe(
                    map(shouldRender => {
                        return linesArr.map(lineIndex => ({
                            index: lineIndex,
                            isFirstInHierarchy:
                                shouldRender &&
                                this.enableIndentLineGradient &&
                                this.isFirstInHierarchy(nodeIndex, lineIndex, linesArr.length),
                            isLastInHierarchy:
                                shouldRender &&
                                this.enableIndentLineGradient &&
                                this.isLastInHierarchy(nodeIndex, lineIndex, linesArr.length),
                        }))
                    }),
                )

                return {
                    ...node,
                    shouldRender$,
                    lines$,
                    expandedMap: this.expandedMapProxy,
                    expandedMap$: this.expandedMapProxy$,
                    setExpanded: isExpanded => this.setIsExpanded(node, isExpanded),
                } satisfies UiTreeNodeWithControlls<AnyRecord> & {
                    lines$: Observable<{ isFirstInHierarchy: boolean; isLastInHierarchy: boolean }[]>
                }
            })
        }),
        debugObserver('nodes'),
    )

    // @TODO: remove
    private getChildNodes(node: UiTreeNode<AnyRecord>) {
        const childNodes = []

        const nodeIndex = this.nodes.indexOf(node)
        for (let i = nodeIndex + 1; i < this.nodes.length; i++) {
            const nextNode = this.nodes[i]
            if (nextNode.path.length <= node.path.length) {
                break
            }

            childNodes.push(nextNode)
        }

        return childNodes
    }

    // @TODO: remove
    private getParentNode(node: UiTreeNode<AnyRecord>) {
        const nodeIndex = this.nodes.indexOf(node)

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (this.nodes[i].path.length == node.path.length - 1) {
                return this.nodes[i]
            }
        }

        return null
    }
    shouldRender(node: UiTreeNode<AnyRecord>) {
        for (let i = 0; i < node.path.length; i++) {
            if (!this.getIsExpanded(node.path[i])) {
                return false
            }
        }

        return true
    }

    nodeTrackByFn(_: number, { id }: UiTreeNode<AnyRecord>) {
        return id
    }
    indentLineTrackByFn(
        _: number,
        { index }: { index: number; isFirstInHierarchy: boolean; isLastInHierarchy: boolean },
    ) {
        return index
    }

    private getNodeOrNextVisible(index: number): UiTreeNode<AnyRecord> | undefined {
        let node = this.nodes[index]
        while (node && !this.shouldRender(node)) {
            node = this.nodes[++index]
        }

        return node
    }

    /** Whether the given indentation line is the FIRST in it's hierarchy */
    isFirstInHierarchy(nodeIndex: number, lineIndex: number, nodeLevel: number) {
        const previousNode = this.nodes[nodeIndex - 1]
        const previousNodeLevel = Math.max(
            0,
            (previousNode?.path.length || 0) + (previousNode?.indentationOffset || 0),
        )

        return previousNodeLevel + lineIndex < nodeLevel
    }
    /** Whether the given indentation line is the LAST in it's hierarchy */
    isLastInHierarchy(nodeIndex: number, lineIndex: number, nodeLevel: number) {
        const nextNode = this.getNodeOrNextVisible(nodeIndex + 1)
        const nextNodeLevel = Math.max(0, (nextNode?.path.length || 0) + (nextNode?.indentationOffset || 0))

        return nextNodeLevel + lineIndex < nodeLevel
    }
}
