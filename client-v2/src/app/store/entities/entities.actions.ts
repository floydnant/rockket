import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { EntityPreview } from 'src/app/fullstack-shared-models/entities.model'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { EntityCrudDto } from 'src/app/services/entities.service'

export type HttpServerErrorResponseWithData<T = { id: string }> = HttpServerErrorResponse & T

export const entitiesActions = createActionGroup({
    source: 'Entities',
    events: {
        'load previews': emptyProps(),
        'load previews success': props<{ previews: EntityPreview[] }>(),
        'load previews error': props<HttpServerErrorResponse>(),

        'load detail': props<EntityCrudDto>(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'load detail success': props<EntityCrudDto<{ entityDetail: Record<string, any> }>>(),
        'load detail error': props<HttpServerErrorResponseWithData>(),

        'open rename dialog': props<EntityCrudDto>(),
        'abort rename dialog': emptyProps(),
        //
        rename: props<EntityCrudDto<{ title: string; showToast?: boolean }>>(),
        'rename success': props<EntityCrudDto<{ title: string }>>(),
        'rename error': props<HttpServerErrorResponseWithData>(),

        'open delete dialog': props<EntityCrudDto>(),
        'abort delete dialog': emptyProps(),
        //
        delete: props<EntityCrudDto>(),
        'delete success': props<EntityCrudDto>(),
        'delete error': props<HttpServerErrorResponseWithData>(),
    },
})
