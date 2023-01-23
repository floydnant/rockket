import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InjectionToken,
    Injector,
    Input,
    Type,
    ViewChild,
} from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    delay,
    distinctUntilChanged,
    map,
    Observable,
    shareReplay,
    tap,
} from 'rxjs'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { EntityMenuItemsMap } from '../../../shared/entity-menu-items'
import { MenuItem } from '../../molecules/drop-down/drop-down.component'
import { TaskViewComponent } from './views/task-view/task-view.component'
import { TasklistViewComponent } from './views/tasklist-view/tasklist-view.component'

export const entityViewComponentMap: Record<EntityType, Type<unknown>> = {
    [EntityType.TASKLIST]: TasklistViewComponent,
    [EntityType.TASK]: TaskViewComponent,
} as const // @TODO: satisfies

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ENTITY_VIEW_DATA = new InjectionToken<EntityViewData<any>>('app.entity.view-data')
export interface EntityViewData<T extends object> {
    entity$: Observable<EntityPreviewRecursive | null | undefined>
    detail$: Observable<T>
    options$: Observable<MenuItem[] | null | undefined>
}

@UntilDestroy()
@Component({
    selector: 'app-entity-view',
    templateUrl: './entity-view.component.html',
    styleUrls: ['./entity-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityViewComponent {
    constructor(private injector: Injector, private store: Store<AppState>) {}

    @Input() set entity(activeEntity: EntityPreviewRecursive | undefined | null) {
        this.entity$.next(activeEntity)
    }
    entity$ = new BehaviorSubject<EntityPreviewRecursive | undefined | null>(null)
    entityDetail$ = combineLatest([this.entity$, this.store.select(state => state.entities)]).pipe(
        map(([entity, entitiesState]) => {
            if (!entity) return null

            return entitiesState.entityDetails[entity.entityType][entity.id]
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    @Input() set entityOptionsMap(menuItems: EntityMenuItemsMap | undefined | null) {
        this.entityOptionsMap$.next(menuItems)
    }
    entityOptionsMap$ = new BehaviorSubject<EntityMenuItemsMap | undefined | null>(null)
    entityOptionsItems$ = this.entity$.pipe(
        distinctUntilChanged((previous, current) => previous?.id == current?.id),
        combineLatestWith(this.entityOptionsMap$),
        map(([entity, optionsMap]) => {
            if (!entity) return null

            return optionsMap?.[entity.entityType]
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    entityViewComponent$ = this.entity$.pipe(
        distinctUntilChanged((previous, current) => previous?.entityType == current?.entityType),
        map(entity => {
            if (!entity) return null

            return entityViewComponentMap[entity.entityType]
        })
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityViewData: EntityViewData<any> = {
        entity$: this.entity$.pipe(delay(0)), // move to macro queue
        detail$: this.entityDetail$,
        options$: this.entityOptionsItems$,
    }
    entityViewInjector = Injector.create({
        providers: [{ provide: ENTITY_VIEW_DATA, useValue: this.entityViewData }],
        parent: this.injector,
    })

    @ViewChild('top') topElement!: ElementRef<HTMLDivElement>
    entitySubscription = this.entity$
        .pipe(
            distinctUntilChanged((previous, current) => previous?.id == current?.id),
            tap(() => this.topElement?.nativeElement?.scrollIntoView({ behavior: 'smooth' })), // lets see how the 'smooth' behaviour feels after a while
            tap(entity => {
                if (!entity) return

                this.store.dispatch(entitiesActions.loadDetail({ entityType: entity.entityType, id: entity.id }))
            }),
            untilDestroyed(this)
        )
        .subscribe()

    progress$ = new BehaviorSubject<number | null>(null)
}
