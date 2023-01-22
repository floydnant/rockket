import { ArrayDataSource } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map, tap } from 'rxjs'
import { MenuItem } from 'src/app/components/molecules/drop-down/drop-down.component'
import { EntityPreviewFlattend, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions, listActions } from 'src/app/store/entities/entities.actions'
import { flattenEntityTree, traceEntity } from 'src/app/store/entities/utils'
import { moveToMacroQueue } from 'src/app/utils'
import { getLoadingUpdates } from 'src/app/utils/store.helpers'

export interface EntityTreeNode {
    id: string
    title: string
    path: string[] // <-- level: path.length
    expandable: boolean

    isExpanded: boolean
    entityType: EntityType

    menuItems: MenuItem[]
}

export const convertToEntityTreeNode = (entity: EntityPreviewFlattend): EntityTreeNode => {
    const { childrenCount, ...restEntity } = entity
    const node: EntityTreeNode = {
        ...restEntity,

        expandable: childrenCount > 0,
        isExpanded: restEntity.path.length < 2,
        menuItems: [],
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

    EntityType = EntityType

    ngOnInit(): void {
        moveToMacroQueue(() => this.store.dispatch(entitiesActions.loadPreviews()))
    }

    getParentNode(node: EntityTreeNode) {
        const nodeIndex = this.entityPreviewsTransformed.indexOf(node)

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (this.entityPreviewsTransformed[i].path.length === node.path.length - 1) {
                return this.entityPreviewsTransformed[i]
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

    entityPreviewsTransformed: EntityTreeNode[] = []
    entityPreviewsTransformed$ = this.store
        .select(state => state.entities.entityTree)
        .pipe(
            map(entityTree => {
                // @TODO: come up with a better solution for this
                // NOTE: using `ActivatedRoute` doesn't work in here either
                const segments = location.pathname.split('/')
                const activeId = segments[segments.length - 1]

                if (!entityTree) return []

                const treeNodes = flattenEntityTree(entityTree).map(convertToEntityTreeNode)
                const [, ...entityTraceWithoutActive] = traceEntity(entityTree, activeId).reverse()

                return treeNodes.map<EntityTreeNode>(node => {
                    const isContainedInTrace = entityTraceWithoutActive.some(entity => entity.id == node.id)
                    return {
                        ...node,
                        isExpanded: node.isExpanded || isContainedInTrace,
                        menuItems: this.nodeMenuItemsMap[node.entityType],
                    }
                })
            }),
            tap(transformed => (this.entityPreviewsTransformed = transformed))
        )

    isTreeLoading$ = getLoadingUpdates(this.actions$, [
        entitiesActions.loadPreviews,
        entitiesActions.loadPreviewsSuccess,
        entitiesActions.loadPreviewsError,
    ])

    dataSource = new ArrayDataSource(this.entityPreviewsTransformed$)
    treeControl = new FlatTreeControl<EntityTreeNode>(
        node => node.path.length,
        node => node.expandable
    )

    createNewList(parentListId?: string) {
        this.store.dispatch(listActions.createTaskList({ parentListId }))
    }

    nodeMenuItemsMap = getEntityMenuItemsMap(this.store)
}
