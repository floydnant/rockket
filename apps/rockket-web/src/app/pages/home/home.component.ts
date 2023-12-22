import { ArrayDataSource } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { Action } from '@ngrx/store/src/models'
import { combineLatestWith, map, tap } from 'rxjs'
import { MenuService } from 'src/app/components/templates/sidebar-layout/menu.service'
import { MenuItem } from 'src/app/dropdown/drop-down/drop-down.component'
import { EntityPreviewFlattend, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreview } from 'src/app/fullstack-shared-models/task.model'
import { DeviceService } from 'src/app/services/device.service'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { UiStateService } from 'src/app/services/ui-state.service'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { entitiesSelectors } from 'src/app/store/entities/entities.selectors'
import { listActions } from 'src/app/store/entities/list/list.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { flattenEntityTreeIncludingTasks, traceEntityIncludingTasks } from 'src/app/store/entities/utils'
import { useTaskForActiveItems } from 'src/app/utils/menu-item.helpers'

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
        expandable: (childrenCount || 0) > 0,
        isExpanded: false,
        menuItems: [],
    }
    return node
}

@UntilDestroy()
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    constructor(
        private store: Store<AppState>,
        private loadingService: LoadingStateService,
        private deviceService: DeviceService,
        private menuService: MenuService,
        private uiStateService: UiStateService
    ) {}

    EntityType = EntityType

    // @TODO: lets have a look at this again when socket integration is ready
    shouldFetchSubcription = this.deviceService.shouldFetch$.pipe(untilDestroyed(this)).subscribe(index => {
        if (index == 0) {
            this.store.dispatch(entitiesActions.loadPreviews())
            this.store.dispatch(taskActions.loadTaskPreviews())
            return
        }

        this.store.dispatch(entitiesActions.reloadPreviews())
        this.store.dispatch(taskActions.reloadTaskPreviews())
    })

    isMobileScreen$ = this.deviceService.isMobileScreen$

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

    // changes are automatically reflected here, since it always stays the same object identity
    entityExpandedMap = this.uiStateService.sidebarUiState.entityExpandedMap
    toggleExpansion(node: EntityTreeNode) {
        node.isExpanded = !node.isExpanded
        this.uiStateService.toggleSidebarEntity(node.id, node.isExpanded)
    }

    range(number: number) {
        return new Array(number)
    }

    // @TODO: Add trackByFn to improve UX + Performance

    entityPreviewsTransformed: EntityTreeNode[] = []
    entityPreviewsTransformed$ = this.store
        .select(state => state.entities.entityTree)
        .pipe(
            combineLatestWith(this.store.select(entitiesSelectors.taskTreeMap)),
            map(([entityTree, taskTreeMap]) => {
                // @TODO: come up with a better solution for this
                // NOTE: using `ActivatedRoute` doesn't work in here either
                const segments = location.pathname.split('/')
                const activeId = segments[segments.length - 1]

                if (!entityTree) return []

                const flattendEntityTree = flattenEntityTreeIncludingTasks(entityTree, taskTreeMap || {})
                const treeNodes = flattendEntityTree.map(convertToEntityTreeNode)

                const [, ...entityTraceWithoutActive] = traceEntityIncludingTasks(
                    entityTree,
                    taskTreeMap || {},
                    activeId
                ).reverse()

                return treeNodes.map<EntityTreeNode>(node => {
                    const isContainedInTrace = entityTraceWithoutActive.some(entity => entity.id == node.id)
                    return {
                        ...node,
                        isExpanded: this.entityExpandedMap.get(node.id) || isContainedInTrace,
                        menuItems: this.nodeMenuItemsMap[node.entityType].map(
                            useTaskForActiveItems(node as EntityTreeNode & TaskPreview)
                        ),
                    }
                })
            }),
            tap(transformed => (this.entityPreviewsTransformed = transformed))
        )
    private readonly nodeMenuItemsMap = getEntityMenuItemsMap(this.store)

    isTreeLoading$ = this.loadingService.getLoadingState([
        entitiesActions.loadPreviews,
        entitiesActions.loadPreviewsSuccess,
        entitiesActions.loadPreviewsError,
    ])

    isSelected: Record<string, boolean> = {}
    nodeLoadingMap$ = this.loadingService.getEntitiesLoadingStateMap()

    dataSource = new ArrayDataSource(this.entityPreviewsTransformed$)
    treeControl = new FlatTreeControl<EntityTreeNode>(
        node => node.path.length,
        node => node.expandable
    )

    createNewList(parentListId?: string) {
        this.store.dispatch(listActions.createTaskList({ parentListId }))
    }
    createChild(id: string, entityType: EntityType) {
        const machine: Record<EntityType, Action> = {
            [EntityType.TASKLIST]: listActions.createTaskList({ parentListId: id }),
            [EntityType.TASK]: taskActions.create({ parentTaskId: id }),
        }
        this.store.dispatch(machine[entityType])
    }

    closeMobileMenu() {
        this.menuService.isMenuOpen$.next(false)
    }
}
