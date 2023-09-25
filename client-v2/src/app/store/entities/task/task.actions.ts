import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { TaskPreview, CreateTaskDto, TaskStatus, TaskPriority } from 'src/app/fullstack-shared-models/task.model'
import { HttpServerErrorResponse, HttpServerErrorResponseWithMeta } from 'src/app/http/types'

export const taskActions = createActionGroup({
    source: 'Entity/Tasks',
    events: {
        'load task previews': emptyProps(),
        'reload task previews': emptyProps(),
        'load task previews success': props<{ previews: TaskPreview[] }>(),
        'load task previews error': props<HttpServerErrorResponse>(),

        'load root level tasks': props<{ listId: string }>(),
        'load root level tasks success': props<{ listId: string; tasks: TaskPreview[] }>(),
        'load root level tasks error': props<HttpServerErrorResponseWithMeta>(),

        create: props<Partial<CreateTaskDto>>(),
        'create success': props<{ createdTask: TaskPreview }>(),
        'create error': props<HttpServerErrorResponseWithMeta>(),

        'update status': props<{ id: string; status: TaskStatus }>(),
        'update status success': props<{ id: string; status: TaskStatus }>(),
        'update status error': props<HttpServerErrorResponseWithMeta>(),

        'update priority': props<{ id: string; priority: TaskPriority }>(),
        'update priority success': props<{ id: string; priority: TaskPriority }>(),
        'update priority error': props<HttpServerErrorResponseWithMeta>(),

        'update description': props<{ id: string; newDescription: string }>(),
        'update description success': props<{ id: string; newDescription: string }>(),
        'update description error': props<HttpServerErrorResponseWithMeta>(),
    },
})
