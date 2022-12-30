import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    first,
    map,
    merge,
    shareReplay,
    switchMap,
    tap,
} from 'rxjs'
import { DEFAULT_TASKLIST_NAME, ENTITY_NAME_DEFAULTS } from 'src/app/models/defaults'
import { EntityPreviewRecursive, EntityType } from 'src/app/models/entities.model'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'

@UntilDestroy()
@Component({
    selector: 'app-editable-entity-name',
    templateUrl: './editable-entity-name.component.html',
    styleUrls: ['./editable-entity-name.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableEntityNameComponent {
    constructor(private store: Store<AppState>) {}

    EntityType = EntityType
    ENTITY_NAME_DEFAULTS = ENTITY_NAME_DEFAULTS

    @ViewChild('editableEntityName') editableEntityName!: ElementRef<HTMLSpanElement>

    @Input() set entity(activeEntity: EntityPreviewRecursive | undefined | null) {
        this.entity$.next(activeEntity)
    }
    entity$ = new BehaviorSubject<EntityPreviewRecursive | undefined | null>(null)

    entityName$ = this.entity$.pipe(
        map(entity => {
            if (Object.values(ENTITY_NAME_DEFAULTS).includes(entity?.name as string)) return ''

            return entity?.name
        }),
        distinctUntilChanged((prev, currEntityName) => {
            if (prev === '' && currEntityName === '') return false

            return currEntityName == prev
        }),
        switchMap(entityName => {
            return this.entityNameChanges$.pipe(
                first(),
                filter(newEntityName => {
                    if (!newEntityName) return true

                    return entityName != newEntityName
                }),
                map(() => entityName)
            )
        }),
        tap(entityName => {
            /*  This is necessary in case of updating the entityname from empty to also empty.
                Because apparently, angular does not do the update, which is bad when the entityname was edited before,
                meaning, the edited entityname won't be overwritten. So we have to do that manually.

                We could narrow this down even further with comparing to the previous entityname (`pairwise()` operator),
                and only update if both are empty, but this should suffice for now. */
            if (entityName === '' && this.editableEntityName?.nativeElement) {
                this.editableEntityName.nativeElement.innerText = ''
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    keydownEvents$ = new BehaviorSubject<KeyboardEvent | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)
    entityNameChanges$ = new BehaviorSubject<string | null>(null)

    entityNameDomState$ = merge(
        this.entityNameChanges$,
        this.entityName$.pipe(
            tap(() => {
                if (this.entityNameChanges$.value !== null) this.entityNameChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    entityNameUpdateEvents$ = merge(
        this.keydownEvents$.pipe(
            filter(event => {
                if (event?.code == 'Enter') {
                    event.preventDefault()
                    return true
                }
                return false
            }),
            switchMap(() => this.entityNameChanges$.pipe(first()))
        ),
        this.blurEvents$.pipe(
            filter(e => !!e),
            switchMap(() => this.entityNameChanges$.pipe(first()))
        ),
        this.entityNameChanges$.pipe(debounceTime(600))
    ).pipe(
        map(newEntityName => {
            if (newEntityName === null) return null

            return newEntityName || DEFAULT_TASKLIST_NAME
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    entityNameUpdatesSubscription = this.entityNameUpdateEvents$
        .pipe(
            distinctUntilChanged(),
            switchMap(newName => {
                return this.entity$.pipe(
                    first(),
                    tap(entity => {
                        if (!entity || !newName) return

                        return this.store.dispatch(entitiesActions.rename({ id: entity.id, newName }))
                    })
                )
            }),
            untilDestroyed(this)
        )
        .subscribe()
}
