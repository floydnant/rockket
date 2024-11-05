import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import {
    EntityType,
    keysOf,
    TaskFlattend,
    TaskPriority,
    TaskRecursive,
    TaskStatus,
    TaskStatusGroup,
    taskStatusGroupMap,
} from '@rockket/commons'
import {
    BehaviorSubject,
    combineLatestWith,
    filter,
    map,
    ReplaySubject,
    shareReplay,
    Subject,
    tap,
} from 'rxjs'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { UiStateService, ViewSettings } from 'src/app/services/ui-state.service'
import { uiDefaults } from 'src/app/shared/defaults'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { flattenTaskTree } from 'src/app/store/entities/utils'
import { useTaskForActiveItems } from 'src/app/utils/menu-item.helpers'
import { groupItemsRecursive, flattenTree } from 'src/app/utils/tree.helpers'
import {
    groupingStrategies,
    NOOP_GROUP_KEY,
    TaskGroupKey,
} from '../entity-view/shared/view-settings/task-grouping-strategies'
import { sortingStrategies } from '../entity-view/shared/view-settings/task-sorting-strategies'
import { mapGroupsToUiTreeNodes, UiTreeNode } from '../generic-tree/generic-tree.component'
import { TaskGroupTreeNodeComponent, TaskGroup } from '../task-group-tree-node/task-group-tree-node.component'
import { TaskTreeNodeAdapterComponent } from '../task-tree-node-adapter/task-tree-node-adapter.component'

export interface TaskTreeNode {
    taskPreview: TaskFlattend
    hasChildren: boolean
    isExpanded: boolean
    isDescriptionExpanded: boolean
    path: string[]
}

export const convertToTaskTreeNode = (task: TaskFlattend, expand?: boolean): TaskTreeNode => {
    return {
        taskPreview: task,
        hasChildren: (task.children?.length || 0) > 0,
        isExpanded: expand ?? uiDefaults.mainView.IS_TASK_EXPANDED,
        isDescriptionExpanded: expand ?? uiDefaults.mainView.IS_TASK_DESCRIPTION_EXPANDED,
        path: task.path,
    }
}

@UntilDestroy()
@Component({
    selector: 'app-task-tree',
    templateUrl: './task-tree.component.html',
    styleUrls: ['./task-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeComponent {
    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private loadingService: LoadingStateService,
        private uiState: UiStateService,
    ) {}

    tasks$ = new ReplaySubject<TaskRecursive[] | null>(1)
    @Input({ required: true }) set tasks(tasks: TaskRecursive[]) {
        this.tasks$.next(tasks)
    }

    viewSettings$ = new ReplaySubject<ViewSettings>(1)
    @Input({ required: true }) set viewSettings(viewSettings: ViewSettings) {
        this.viewSettings$.next(viewSettings)
    }

    @Input({ required: true }) parentId!: string
    @Input() highlightQuery = ''
    @Input() expandAll?: boolean
    @Input() readonly = false

    onClosedTask$ = this.actions$
        .pipe(
            ofType(taskActions.updateStatusSuccess),
            filter(action => taskStatusGroupMap[action.status] == TaskStatusGroup.Closed),
            map(action => action.id),
            untilDestroyed(this),
        )
        .subscribe(id => {
            // @TODO:
            // this.toggleDescriptionExpansion({ taskPreview: { id } }, false)
            this.setIsExpanded(id, false)
        })

    expandedMap = this.uiState.mainViewUiState.entityExpandedMap
    updateExpandedMapStorage() {
        this.uiState.updateMainViewStorage()
    }
    isExpandedIfUnset = uiDefaults.mainView.IS_TASK_EXPANDED
    expandedMapDidChange$ = new Subject<void>()
    setIsExpanded(id: string, isExpanded: boolean) {
        this.expandedMap.set(id, isExpanded)
        this.expandedMapDidChange$.next()
        this.uiState.updateMainViewStorage()
    }

    // @TODO:
    // descriptionExpandedMap = this.uiStateService.mainViewUiState.taskTreeDescriptionExpandedMap
    // toggleDescriptionExpansion(node: { taskPreview: { id: string } }, isDescriptionExpanded: boolean) {
    //     this.uiStateService.toggleTaskDescription(node.taskPreview.id, isDescriptionExpanded)
    // }

    nodes$ = this.tasks$.pipe(
        combineLatestWith(this.viewSettings$),
        map(([tasks, viewSettings]) => {
            if (!tasks) return []

            // @TODO: do we need the spread here?                                v
            const sortedTasks = sortingStrategies[viewSettings.sorting].sorter([...tasks])
            const selectedGroupingStrategy = groupingStrategies[viewSettings.grouping]
            const groupedTasks = groupItemsRecursive(sortedTasks, (task, level) => {
                if (!viewSettings.groupRecursive && level > 0) return NOOP_GROUP_KEY

                return selectedGroupingStrategy.groupBy(task)
            })
            const groupKeys = keysOf(selectedGroupingStrategy.groups || {}) as TaskGroupKey[]

            const flattenedNodes = flattenTree(
                mapGroupsToUiTreeNodes(
                    groupedTasks,
                    TaskTreeNodeAdapterComponent,
                    TaskGroupTreeNodeComponent,
                    (key, parentId) => {
                        const groups = selectedGroupingStrategy.groups as Record<string, TaskGroup> | null
                        if (!groups) return null
                        if (key == NOOP_GROUP_KEY) return null

                        return {
                            id: parentId + '.group-' + key,
                            label: groups[key]?.label,
                            icon: groups[key]?.icon,
                        }
                    },
                    this.parentId + '-root',
                    0,
                    (a, b) => groupKeys.indexOf(a) - groupKeys.indexOf(b),
                ),
            ) satisfies UiTreeNode<Record<string, unknown>>[]

            for (const node of flattenedNodes) {
                node.indentationOffset = node.path.filter(id => id.includes('group')).length * -1
            }

            return flattenedNodes
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////

    // flattendTaskTree$ = this.tasks$.pipe(
    //     // @TODO: this is running too often, we should only run this when the tasks change
    //     map(tasks => {
    //         if (!tasks) return []

    //         const treeNodes = flattenTaskTree(tasks).map(task => {
    //             const treeNode = convertToTaskTreeNode(task, this.expandAll)

    //             // treeNode.isExpanded =
    //             //     this.expandAll ??
    //             //     this.entityExpandedMap.get(task.id) ??
    //             //     uiDefaults.mainView.IS_TASK_EXPANDED
    //             treeNode.isDescriptionExpanded =
    //                 (task.description ? this.expandAll : null) ??
    //                 this.descriptionExpandedMap.get(task.id) ??
    //                 uiDefaults.mainView.IS_TASK_DESCRIPTION_EXPANDED

    //             return treeNode
    //         })
    //         return treeNodes
    //     }),
    // )

    // uiChangeEvents = new BehaviorSubject<{
    //     id: string
    //     key: 'isExpanded' | 'isDescriptionExpanded'
    //     value: boolean
    // } | null>(null)

    // descriptionExpandedMap = this.uiStateService.mainViewUiState.taskTreeDescriptionExpandedMap
    // toggleDescriptionExpansion(node: { taskPreview: { id: string } }, isDescriptionExpanded: boolean) {
    //     this.uiChangeEvents.next({
    //         id: node.taskPreview.id,
    //         key: 'isDescriptionExpanded',
    //         value: isDescriptionExpanded,
    //     })

    //     this.uiStateService.toggleTaskDescription(node.taskPreview.id, isDescriptionExpanded)
    // }

    // entityExpandedMap = this.uiStateService.mainViewUiState.entityExpandedMap
    // toggleExpansion(node: { taskPreview: { id: string } }, isExpanded: boolean) {
    //     this.uiChangeEvents.next({ id: node.taskPreview.id, key: 'isExpanded', value: isExpanded })

    //     this.uiStateService.toggleMainViewEntity(node.taskPreview.id, isExpanded)
    // }

    // treeWithUiChanges!: TaskTreeNode[]
    // treeWithUiChanges$ = this.flattendTaskTree$.pipe(
    //     // @TODO: these events should be debounced/coalesced
    //     combineLatestWith(this.uiChangeEvents),
    //     map(([taskNodes, changeEvent]) => {
    //         if (!changeEvent) return taskNodes

    //         const taskNodeIndex = taskNodes.findIndex(task => task.taskPreview.id == changeEvent.id)
    //         const taskNode = taskNodes[taskNodeIndex]

    //         if (taskNode) {
    //             // @TODO: Can we find a better solution for this? Perhaps force angular to rerender?
    //             // Create a new object reference for change detection to kick in
    //             taskNodes[taskNodeIndex] = { ...taskNode, [changeEvent.key]: changeEvent.value }
    //         }

    //         return taskNodes
    //     }),
    //     tap(taskNodes => {
    //         this.treeWithUiChanges = taskNodes
    //     }),
    // )

    // private getParentNode(node: TaskTreeNode) {
    //     const nodeIndex = this.treeWithUiChanges.indexOf(node)

    //     for (let i = nodeIndex - 1; i >= 0; i--) {
    //         if (this.treeWithUiChanges[i].path.length === node.path.length - 1) {
    //             return this.treeWithUiChanges[i]
    //         }
    //     }

    //     return null
    // }
    // shouldRender(node: TaskTreeNode) {
    //     let parent = this.getParentNode(node)

    //     while (parent) {
    //         if (!parent.isExpanded) return false

    //         parent = this.getParentNode(parent)
    //     }
    //     return true
    // }

    // trackByFn(_index: number, { taskPreview: { id } }: TaskTreeNode) {
    //     return id
    // }

    // range(number: number) {
    //     return new Array(number).fill(null).map((_, index) => index)
    // }
    // private getNextVisibleNode(index: number, node: TaskTreeNode) {
    //     let nextNode: TaskTreeNode = node
    //     while (!this.shouldRender(nextNode)) {
    //         nextNode = this.treeWithUiChanges[++index]
    //     }
    //     return nextNode
    // }
    // private getNodeAt(index: number, nextVisibleNode = false): TaskTreeNode | undefined {
    //     const node = this.treeWithUiChanges[index]

    //     if (nextVisibleNode && !this.shouldRender(node)) {
    //         return this.getNextVisibleNode(index, node)
    //     }

    //     return node
    // }

    // /** Whether the given indentation line is the FIRST in it's hierarchy */
    // isFirstInHierarchy(nodeIndex: number, lineIndex: number, nodeLevel: number) {
    //     const previousNode = this.getNodeAt(nodeIndex - 1)
    //     const previousNodeLevel = previousNode?.path?.length || 0

    //     return previousNodeLevel + lineIndex < nodeLevel
    // }
    // /** Whether the given indentation line is the LAST in it's hierarchy */
    // isLastInHierarchy(nodeIndex: number, lineIndex: number, nodeLevel: number) {
    //     const nextNode = this.getNodeAt(nodeIndex + 1, true)
    //     const nextNodeLevel = nextNode?.path?.length || 0

    //     return nextNodeLevel + lineIndex < nodeLevel
    // }

    // // @OUTSOURCE
    // private readonly taskMenuItems = getEntityMenuItemsMap(this.store)[EntityType.Task]
    // menuItemsMap$ = this.flattendTaskTree$.pipe(
    //     map(flattendTree => {
    //         const menuItemEntries = flattendTree.map(({ taskPreview }) => {
    //             const menuItems = this.taskMenuItems.map(useTaskForActiveItems(taskPreview))

    //             return [taskPreview.id, menuItems] as const
    //         })
    //         return Object.fromEntries(menuItemEntries)
    //     }),
    //     shareReplay({ bufferSize: 1, refCount: true }),
    // )

    // // @OUTSOURCE
    // isLoadingMap$ = this.loadingService.getEntitiesLoadingStateMap(action =>
    //     this.flattendTaskTree$.pipe(map(tasks => tasks.some(task => task.taskPreview.id == action.id))),
    // )

    // onTitleChange(id: string, title: string) {
    //     this.store.dispatch(entitiesActions.rename({ id, title, entityType: EntityType.Task }))
    // }
    // onDescriptionChange(id: string, newDescription: string) {
    //     this.store.dispatch(taskActions.updateDescription({ id, newDescription }))
    // }
    // onStatusChange(id: string, status: TaskStatus) {
    //     this.store.dispatch(taskActions.updateStatus({ id, status }))
    // }
    // onPriorityChange(id: string, priority: TaskPriority) {
    //     this.store.dispatch(taskActions.updatePriority({ id, priority }))
    // }
}
