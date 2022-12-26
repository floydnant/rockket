import { ArrayDataSource } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map, startWith, switchMap, tap } from 'rxjs'
import { EntityType } from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { MenuItem, MenuItemVariant } from 'src/app/components/molecules/drop-down/drop-down.component'
import { AppState } from 'src/app/store'
import { listActions } from 'src/app/store/task/task.actions'
import { flattenListTree, TasklistFlattend, traceTaskList } from 'src/app/store/task/utils'
import { moveToMacroQueue } from 'src/app/utils'
import { getLoadingUpdates } from 'src/app/utils/store.helpers'

export interface EntityTreeNode {
    id: string
    name: string
    path: string[] // <-- level: path.length
    expandable: boolean

    isExpanded?: boolean
    entityType?: EntityType
}

export const convertToEntityTreeNode = (list: TasklistFlattend): EntityTreeNode => {
    const { childrenCount, ...rest } = list
    const node: EntityTreeNode = {
        ...rest,
        expandable: childrenCount > 0,

        isExpanded: rest.path.length < 2,
        entityType: EntityType.TASKLIST,
    }
    return node
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    constructor(private store: Store<AppState>, private actions$: Actions, private route: ActivatedRoute) {}

    ngOnInit(): void {
        moveToMacroQueue(() => this.store.dispatch(listActions.loadListPreviews()))
    }

    getParentNode(node: EntityTreeNode) {
        const nodeIndex = this.listPreviewsTransformed.indexOf(node)

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (this.listPreviewsTransformed[i].path.length === node.path.length - 1) {
                return this.listPreviewsTransformed[i]
            }
        }

        return null
    }

    shouldRender(node: EntityTreeNode) {
        let parent = this.getParentNode(node)
        while (parent) {
            if (!parent.isExpanded) {
                return false
            }
            parent = this.getParentNode(parent)
        }
        return true
    }

    range(number: number) {
        return new Array(number)
    }

    listPreviewsTransformed: EntityTreeNode[] = []
    listPreviewsTransformed$ = this.store
        .select(state => state.task.listPreviews)
        .pipe(
            switchMap(tree => {
                return this.route.url.pipe(
                    startWith(),
                    map(() => tree)
                )
            }),
            map(entityTree => {
                // @TODO: come up with a better solution for this
                // NOTE: using `ActivatedRoute` doesn't work in here either
                const segments = location.pathname.split('/')
                const activeId = segments[segments.length - 1]

                if (!entityTree) return []

                const treeNodes = flattenListTree(entityTree).map(convertToEntityTreeNode)
                const [, ...entityTraceWithoutActive] = traceTaskList(entityTree, activeId).reverse()

                return treeNodes.map(node => {
                    const isContainedInTrace = entityTraceWithoutActive.some(entity => entity.id == node.id)
                    return {
                        ...node,
                        isExpanded: node.isExpanded || isContainedInTrace,
                    }
                })
            }),
            tap(transformed => (this.listPreviewsTransformed = transformed))
        )

    isTreeLoading$ = getLoadingUpdates(this.actions$, [
        listActions.loadListPreviews,
        listActions.loadListPreviewsSuccess,
        listActions.loadListPreviewsError,
    ])

    dataSource = new ArrayDataSource(this.listPreviewsTransformed$)
    treeControl = new FlatTreeControl<EntityTreeNode>(
        node => node.path.length,
        node => node.expandable
    )

    createNewList(parentListId?: string) {
        this.store.dispatch(listActions.createTaskList({ parentListId }))
    }
    renameList(id: string) {
        this.store.dispatch(listActions.renameListDialog({ id }))
    }
    duplicateList(id: string) {
        this.store.dispatch(listActions.duplicateList({ id }))
    }
    deleteList(id: string) {
        this.store.dispatch(listActions.deleteListDialog({ id }))
    }

    nodeMenuItems: MenuItem[] = [
        {
            title: 'Rename',
            action: (id: string) => this.renameList(id),
        },
        {
            title: 'Create new list inside',
            action: (id: string) => this.createNewList(id),
        },
        {
            title: 'Duplicate',
            action: (id: string) => this.duplicateList(id),
        },
        { isSeperator: true },
        {
            title: 'Delete',
            variant: MenuItemVariant.DANGER,
            action: (id: string) => this.deleteList(id),
        },
    ]

    EntityType = EntityType
}
