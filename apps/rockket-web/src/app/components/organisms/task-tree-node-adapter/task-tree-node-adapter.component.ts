import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core'
import { Store } from '@ngrx/store'
import { EntityType, TaskFlattend, TaskPriority, TaskStatus } from '@rockket/commons'
import { distinctUntilChanged, ReplaySubject, switchMap, take } from 'rxjs'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { taskActions } from 'src/app/store/entities/task/task.actions'
import { UiTreeNodeWithControlls } from '../generic-tree/generic-tree.component'
import { taskTreeConfigInjectionToken } from '../task-tree/task-tree.component'

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
    config$ = inject(taskTreeConfigInjectionToken)

    // @TODO: Get rid of the store here
    constructor(private store: Store<AppState>, private loadingService: LoadingStateService) {}

    node!: UiTreeNodeWithControlls<TaskFlattend>
    node$ = new ReplaySubject<UiTreeNodeWithControlls<TaskFlattend>>(1)
    @Input({ required: true, alias: 'node' }) set nodeSetter(node: UiTreeNodeWithControlls<TaskFlattend>) {
        if (!node) return
        if (this.node === node) return

        this.node = node
        this.node$.next(node)
    }

    readonly taskMenuItems = getEntityMenuItemsMap(this.store)[EntityType.Task]

    isLoadingMap$ = this.loadingService.getEntitiesLoadingStateMap()

    isDescriptionExpanded$ = this.node$.pipe(
        distinctUntilChanged((a, b) => a.data.id == b.data.id),
        switchMap(node =>
            this.config$.pipe(switchMap(config => config.descriptionExpandedStore.listen(node.data.id))),
        ),
    )

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

    toggleDescriptionExpansion(id: string, isDescriptionExpanded: boolean) {
        this.config$.pipe(take(1)).subscribe(config => {
            config.descriptionExpandedStore.set(id, isDescriptionExpanded)
        })
    }
}
