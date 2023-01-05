import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { map, of, shareReplay, switchMap } from 'rxjs'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { useDataForAction } from 'src/app/components/molecules/drop-down/drop-down.component'
import { EntityType } from 'src/app/models/entities.model'
import { getEntityMenuItemsMap } from 'src/app/shared/entity-menu-items'
import { AppState } from 'src/app/store'
import { traceEntity } from 'src/app/store/entities/utils'

@UntilDestroy()
@Component({
    selector: 'app-entity-page',
    templateUrl: './entity-page.component.html',
    styleUrls: ['./entity-page.component.css'],
})
export class EntityPageComponent {
    constructor(private store: Store<AppState>, private route: ActivatedRoute) {}

    entityOptionsMap = getEntityMenuItemsMap(this.store)
    entityOptionsMap$ = of(this.entityOptionsMap)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeEntityId$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('id')!))

    activeEntityTrace$ = this.activeEntityId$.pipe(
        switchMap(activeId => {
            return this.store
                .select(state => state.entities.entityTree)
                .pipe(
                    map(entityTree => {
                        if (!entityTree) return null

                        return traceEntity(entityTree, activeId)
                    })
                )
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    activeEntity$ = this.activeEntityTrace$.pipe(map(trace => trace?.[trace.length - 1]))

    breadcrumbs$ = this.activeEntityTrace$.pipe(
        map(trace =>
            trace?.map<Breadcrumb>(entity => ({
                title: entity.name,
                icon: EntityType.TASKLIST, // @TODO: Remove hardcoded value
                route: `/home/${entity.id}`,
                // @TODO: Remove hardcoded value
                contextMenuItems: this.entityOptionsMap[EntityType.TASKLIST].map(useDataForAction(entity.id)),
            }))
        )
    )
}
