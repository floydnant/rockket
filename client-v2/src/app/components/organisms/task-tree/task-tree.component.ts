import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { BehaviorSubject, combineLatestWith, map, merge, scan, shareReplay, switchMap, tap } from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import {
    TaskPreviewFlattend,
    TaskPreviewRecursive,
    TaskPriority,
    TaskStatus,
} from 'src/app/fullstack-shared-models/task.model'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { flattenTaskTree } from 'src/app/store/entities/utils'
import { useTaskForActiveItems } from 'src/app/utils/menu-item.helpers'
import { getLoadingUpdates } from 'src/app/utils/store.helpers'

export interface TaskTreeNode {
    taskPreview: TaskPreviewFlattend
    hasChildren: boolean
    isExpanded: boolean
    path: string[]
}

export const convertToTaskTreeNode = (task: TaskPreviewFlattend): TaskTreeNode => {
    return {
        taskPreview: task,
        hasChildren: task.childrenCount > 0,
        isExpanded: true,
        path: task.path,
    }
}

@Component({
    selector: 'app-task-tree',
    templateUrl: './task-tree.component.html',
    styleUrls: ['./task-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeComponent {
    constructor(private store: Store<AppState>, private actions$: Actions) {}

    tasks$ = new BehaviorSubject<TaskPreviewRecursive[] | null>(null)
    @Input() set tasks(tasks: TaskPreviewRecursive[]) {
        this.tasks$.next(tasks)
    }

    flattendTaskTree$ = this.tasks$.pipe(
        map(tasks => {
            if (!tasks) return []
            const treeNodes = flattenTaskTree(tasks).map(convertToTaskTreeNode)
            return treeNodes
        })
    )

    uiChangeEvents = new BehaviorSubject<{ id: string; isExpanded: boolean } | null>(null)
    toggleExpansion(node: TaskTreeNode, isExpanded: boolean) {
        this.uiChangeEvents.next({ id: node.taskPreview.id, isExpanded })
    }

    treeWithUiChanges!: TaskTreeNode[]
    treeWithUiChanges$ = this.flattendTaskTree$.pipe(
        combineLatestWith(this.uiChangeEvents),
        map(([taskNodes, changeEvent]) => {
            if (!changeEvent) return taskNodes

            const taskNodeIndex = taskNodes.findIndex(task => task.taskPreview.id == changeEvent.id)
            const taskNode = taskNodes[taskNodeIndex]

            if (taskNode) {
                // @TODO: Can we find a better solution for this? Perhaps force angular to rerender?
                // Create a new object reference for change detection to kick in
                taskNodes[taskNodeIndex] = { ...taskNode, isExpanded: changeEvent.isExpanded }
            }

            return taskNodes
        }),
        tap(taskNodes => {
            this.treeWithUiChanges = taskNodes
        })
    )

    private getParentNode(node: TaskTreeNode) {
        const nodeIndex = this.treeWithUiChanges.indexOf(node)

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (this.treeWithUiChanges[i].path.length === node.path.length - 1) {
                return this.treeWithUiChanges[i]
            }
        }

        return null
    }
    shouldRender(node: TaskTreeNode) {
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
    getPreviousNode(index: number) {
        const prevNode = this.treeWithUiChanges[index - 1]
        if (!prevNode) return null
        return prevNode
    }

    private readonly taskMenuItems = getEntityMenuItemsMap(this.store)[EntityType.TASK]

    menuItemsMap$ = this.flattendTaskTree$.pipe(
        map(flattendTree => {
            const menuItemEntries = flattendTree.map(({ taskPreview }) => {
                const menuItems = this.taskMenuItems.map(useTaskForActiveItems(taskPreview))

                return [taskPreview.id, menuItems] as const
            })
            return Object.fromEntries(menuItemEntries)
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    isLoadingMap$ = this.flattendTaskTree$.pipe(
        switchMap(taskNodes => {
            const entryObservables = taskNodes.map(taskNode => {
                const id = taskNode.taskPreview.id

                const isLoading$ = getLoadingUpdates(
                    this.actions$,
                    [
                        entitiesActions.rename,
                        entitiesActions.renameSuccess,
                        entitiesActions.renameError,

                        entitiesActions.delete,
                        entitiesActions.deleteSuccess,
                        entitiesActions.deleteError,

                        // taskActions.create,
                        // taskActions.createSuccess,
                        // taskActions.createError,

                        taskActions.updateDescription,
                        taskActions.updateDescriptionSuccess,
                        taskActions.updateDescriptionError,

                        taskActions.updateStatus,
                        taskActions.updateStatusSuccess,
                        taskActions.updateStatusError,

                        taskActions.updatePriority,
                        taskActions.updatePrioritySuccess,
                        taskActions.updatePriorityError,
                    ],
                    action => action.id == id
                )

                return isLoading$.pipe(map(isLoading => ({ id, isLoading })))
            })
            return merge(...entryObservables)
        }),
        scan((acc, { id, isLoading }) => {
            return {
                ...acc,
                [id]: isLoading,
            }
        }, {} as Record<string, boolean>),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    onTitleChange(id: string, title: string) {
        this.store.dispatch(entitiesActions.rename({ id, title, entityType: EntityType.TASK }))
    }
    onDescriptionChange(id: string, newDescription: string) {
        this.store.dispatch(taskActions.updateDescription({ id, newDescription }))
    }
    onStatusChange(id: string, status: TaskStatus) {
        this.store.dispatch(taskActions.updateStatus({ id, status }))
    }
    onPriorityChange(id: string, priority: TaskPriority) {
        this.store.dispatch(taskActions.updatePriority({ id, priority }))
    }
}
