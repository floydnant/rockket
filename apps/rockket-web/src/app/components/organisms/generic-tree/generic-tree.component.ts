import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Injector,
    Input,
    Provider,
    StaticProvider,
    Type,
} from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { entriesOf } from '@rockket/commons'
import { map, mergeWith, Observable, of, ReplaySubject, shareReplay, startWith } from 'rxjs'
import { ReactiveStoreProxy } from 'src/app/services/ui-state.service'
import { GroupedItem } from 'src/app/utils/tree.helpers'

type AnyRecord = Record<string, unknown>

export type UiTreeNode<T extends Record<string, unknown>> = {
    id: string
    component: Type<{ node: UiTreeNodeWithControlls<T> }>
    data: T
    path: string[]
    hasChildren: boolean
    indentationOffset?: number
}

export type UiTreeNodeWithControlls<T extends Record<string, unknown>> = UiTreeNode<T> & {
    /** A store that knows if nodes are expanded or not. */
    expandedStore: ReactiveStoreProxy<string, boolean>
    shouldRender$: Observable<boolean>
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
    itemComponent: Type<{ node: UiTreeNodeWithControlls<TItem> }>,
    groupComponent: Type<{ node: UiTreeNodeWithControlls<TGroupData> }>,
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
    @Input({ required: true }) expandedStore!: ReactiveStoreProxy<string, boolean>
    @Input() enableIndentLineGradient = true

    nodes$ = new ReplaySubject<UiTreeNode<AnyRecord>[]>(1)
    nodes!: UiTreeNode<AnyRecord>[]
    @Input({ required: true, alias: 'nodes' }) set nodesSetter(nodes: UiTreeNode<AnyRecord>[]) {
        this.nodes = nodes
        this.nodes$.next(nodes)
    }

    nodesWithControlls$ = this.nodes$.pipe(
        map(nodes => {
            return nodes.map((node, nodeIndex) => {
                const shouldRender$ = of(null).pipe(
                    mergeWith(this.expandedStore.listenAll()),
                    map(() => this.shouldRender(node)),
                    shareReplay({ bufferSize: 1, refCount: true }),
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
                    expandedStore: this.expandedStore,
                } satisfies UiTreeNodeWithControlls<AnyRecord> & {
                    lines$: Observable<{ isFirstInHierarchy: boolean; isLastInHierarchy: boolean }[]>
                }
            })
        }),
    )

    providers$ = new ReplaySubject<(Provider | StaticProvider)[]>(1)
    @Input({ alias: 'treeNodeProviders' }) set providersSetter(providers: (Provider | StaticProvider)[]) {
        if (providers) this.providers$.next(providers)
    }
    private injector = inject(Injector)
    treeNodeInjector$ = this.providers$.pipe(
        map(providers => Injector.create({ parent: this.injector, providers })),
        startWith(this.injector),
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
            if (!this.expandedStore.get(node.path[i])) {
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
