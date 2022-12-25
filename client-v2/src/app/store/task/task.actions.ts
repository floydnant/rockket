import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { CreateTasklistDto, TaskList, TasklistPreview } from 'src/app/models/task.model'

export const listActions = createActionGroup({
    source: 'Task/Lists',
    events: {
        'load list previews': emptyProps(),
        'load list previews success': props<{ previews: TasklistPreview[] }>(),
        'load list previews error': props<HttpServerErrorResponse>(),

        'create task list': props<Partial<CreateTasklistDto>>(),
        'create task list success': props<{ createdList: TaskList }>(),
        'create task list error': props<HttpServerErrorResponse>(),

        'rename list dialog': props<{ id: string }>(),
        'rename list dialog abort': emptyProps(),
        //
        'rename list': props<{ id: string; newName: string }>(),
        'rename list success': props<{ id: string; newName: string }>(),
        'rename list error': props<HttpServerErrorResponse>(),

        'delete list dialog': props<{ id: string }>(),
        'delete list dialog abort': emptyProps(),
        //
        'delete list': props<{ id: string }>(),
        'delete list success': props<{ id: string }>(),
        'delete list error': props<HttpServerErrorResponse>(),

        'duplicate list': props<{ id: string }>(),
        'duplicate list success': props<{ id: string }>(),
        'duplicate list error': props<{ id: string }>(),
    },
})
