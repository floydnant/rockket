import { Injectable } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { catchError, first, map, mergeMap, of, switchMap } from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskService } from 'src/app/services/entity.services/task.service'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { AppState } from '../..'
import { getTaskById } from '../utils'
import { taskActions } from './task.actions'

@Injectable()
export class TaskEffects {
    constructor(
        private actions$: Actions,
        private taskService: TaskService,
        private toast: HotToastService,
        private store: Store<AppState>,
    ) {}

    loadTaskPreviews = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.loadTaskPreviews, taskActions.reloadTaskPreviews),
            mergeMap(() => {
                const res$ = this.taskService.loadAllTaskPreviews()

                return res$.pipe(
                    map(tasks => taskActions.loadTaskPreviewsSuccess({ previews: tasks })),
                    catchError(err => {
                        this.toast.error('Failed to load task previews.')
                        return of(taskActions.loadTaskPreviewsError({ ...err }))
                    }),
                )
            }),
        )
    })

    loadRootLevelTasks = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.loadRootLevelTasks),
            mergeMap(({ listId: id }) => {
                const res$ = this.taskService.loadRootLevelTasks(id)

                return res$.pipe(
                    map(tasks => taskActions.loadRootLevelTasksSuccess({ listId: id, tasks })),
                    catchError(err => {
                        this.toast.error('Failed to load tasks for this list.')
                        return of(taskActions.loadRootLevelTasksError({ ...err, id }))
                    }),
                )
            }),
        )
    })

    createTask = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.create),
            mergeMap(({ listId, ...dto }) => {
                const title = dto.title || ENTITY_TITLE_DEFAULTS[EntityType.TASK]

                if (!listId && !dto.parentTaskId) throw new Error('Must specify a listId or a parentTaskId')

                const listId$ = listId
                    ? of(listId)
                    : this.store
                          .select(state => state.entities)
                          .pipe(
                              first(),
                              map(({ taskTreeMap }) => {
                                  const taskTree = Object.values(taskTreeMap || []).flat()
                                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                  const task = getTaskById(taskTree, dto.parentTaskId!)
                                  return task?.listId as string
                              }),
                          )

                const res$ = listId$.pipe(
                    switchMap(listId => this.taskService.create({ ...dto, listId, title })),
                )

                const task = dto.parentTaskId ? 'Subtask' : 'Task'

                return res$.pipe(
                    this.toast.observe({
                        loading: `Creating ${task}...`,
                        success: `Created ${task} '${title}'`,
                        error: getMessageFromHttpError,
                    }),
                    map(createdTask => taskActions.createSuccess({ createdTask })),
                    catchError(err =>
                        of(taskActions.createError({ ...err, id: listId || dto.parentTaskId })),
                    ),
                )
            }),
        )
    })

    updateDescription = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.updateDescription),
            mergeMap(({ id, newDescription }) => {
                const res$ = this.taskService.update(id, { description: newDescription })

                return res$.pipe(
                    map(() => taskActions.updateDescriptionSuccess({ id, newDescription })),
                    catchError(err => {
                        this.toast.error('Failed to update the newDescription of this task.')
                        return of(taskActions.updateDescriptionError({ ...err, id }))
                    }),
                )
            }),
        )
    })

    updateStatus = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.updateStatus),
            mergeMap(({ id, status }) => {
                const res$ = this.taskService.update(id, { status })

                return res$.pipe(
                    this.toast.observe({
                        // Success: `Updated status to ${status}`,
                        error: 'Failed to update the status of this task.',
                    }),
                    map(() => taskActions.updateStatusSuccess({ id, status })),
                    catchError(err => of(taskActions.updateStatusError({ ...err, id }))),
                )
            }),
        )
    })

    updatePriority = createEffect(() => {
        return this.actions$.pipe(
            ofType(taskActions.updatePriority),
            mergeMap(({ id, priority }) => {
                const res$ = this.taskService.update(id, { priority })

                return res$.pipe(
                    map(() => taskActions.updatePrioritySuccess({ id, priority })),
                    catchError(err => {
                        this.toast.error('Failed to update the priority of this task.')
                        return of(taskActions.updatePriorityError({ ...err, id }))
                    }),
                )
            }),
        )
    })
}
