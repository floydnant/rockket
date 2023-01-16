import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import {
    BehaviorSubject,
    combineLatest,
    debounceTime,
    delay,
    distinctUntilChanged,
    filter,
    first,
    map,
    merge,
    shareReplay,
    switchMap,
    tap,
} from 'rxjs'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { AppState } from 'src/app/store'
import { entitiesActions } from 'src/app/store/entities/entities.actions'
import { getLoadingUpdates } from 'src/app/utils/store.helpers'
import { PageEntityState } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'

@UntilDestroy()
@Component({
    selector: 'app-editable-entity-title',
    templateUrl: './editable-entity-title.component.html',
    styleUrls: ['./editable-entity-title.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableEntityTitleComponent {
    constructor(private store: Store<AppState>, private actions$: Actions) {}

    EntityType = EntityType
    PageEntityState = PageEntityState
    ENTITY_TITLE_DEFAULTS = ENTITY_TITLE_DEFAULTS

    @ViewChild('editableEntityTitle') editableEntityTitle!: ElementRef<HTMLSpanElement>

    @Input() set entity(activeEntity: EntityPreviewRecursive | undefined | null) {
        this.entity$.next(activeEntity)
    }
    entity$ = new BehaviorSubject<EntityPreviewRecursive | undefined | null>(null)

    entityTitle$ = this.entity$.pipe(
        filter(entity => entity?.title != this.lastSentStoreUpdate),
        tap(() => (this.lastSentStoreUpdate = null)),
        map(entity => {
            if (entity?.title == ENTITY_TITLE_DEFAULTS[EntityType.TASKLIST]) return '' // @TODO: Remove hardcoded value

            return entity?.title
        }),
        distinctUntilChanged((prev, currEntityTitle) => {
            if (prev === '' && currEntityTitle === '') return false

            return currEntityTitle == prev
        }),
        switchMap(entityTitle => {
            return this.entityTitleChanges$.pipe(
                first(),
                filter(newEntityTitle => {
                    if (!newEntityTitle) return true

                    return entityTitle != newEntityTitle
                }),
                map(() => entityTitle)
            )
        }),
        tap(entityTitle => {
            /*  This is necessary in case of updating the entity title from empty to also empty.
                Because apparently, angular does not do the update, which is bad when the entity title was edited before,
                meaning, the edited entity title won't be overwritten. So we have to do that manually.

                We could narrow this down even further with comparing to the previous entity title (`pairwise()` operator),
                and only update if both are empty, but this should suffice for now. */
            if (entityTitle === '' && this.editableEntityTitle?.nativeElement) {
                this.editableEntityTitle.nativeElement.innerText = ''
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    keydownEvents$ = new BehaviorSubject<KeyboardEvent | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)
    entityTitleChanges$ = new BehaviorSubject<string | null>(null)

    entityTitleDomState$ = merge(
        this.entityTitleChanges$,
        this.entityTitle$.pipe(
            tap(() => {
                if (this.entityTitleChanges$.value !== null) this.entityTitleChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    entityTitleUpdateEvents$ = merge(
        this.keydownEvents$.pipe(
            filter(event => {
                if (event?.code == 'Enter') {
                    event.preventDefault()
                    return true
                }
                return false
            }),
            switchMap(() => this.entityTitleChanges$.pipe(first()))
        ),
        this.blurEvents$.pipe(
            filter(e => !!e),
            switchMap(() => this.entityTitleChanges$.pipe(first()))
        ),
        this.entityTitleChanges$.pipe(debounceTime(600))
    ).pipe(
        map(newEntityTitle => {
            if (newEntityTitle === null) return null

            return newEntityTitle || ENTITY_TITLE_DEFAULTS[EntityType.TASKLIST] // @TODO: Remove hardcoded value
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    entityTitleUpdatesSubscription = this.entityTitleUpdateEvents$
        .pipe(
            distinctUntilChanged(),
            switchMap(title => {
                return combineLatest([this.entity$, this.isLoading$]).pipe(
                    first(),
                    tap(([entity, isLoading]) => {
                        if (!entity || !title) return

                        const action = entitiesActions.rename({ id: entity.id, entityType: entity.entityType, title })
                        if (isLoading) {
                            this.updateQueue$.next(action)
                            return
                        }

                        this.lastSentStoreUpdate = title
                        this.store.dispatch(action)
                    })
                )
            }),
            untilDestroyed(this)
        )
        .subscribe()

    isLoading$ = getLoadingUpdates(
        this.actions$,
        [entitiesActions.rename, entitiesActions.renameSuccess, entitiesActions.renameError],
        action =>
            this.entity$.pipe(
                first(),
                map(entity => entity?.id == action.id)
            )
    )

    lastSentStoreUpdate: string | null = null

    updateQueue$ = new BehaviorSubject<ReturnType<typeof entitiesActions.rename> | null>(null)
    queueSubscription = this.isLoading$
        .pipe(
            filter(isLoading => !isLoading),
            switchMap(() => this.updateQueue$.pipe(first())),
            delay(0), // move to macro queue
            map(queuedAction => {
                if (queuedAction === null) return

                this.lastSentStoreUpdate = queuedAction.title
                this.store.dispatch(queuedAction)
                this.updateQueue$.next(null)
            }),
            untilDestroyed(this)
        )
        .subscribe()
}
