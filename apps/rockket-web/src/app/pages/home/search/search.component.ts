import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { EntityPreview, EntityPreviewRecursive, EntityType, TaskRecursive } from '@rockket/commons'
import { combineLatestWith, filter, map } from 'rxjs'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { entitiesFeature } from 'src/app/store/entities/entities.selectors'
import { EntitiesState } from 'src/app/store/entities/entities.state'
import { loadingUpdates } from 'src/app/utils/store.helpers'
import { filterTree } from 'src/app/utils/tree.helpers'

const matchQuery = (query: string) => {
    return <T extends { title: string; description: string | null | undefined }>(entity: T) => {
        const regex = new RegExp(query, 'i')
        return Boolean(regex.test(entity.title) || (entity.description && regex.test(entity.description)))
    }
}

@UntilDestroy()
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
    constructor(
        private actions$: Actions,
        private store: Store<AppState>,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {}

    routeQuery$ = this.activatedRoute.queryParamMap.pipe(map(params => params.get('q') || ''))
    initialRouteQuery = this.router.parseUrl(this.router.url).queryParams['q'] || ''

    actionDispatchSub = this.routeQuery$.pipe(filter(Boolean), untilDestroyed(this)).subscribe(query => {
        this.store.dispatch(entitiesActions.search({ query }))
    })

    searchFor(query: string) {
        const q = query.trim()
        if (!q) {
            this.router.navigate([], { queryParams: {} })
            return
        }

        this.router.navigate([], { queryParams: { q } })
    }

    getEntityDescription(entitiesState: EntitiesState, entity: EntityPreview) {
        if (entity.entityType == EntityType.TASK) return entity.description

        return entitiesState.entityDetails[entity.entityType][entity.id]?.description
    }

    entitiesState$ = this.store.select(entitiesFeature)
    search$ = this.entitiesState$.pipe(
        combineLatestWith(this.routeQuery$),
        map(([{ taskTreeMap, entityTree, entityDetails }, query]) => {
            if (!query)
                return {
                    query,
                    result: {
                        tasks: [] as TaskRecursive[],
                        taskMatches: 0,
                        entities: [] as EntityPreviewRecursive[],
                        entityMatches: 0,
                    },
                }

            const matchEntity = matchQuery(query)

            const taskTree = taskTreeMap ? Object.values(taskTreeMap).flat() : []
            const taskMatches = { matches: 0 }
            const filteredTasks = filterTree(taskTree, matchEntity, taskMatches)

            const entityMatches = { matches: 0 }
            const filteredEntities = entityTree
                ? filterTree(
                      entityTree,
                      entity => {
                          const details = entityDetails[entity.entityType][entity.id]
                          // prettier-ignore
                          const description =
                              // There should not be any task entities in the entity tree here,
                              // this is only to make TS happy
                              entity.entityType == EntityType.TASK
                                  ? entity.description
                                  : details && 'description' in details
                                    ? details.description
                                    : null

                          return matchEntity({ title: entity.title, description })
                      },
                      entityMatches,
                  )
                : []

            return {
                query,
                result: {
                    tasks: filteredTasks,
                    taskMatches: taskMatches.matches,
                    entities: filteredEntities,
                    entityMatches: entityMatches.matches,
                },
            }
        }),
    )
    isLoading$ = this.actions$.pipe(
        loadingUpdates([entitiesActions.search, entitiesActions.searchSuccess, entitiesActions.searchError]),
    )
}
