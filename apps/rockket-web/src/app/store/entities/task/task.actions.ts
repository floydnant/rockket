import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { CreateTaskDto, Task, TaskPriority, TaskStatus } from '@rockket/commons'
import { HttpServerErrorResponse, HttpServerErrorResponseWithMeta } from 'src/app/http/types'

export const taskActions = createActionGroup({
    source: 'Entity/Tasks',
    events: {
        'load task previews': emptyProps(),
        'reload task previews': emptyProps(),
        'load task previews success': props<{ previews: Task[] }>(),
        'load task previews error': props<HttpServerErrorResponse>(),

        'load root level tasks': props<{ listId: string }>(),
        'load root level tasks success': props<{ listId: string; tasks: Task[] }>(),
        'load root level tasks error': props<HttpServerErrorResponseWithMeta>(),

        create: props<Partial<CreateTaskDto>>(),
        'create success': props<{ createdTask: Task }>(),
        'create error': props<HttpServerErrorResponseWithMeta>(),

        'update status': props<{ id: string; status: TaskStatus }>(),
        'update status success': props<{ id: string; status: TaskStatus; listId: string }>(),
        'update status error': props<HttpServerErrorResponseWithMeta>(),

        'update priority': props<{ id: string; priority: TaskPriority }>(),
        'update priority success': props<{ id: string; priority: TaskPriority; listId: string }>(),
        'update priority error': props<HttpServerErrorResponseWithMeta>(),

        'update description': props<{ id: string; newDescription: string }>(),
        'update description success': props<{ id: string; newDescription: string; listId: string }>(),
        'update description error': props<HttpServerErrorResponseWithMeta>(),
    },
})
