import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { combineLatestWith, filter, map, of, shareReplay, switchMap } from 'rxjs'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { EntityPreviewRecursive } from 'src/app/fullstack-shared-models/entities.model'
import { TaskPreview } from 'src/app/fullstack-shared-models/task.model'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { loadingStateActions } from 'src/app/store/entities/entities.actions'
import { traceEntity, traceEntityIncludingTasks } from 'src/app/store/entities/utils'
import { useDataForAction, useTaskForActiveItems } from 'src/app/utils/menu-item.helpers'
import { collectLoadingMap, interpretLoadingStates, makeLoadingMap } from 'src/app/utils/store.helpers'

@UntilDestroy()
@Component({
    selector: 'app-entity-page',
    templateUrl: './entity-page.component.html',
    styleUrls: ['./entity-page.component.css'],
})
export class EntityPageComponent {
    constructor(private store: Store<AppState>, private route: ActivatedRoute, private actions$: Actions) {}

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

                        // const isActiveTaskLoading = taskLoadingMap[activeId] as boolean | undefined
                        // if (!isActiveTaskLoading) {
                        //     this.store.dispatch(Load the given task)
                        //     return null
                        // }

                        if (!taskTreeMap) return traceEntity(entityTree, activeId)

                        return traceEntityIncludingTasks(entityTree, taskTreeMap, activeId)
                    })
                )
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    activeEntity$ = this.activeEntityTrace$.pipe(map(trace => trace?.[trace.length - 1]))

    breadcrumbs$ = this.activeEntityTrace$.pipe(
        combineLatestWith(
            this.actions$.pipe(
                ofType(...loadingStateActions),
                switchMap(action => {
                    return this.activeEntityTrace$.pipe(
                        filter(tasks => tasks?.some(task => task.id == action.id) || false),
                        map(() => action)
                    )
                }),
                interpretLoadingStates(),
                collectLoadingMap()
            )
        ),
        map(([trace, loadingMap]) =>
            trace?.map<Breadcrumb>((entity /* , index, { length } */) => {
                // @TODO: we should check if the primary loading spinner is visible, and only if not, enable spinner in last breadcrumb
                // const isLast = index == length - 1
                const loadingIcon: false | IconKey = /* !isLast && */ loadingMap[entity.id] && 'Loading'
                const statusIcon = (entity as EntityPreviewRecursive & Pick<TaskPreview, 'status'>).status

                return {
                    title: entity.title,
                    icon: loadingIcon || statusIcon || entity.entityType,
                    route: `/home/${entity.id}`,
                    contextMenuItems: this.entityOptionsMap[entity.entityType]
                        .map(useDataForAction({ id: entity.id, entityType: entity.entityType }))
                        .map(useTaskForActiveItems(entity as EntityPreviewRecursive & TaskPreview)),
                }
            })
        )
    )
}
