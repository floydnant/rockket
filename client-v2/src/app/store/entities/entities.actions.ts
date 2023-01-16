import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { TasklistPreview, CreateTasklistDto, TaskList } from 'src/app/fullstack-shared-models/list.model'
import { CreateTaskDto, TaskPreview, TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { EntityCrudDto } from 'src/app/services/entities.service'

export type HttpServerErrorResponseWithData<T = { id: string }> = HttpServerErrorResponse & T

export const entitiesActions = createActionGroup({
    source: 'Entities',
    events: {
        'load previews': emptyProps(),
        'load previews success': props<{ previews: TasklistPreview[] }>(),
        'load previews error': props<HttpServerErrorResponse>(),

        'load detail': props<EntityCrudDto>(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'load detail success': props<EntityCrudDto<{ entityDetail: Record<string, any> }>>(),
        'load detail error': props<HttpServerErrorResponseWithData>(),

        'open rename dialog': props<{ id: string }>(),
        'abort rename dialog': emptyProps(),
        //
        rename: props<{ id: string; title: string; showToast?: boolean }>(),
        'rename success': props<{ id: string; title: string }>(),
        'rename error': props<HttpServerErrorResponseWithData>(),

        'open delete dialog': props<{ id: string }>(),
        'abort delete dialog': emptyProps(),
        //
        delete: props<{ id: string }>(),
        'delete success': props<{ id: string }>(),
        'delete error': props<HttpServerErrorResponseWithData>(),
    },
})

export const listActions = createActionGroup({
    source: 'Entity/Lists',
    events: {
        'create task list': props<Partial<CreateTasklistDto>>(),
        'create task list success': props<{ createdList: TaskList }>(),
        'create task list error': props<HttpServerErrorResponse>(),

        'update description': props<{ id: string; newDescription: string }>(),
        'update description success': props<{ id: string; newDescription: string }>(),
        'update description error': props<HttpServerErrorResponseWithData>(),

        'duplicate list': props<{ id: string }>(),
        'duplicate list success': props<{ id: string }>(),
        'duplicate list error': props<{ id: string }>(),

        'export list': props<{ id: string }>(),
    },
})
