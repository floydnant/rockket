import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { CreateTasklistDto, TaskList, TasklistPreview } from 'src/app/models/task.model'

export const listActions = createActionGroup({
    source: 'Task/Lists',
    events: {
        'load list previews': emptyProps(),
        'load list previews success': props<{ previews: TasklistPreview[] }>(),
        'load list previews error': props<HttpServerErrorResponse>(),

        'create task list': props<CreateTasklistDto>(),
        'create task list success': props<{ createdList: TaskList }>(),
        'create task list error': props<HttpServerErrorResponse>(),
    },
})
