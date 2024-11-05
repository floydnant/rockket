import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { EntityType, TaskFlattend, TaskPriority, TaskStatus } from '@rockket/commons'
import { UiTreeNodeWithControlls } from '../generic-tree/generic-tree.component'
import { map, of, shareReplay } from 'rxjs'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { useTaskForActiveItems } from 'src/app/utils/menu-item.helpers'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { UiStateService } from 'src/app/services/ui-state.service'
import { AppState } from 'src/app/store'
import { debugObserver } from 'src/app/utils/observable.helpers'

@Component({
    selector: 'app-task-tree-node-adapter',
    templateUrl: './task-tree-node-adapter.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'block grow',
    },
})
export class TaskTreeNodeAdapterComponent {
    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private loadingService: LoadingStateService,
        private uiStateService: UiStateService,
    ) {}

    @Input({ required: true }) data!: TaskFlattend
    @Input({ required: true }) node!: UiTreeNodeWithControlls<TaskFlattend>

    readonly taskMenuItems = getEntityMenuItemsMap(this.store)[EntityType.Task]
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

    // this.descriptionExpandedMap.get(task.id) ??
    // uiDefaults.mainView.IS_TASK_DESCRIPTION_EXPANDED

    // @OUTSOURCE
    isLoadingMap$ = this.loadingService
        .getEntitiesLoadingStateMap /* action =>
        this.flattendTaskTree$.pipe(map(tasks => tasks.some(task => task.taskPreview.id == action.id))), */
        ()

    onTitleChange(id: string, title: string) {
        this.store.dispatch(entitiesActions.rename({ id, title, entityType: EntityType.Task }))
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

    isDescriptionExpanded$ = of(false)
    toggleDescriptionExpansion(id: string, isDescriptionExpanded: boolean) {
        // this.uiChangeEvents.next({
        //     id: node.taskPreview.id,
        //     key: 'isDescriptionExpanded',
        //     value: isDescriptionExpanded,
        // })

        this.uiStateService.toggleTaskDescription(id, isDescriptionExpanded)
    }
}
