import { ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { BehaviorSubject, combineLatest, merge, of } from 'rxjs'
import { distinctUntilChanged, first, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import {
    prioritySortingMap,
    statusSortingMap,
    TaskPreview,
    TaskStatus,
} from 'src/app/fullstack-shared-models/task.model'
import { AppState } from 'src/app/store'
import { listActions } from 'src/app/store/entities/entities.actions'
import { EntityViewComponent, EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'

@UntilDestroy()
@Component({
    selector: 'app-tasklist-view',
    templateUrl: './tasklist-view.component.html',
    styleUrls: ['./tasklist-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasklistViewComponent {
    constructor(
        @Inject(ENTITY_VIEW_DATA) private viewData: EntityViewData<TasklistDetail>,
        private store: Store<AppState>,
        private entityView: EntityViewComponent // needed to update the secondary progress bar, @TODO: find a clearer way to do this
    ) {}

    EntityType = EntityType

    entity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$

    description$ = this.detail$.pipe(
        map(detail => detail?.description),
        distinctUntilChanged()
    )
    isDescriptionShown$ = new BehaviorSubject(false)

    descriptionChanges$ = new BehaviorSubject<string | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)

    descriptionSubscription = combineLatest([this.blurEvents$, this.description$])
        .pipe(
            tap(([blurEvent, description]) => {
                if (blurEvent) {
                    if (!description) this.isDescriptionShown$.next(false)
                }
                this.isDescriptionShown$.next(!!description)
            }),
            untilDestroyed(this)
        )
        .subscribe()

    descriptionDomState$ = merge(
        this.descriptionChanges$,
        this.description$.pipe(
            tap(() => {
                if (this.descriptionChanges$.value !== null) this.descriptionChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    descriptionUpdatesSubscription = this.blurEvents$
        .pipe(
            switchMap(() => combineLatest([this.descriptionChanges$, this.entity$]).pipe(first())),
            untilDestroyed(this)
        )
        .subscribe(([newDescription, entity]) => {
            // @TODO: Throttled updates should only be sent to the server and not update the store yet.
            // The store should only be updated when the editor is blurred.
            if (!entity || newDescription === null) return
            this.store.dispatch(listActions.updateDescription({ id: entity.id, newDescription }))
        })

    closedTasks = 16
    allTasks = 37
    progress$ = of(Math.round((this.closedTasks / this.allTasks) * 100))
    isShownAsPercentage = true

    isProgressBarHidden$ = new BehaviorSubject(false)
    progressOutputSubscription = combineLatest([this.progress$, this.isProgressBarHidden$])
        .pipe(
            map(([progress, isProgressBarHidden]) => {
                if (!isProgressBarHidden) return null

                return progress
            }),
            untilDestroyed(this)
        )
        .subscribe(progress => this.entityView.progress$.next(progress))

    @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>
    progressBarObserver = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting) this.isProgressBarHidden$.next(false)
            else this.isProgressBarHidden$.next(true)
        },
        { threshold: [0.5] }
    )
    ngAfterViewInit(): void {
        this.progressBarObserver.observe(this.progressBar.nativeElement)
    }
    ngOnDestroy(): void {
        this.progressBarObserver.disconnect()
    }

    createNewSublist() {
        this.entity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(listActions.createTaskList({ parentListId: entity.id }))
        })
    }
}
