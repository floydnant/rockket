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
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    distinctUntilChanged,
    map,
    Observable,
    shareReplay,
    tap,
} from 'rxjs'
import { EntityPreviewRecursive, EntityType } from 'src/app/models/entities.model'
import { EntityMenuItemsMap } from '../../../shared/entity-menu-items'
import { MenuItem } from '../../molecules/drop-down/drop-down.component'
import { TasklistViewComponent } from './views/tasklist-view/tasklist-view.component'

const entityViewComponentMap: Record<EntityType, Type<unknown>> = {
    [EntityType.TASKLIST]: TasklistViewComponent,
}

export const ENTITY_VIEW_DATA = new InjectionToken('app.entity.view-data')
export type EntityViewData = Observable<{
    entity: EntityPreviewRecursive | null | undefined
    options: MenuItem[] | null | undefined
}>

@UntilDestroy()
@Component({
    selector: 'app-entity-view',
    templateUrl: './entity-view.component.html',
    styleUrls: ['./entity-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityViewComponent {
    constructor(private injector: Injector) {}

    @Input() set entity(activeEntity: EntityPreviewRecursive | undefined | null) {
        this.entity$.next(activeEntity)
    }
    entity$ = new BehaviorSubject<EntityPreviewRecursive | undefined | null>(null)

    @Input() set entityOptionsMap(menuItems: EntityMenuItemsMap | undefined | null) {
        this.entityOptionsMap$.next(menuItems)
    }
    entityOptionsMap$ = new BehaviorSubject<EntityMenuItemsMap | undefined | null>(null)
    entityOptionsItems$ = this.entity$.pipe(
        distinctUntilChanged((previous, current) => previous?.id == current?.id),
        combineLatestWith(this.entityOptionsMap$),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map(([entity, optionsMap]) => {
            // @TODO: Remove hardcoded value
            const entityType = EntityType.TASKLIST
            return optionsMap?.[entityType]
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    entityViewComponent$ = this.entity$.pipe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        distinctUntilChanged((previous, current) => {
            // @TODO: Remove hardcoded value
            const entityType = EntityType.TASKLIST
            return entityType == entityType
        }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        map(entity => {
            // @TODO: Remove hardcoded value
            const entityType = EntityType.TASKLIST
            return entityViewComponentMap[entityType]
        })
    )
    entityViewData$: EntityViewData = combineLatest([this.entity$, this.entityOptionsMap$]).pipe(
        map(([entity, optionsMap]) => {
            // @TODO: Remove hardcoded value
            const entityType = EntityType.TASKLIST
            return { entity, options: optionsMap?.[entityType] }
        })
    )
    entityViewInjector = Injector.create({
        providers: [{ provide: ENTITY_VIEW_DATA, useValue: this.entityViewData$ as EntityViewData }],
        parent: this.injector,
    })

    @ViewChild('top') topElement!: ElementRef<HTMLDivElement>
    entitySubscription = this.entity$
        .pipe(
            distinctUntilChanged((previous, current) => previous?.id == current?.id),
            tap(() => this.topElement?.nativeElement?.scrollIntoView({ behavior: 'smooth' })), // lets see how the 'smooth' behaviour feels after a while
            untilDestroyed(this)
        )
        .subscribe()

    progress$ = new BehaviorSubject<number | null>(null)
}
