import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { CreateTasklistDto, TasklistPreview } from 'src/app/models/task.model'

export const listActions = createActionGroup({
    source: 'Task/Lists',
    events: {
        'load list previews': emptyProps(),
        'load list previews success': props<{ previews: TasklistPreview[] }>(),
        'load list previews error': emptyProps(),

        'create task list': props<CreateTasklistDto>(),
    },
})
