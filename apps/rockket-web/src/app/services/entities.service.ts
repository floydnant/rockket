import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpService } from '../http/http.service'
import { HttpSuccessResponse } from '../http/types'
import { EntitiesSearchResultDto, EntityPreview, EntityType } from '../fullstack-shared-models/entities.model'
import { ListService } from './entity.services/list.service'
import { TaskService } from './entity.services/task.service'

// @TODO: we should contraint the dtos further
export interface EntityService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create(dto: Record<string, any>): Observable<Record<string, any>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update(id: string, dto: Record<string, any>): Observable<Record<string, any>>

    delete(id: string): Observable<HttpSuccessResponse>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadDetail(id: string): Observable<Record<string, any>>
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntityServiceConstructor = new (...args: any[]) => EntityService

export type EntityServiceInjectorMap = typeof entityServiceInjectorMap
export type EntityServiceInstanceMap = {
    [key in keyof EntityServiceInjectorMap]: InstanceType<EntityServiceInjectorMap[key]>
}

const entityServiceInjectorMap = {
    [EntityType.TASKLIST]: ListService,
    [EntityType.TASK]: TaskService,
} // satisfies Record<EntityType, EntityServiceConstructor> // @TODO: upgrade to typescript@4.9 => angular@15

export const getEntityServiceInjector = <T extends EntityType>(entityType: T): EntityServiceInjectorMap[T] => {
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
        })
    ) as EntityServiceInstanceMap

    injectEntityService<T extends EntityType>(entityType: T) {
        return this.entityServices[entityType]
    }

    getEntityPreviews() {
        return this.http.get<EntityPreview[]>('/entities')
    }

    loadDetail({ entityType, id }: EntityCrudDto) {
        return this.injectEntityService(entityType).loadDetail(id)
    }
    rename({ entityType, id, title }: EntityCrudDto<{ title: string }>) {
        return this.injectEntityService(entityType).update(id, { title })
    }
    delete({ entityType, id }: EntityCrudDto) {
        return this.injectEntityService(entityType).delete(id)
    }

    search(query: string) {
        return this.http.get<EntitiesSearchResultDto>(`/entities/search?q=${query}`)
    }
}
