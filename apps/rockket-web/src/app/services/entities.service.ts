import { inject, Injectable } from '@angular/core'
import {
    entitesSearchResultDtoSchema,
    EntityEvent,
    entityPreviewSchema,
    EntityType,
    fnNames,
} from '@rockket/commons'
import { Observable } from 'rxjs'
import { HttpService } from '../http/http.service'
import { parseWith } from '../http/http.utils'
import { HttpSuccessResponse } from '../http/types'
import { ListService } from './entity.services/list.service'
import { TaskService } from './entity.services/task.service'

// @TODO: Fix the types here
export interface EntityService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create(dto: Record<string, any>): Observable<Record<string, any>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update(id: string, dto: Record<string, any>): Observable<{ newEvents: EntityEvent[] }>

    delete(id: string): Observable<HttpSuccessResponse>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadDetail(id: string): Observable<Record<string, any>>

    loadEvents(id: string): Observable<EntityEvent[]>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntityServiceConstructor = new (...args: any[]) => EntityService

export type EntityServiceInjectorMap = typeof entityServiceInjectorMap
export type EntityServiceInstanceMap = {
    [key in keyof EntityServiceInjectorMap]: InstanceType<EntityServiceInjectorMap[key]>
}

const entityServiceInjectorMap = {
    [EntityType.Tasklist]: ListService,
    [EntityType.Task]: TaskService,
} satisfies Record<EntityType, EntityServiceConstructor>

export const getEntityServiceInjector = <T extends EntityType>(
    entityType: T,
): EntityServiceInjectorMap[T] => {
    return entityServiceInjectorMap[entityType]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntityCrudDto<T extends Record<string, any> = object> = {
    entityType: EntityType
    id: string
} & T

@Injectable({
    providedIn: 'root',
})
export class EntitiesService {
    constructor(private http: HttpService) {}

    private entityServices = Object.fromEntries(
        Object.entries(entityServiceInjectorMap).map(([entityType, injectionToken]) => {
            return [entityType, inject(injectionToken as EntityServiceConstructor)]
        }),
    ) as EntityServiceInstanceMap

    injectEntityService(entityType: EntityType): EntityService {
        return this.entityServices[entityType]
    }

    getEntityPreviews() {
        return this.http
            .get('/entities')
            .pipe(parseWith(entityPreviewSchema.array(), fnNames(EntitiesService, this.getEntityPreviews)))
    }

    loadDetail({ entityType, id }: EntityCrudDto) {
        return this.injectEntityService(entityType).loadDetail(id)
    }
    loadEvents({ entityType, id }: EntityCrudDto): Observable<EntityEvent[]> {
        return this.injectEntityService(entityType).loadEvents(id)
    }
    rename({ entityType, id, title }: EntityCrudDto<{ title: string }>) {
        return this.injectEntityService(entityType).update(id, { title })
    }
    move({
        entityType,
        id,
        newParentId,
        newParentEntityType,
    }: EntityCrudDto<{ newParentId: string | null; newParentEntityType: EntityType | null }>) {
        const machine = {
            [EntityType.Task]:
                newParentEntityType == EntityType.Task
                    ? { parentTaskId: newParentId }
                    : { listId: newParentId },

            [EntityType.Tasklist]: { parentListId: newParentId },
        } satisfies Record<EntityType, object>

        return this.injectEntityService(entityType).update(id, machine[entityType])
    }
    delete({ entityType, id }: EntityCrudDto) {
        return this.injectEntityService(entityType).delete(id)
    }

    search(query: string) {
        return this.http
            .get(`/entities/search?q=${query}`)
            .pipe(parseWith(entitesSearchResultDtoSchema, fnNames(EntitiesService, this.search)))
    }
}
