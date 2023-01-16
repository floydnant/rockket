import { Injectable } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, map, mergeMap, of } from 'rxjs'
import { DialogService } from 'src/app/modal/dialog.service'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskService } from 'src/app/services/entity.services/task.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '..'
import { taskActions } from './entities.actions'

@Injectable()
export class TaskEffects {
    constructor(
        private actions$: Actions,
        private taskService: TaskService,
        private toast: HotToastService,
        private store: Store<AppState>,
        private dialogService: DialogService
    ) {}

    loadRootLevelTasks = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.loadRootLevelTasks),
            mergeMap(({ listId: id }) => {
                return this.taskService.loadRootLevelTasks(id).pipe(
                    map(tasks => taskActions.loadRootLevelTasksSuccess({ listId: id, tasks })),
                    catchError(err => {
                        this.toast.error('Failed to load tasks for this list.')
                        return of(taskActions.loadRootLevelTasksError({ ...err, id }))
                    })
                )
            })
        )
    })

    createTask = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.create),
            mergeMap(dto => {
                const title = dto.title || 'NEVER' // ENTITY_TITLE_DEFAULTS[EntityType.TASK]
                const res$ = this.taskService.create({ ...dto, title })

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Creating task...',
                        success: `Created task '${title}'`,
                        error: getMessageFromHttpError,
                    }),
                    map(task => taskActions.createSuccess(task)),
                    catchError(err => {
                        this.toast.error('Failed to create this task.')
                        return of(taskActions.createError({ ...err, id: dto.listId }))
                    })
                )
            })
        )
    })

    // @TODO: Refactor entity effects and all related stuff, to use `title` instead of `name`, thus making this effect obsolete
    renameTask = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.rename),
            mergeMap(({ id, newTitle }) => {
                return this.taskService.update(id, { title: newTitle }).pipe(
                    map(() => taskActions.renameSuccess({ id, newTitle })),
                    catchError(err => {
                        this.toast.error('Failed to rename this task.')
                        return of(taskActions.renameError({ ...err, id }))
                    })
                )
            })
        )
    })

    updateDescription = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.updateDescription),
            mergeMap(({ id, newDescription }) => {
                return this.taskService.update(id, { description: newDescription }).pipe(
                    map(() => taskActions.updateDescriptionSuccess({ id, newDescription })),
                    catchError(err => {
                        this.toast.error('Failed to update the newDescription of this task.')
                        return of(taskActions.updateDescriptionError({ ...err, id }))
                    })
                )
            })
        )
    })

    updateStatus = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.updateStatus),
            mergeMap(({ id, status }) => {
                return this.taskService.update(id, { status }).pipe(
                    map(() => taskActions.updateStatusSuccess({ id, status })),
                    catchError(err => {
                        this.toast.error('Failed to update the status of this task.')
                        return of(taskActions.updateStatusError({ ...err, id }))
                    })
                )
            })
        )
    })

    updatePriority = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.updatePriority),
            mergeMap(({ id, priority }) => {
                return this.taskService.update(id, { priority }).pipe(
                    map(() => taskActions.updatePrioritySuccess({ id, priority })),
                    catchError(err => {
                        this.toast.error('Failed to update the priority of this task.')
                        return of(taskActions.updatePriorityError({ ...err, id }))
                    })
                )
            })
        )
    })
}
