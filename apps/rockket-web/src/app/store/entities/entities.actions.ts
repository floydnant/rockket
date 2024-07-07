import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { EntitiesSearchResultDto, EntityEvent, EntityPreview, EntityType } from '@rockket/commons'
import { HttpServerErrorResponse, HttpServerErrorResponseWithMeta } from '../../http/types'
import { EntityCrudDto } from '../../services/entities.service'
import { listActions } from './list/list.actions'
import { taskActions } from './task/task.actions'

export const entitiesActions = createActionGroup({
    source: 'Entities',
    events: {
        'load previews': emptyProps(),
        'reload previews': emptyProps(),
        'load previews success': props<{ previews: EntityPreview[] }>(),
        'load previews error': props<HttpServerErrorResponse>(),

        'load detail': props<EntityCrudDto>(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'load detail success': props<EntityCrudDto<{ entityDetail: Record<string, any> }>>(),
        'load detail error': props<HttpServerErrorResponseWithMeta>(),

        'load events': props<EntityCrudDto>(),
        'load events success': props<EntityCrudDto<{ events: EntityEvent[] }>>(),
        'append events': props<EntityCrudDto<{ events: EntityEvent[] }>>(),
        'load events error': props<HttpServerErrorResponseWithMeta>(),

        'open rename dialog': props<EntityCrudDto>(),
        'abort rename dialog': emptyProps(),
        //
        rename: props<EntityCrudDto<{ title: string; showToast?: boolean }>>(),
        'rename success': props<EntityCrudDto<{ title: string }>>(),
        'rename error': props<HttpServerErrorResponseWithMeta>(),

        move: props<EntityCrudDto & { newParentId: string | null; newParentEntityType: EntityType | null }>(),
        'move success': props<
            EntityCrudDto & { newParentId: string | null; newParentEntityType: EntityType | null }
        >(),
        'move error': props<
            EntityCrudDto & { newParentId: string | null; newParentEntityType: EntityType | null }
        >(),

        'open delete dialog': props<EntityCrudDto>(),
        'abort delete dialog': emptyProps(),
        //
        delete: props<EntityCrudDto>(),
        'delete success': props<EntityCrudDto>(),
        'delete error': props<HttpServerErrorResponseWithMeta>(),

        search: props<{ query: string }>(),
        'search success': props<EntitiesSearchResultDto>(),
        'search error': props<{ query: string; error: HttpServerErrorResponse }>(),
    },
})

/** Entity actions which directly correspond to an entity, indicating a loading state */
export const loadingStateActions = [
    entitiesActions.loadDetail,
    entitiesActions.loadDetailSuccess,
    entitiesActions.loadDetailError,

    entitiesActions.rename,
    entitiesActions.renameSuccess,
    entitiesActions.renameError,

    entitiesActions.move,
    entitiesActions.moveSuccess,
    entitiesActions.moveError,

    entitiesActions.delete,
    entitiesActions.deleteSuccess,
    entitiesActions.deleteError,

    listActions.updateDescription,
    listActions.updateDescriptionSuccess,
    listActions.updateDescriptionError,

    // TaskActions.create,
    // taskActions.createSuccess,
    // taskActions.createError,

    taskActions.updateDescription,
    taskActions.updateDescriptionSuccess,
    taskActions.updateDescriptionError,

    taskActions.updateStatus,
    taskActions.updateStatusSuccess,
    taskActions.updateStatusError,

    taskActions.updatePriority,
    taskActions.updatePrioritySuccess,
    taskActions.updatePriorityError,
]
