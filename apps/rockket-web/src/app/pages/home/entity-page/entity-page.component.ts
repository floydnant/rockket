import { Location } from '@angular/common'
import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { EntityPreviewRecursive, EntityType, Task } from '@rockket/commons'
import { combineLatestWith, map, of, shareReplay, switchMap } from 'rxjs'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { TaskMenuItemData, getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { traceEntity, traceEntityIncludingTasks } from 'src/app/store/entities/utils'
import { useDataForAction, useParamsForRoute, useTaskForActiveItems } from 'src/app/utils/menu-item.helpers'

@UntilDestroy()
@Component({
    selector: 'app-entity-page',
    templateUrl: './entity-page.component.html',
    styleUrls: ['./entity-page.component.css'],
})
export class EntityPageComponent {
    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private loadingService: LoadingStateService,
        private location: Location,
    ) {}

    entityOptionsMap = getEntityMenuItemsMap(this.store)
    entityOptionsMap$ = of(this.entityOptionsMap)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeEntityId$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('id')!))

    activeEntityTrace$ = this.activeEntityId$.pipe(
        switchMap(activeId => {
            return this.store
                .select(state => state.entities)
                .pipe(
                    map(({ entityTree, taskTreeMap }) => {
                        // @TODO: how do we check if the entity is loading or if the request was not even sent yet?
                        if (!entityTree) return null

                        // Const isActiveTaskLoading = taskLoadingMap[activeId] as boolean | undefined
                        // if (!isActiveTaskLoading) {
                        //     this.store.dispatch(Load the given task)
                        //     return null
                        // }

                        if (!taskTreeMap) return traceEntity(entityTree, activeId)

                        return traceEntityIncludingTasks(entityTree, taskTreeMap, activeId)
                    }),
                )
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    activeEntity$ = this.activeEntityTrace$.pipe(map(trace => trace?.[trace.length - 1]))

    breadcrumbs$ = this.activeEntityTrace$.pipe(
        combineLatestWith(
            this.loadingService.getEntitiesLoadingStateMap(action =>
                this.activeEntityTrace$.pipe(
                    map(tasks => tasks?.some(task => task.id == action.id) || false),
                ),
            ),
        ),
        map(([trace, loadingMap]) =>
            trace?.map<Breadcrumb>(({ entityType, ...entity }) => {
                const loadingIcon: false | IconKey = loadingMap[entity.id] && 'Loading'
                const statusIcon = (entity as EntityPreviewRecursive & Pick<Task, 'status'>).status

                let contextMenuItems: Breadcrumb['contextMenuItems']

                if (entityType == EntityType.TASK) {
                    const taskEntity: TaskMenuItemData = {
                        ...(entity as EntityPreviewRecursive & Task),
                        entityType,
                    }

                    // @TODO: we must add the data for the tasks in the dropdown
                    contextMenuItems = this.entityOptionsMap[entityType].applyOperators(
                        useDataForAction(taskEntity),
                        useTaskForActiveItems(taskEntity as EntityPreviewRecursive & Task),
                        useParamsForRoute({ id: entity.id }),
                    )
                } else
                    contextMenuItems = this.entityOptionsMap[entityType].applyOperators(
                        useDataForAction({ id: entity.id, entityType: entityType as EntityType }),
                        useParamsForRoute({ id: entity.id }),
                    )

                return {
                    title: entity.title,
                    icon: loadingIcon || statusIcon || entityType,
                    route: `/home/${entity.id}`,
                    contextMenuItems: contextMenuItems,
                    contextMenuItemData: { ...entity, entityType },
                }
            }),
        ),
    )

    goBack() {
        this.location.back()
    }
}
