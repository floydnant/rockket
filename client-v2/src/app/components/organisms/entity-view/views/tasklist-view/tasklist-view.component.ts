import { ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { BehaviorSubject, combineLatest, of } from 'rxjs'
import { first, map, tap } from 'rxjs/operators'
import { DEFAULT_TASKLIST_NAME } from 'src/app/models/defaults'
import { EntityType } from 'src/app/models/entities.model'
import { AppState } from 'src/app/store'
import { entitiesActions, listActions } from 'src/app/store/entities/entities.actions'
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
        @Inject(ENTITY_VIEW_DATA) private viewData$: EntityViewData,
        private store: Store<AppState>,
        private entityView: EntityViewComponent
    ) {}

    EntityType = EntityType
    DEFAULT_TASKLIST_NAME = DEFAULT_TASKLIST_NAME

    entity$ = this.viewData$.pipe(map(viewData => viewData.entity))
    options$ = this.viewData$.pipe(map(viewData => viewData.options))

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
