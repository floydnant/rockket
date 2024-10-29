import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
    entriesOf,
    Task,
    TaskRecursive,
    TaskStatus,
    TaskStatusGroup,
    taskStatusGroupMap,
    valuesOf,
} from '@rockket/commons'
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    filter,
    map,
    scan,
    shareReplay,
    startWith,
    switchMap,
    timer,
} from 'rxjs'
import { UiStateService } from 'src/app/services/ui-state.service'
import { taskStatusColorMap } from 'src/app/shared/colors'
import { taskStatusLabelMap } from '../../atoms/icons/icon/icons'
import { EntityViewComponent } from '../../organisms/entity-view/entity-view.component'

export const mapByStatus = <T extends Task>(taskTree: T[]) => {
    const statusCountMap = valuesOf(TaskStatus).reduce(
        (acc, status) => ({
            ...acc,
            [status]: taskTree.filter(task => task.status == status),
        }),
        {} as Record<TaskStatus, T[]>,
    )
    return statusCountMap
}

export const getStatusCountMapRecursive = (taskTree: TaskRecursive[]): Record<TaskStatus, number> => {
    const map = Object.fromEntries(
        entriesOf(mapByStatus(taskTree)).map(([status, tasks]) => [status, tasks.length]),
    ) as Record<TaskStatus, number>

    const mapRecursive = taskTree.reduce<Record<TaskStatus, number>>((acc, task) => {
        // @TODO: this could be a ternary
        const childrenStatusCountMap =
            (task.children?.length && getStatusCountMapRecursive(task.children)) || null

        const statusCountEntries = entriesOf(acc).map(([status, taskCount]) => {
            const childrenCount = childrenStatusCountMap?.[status as TaskStatus] || 0

            return [status, taskCount + childrenCount]
        })

        return Object.fromEntries(statusCountEntries) as Record<TaskStatus, number>
    }, map)

    return mapRecursive
}

@UntilDestroy()
@Component({
    selector: 'app-page-progress-bar',
    templateUrl: './page-progress-bar.component.html',
    styleUrls: ['./page-progress-bar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageProgressBarComponent {
    constructor(
        private entityView: EntityViewComponent, // Needed to update the secondary progress bar, @TODO: find a clearer way to do this
        private uiStateService: UiStateService,
    ) {}

    taskStatuses = valuesOf(TaskStatus)
    statusLabelMap = taskStatusLabelMap
    statusColorMap = taskStatusColorMap

    taskTree$ = new BehaviorSubject<TaskRecursive[]>([])
    @Input() set taskTree(tasks: TaskRecursive[]) {
        this.taskTree$.next(tasks)
    }

    isShownAsPercentage = this.uiStateService.mainViewUiState.isProgressShownAsPercentage
    toggleShownAsPercentage() {
        this.isShownAsPercentage = !this.isShownAsPercentage
        this.uiStateService.updateShownAsPercentage(this.isShownAsPercentage)
    }

    digest$ = this.taskTree$.pipe(
        map(tasks => {
            if (!tasks) return null

            const statusTaskCountMap = getStatusCountMapRecursive(tasks)

            const all = valuesOf(statusTaskCountMap).reduce((acc, curr) => acc + curr, 0)

            const closed = valuesOf(TaskStatus)
                .filter(status => taskStatusGroupMap[status] == TaskStatusGroup.Closed)
                .reduce((acc, status) => acc + statusTaskCountMap[status], 0)
            const progress = (closed / all) * 100 || 0

            return {
                all,
                closed,
                open: all - closed,
                byStatus: statusTaskCountMap,

                progress,
                progressRounded: Math.round(progress),
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    isProgressBarIncreasing$ = this.digest$.pipe(
        map(digest => digest?.progress),
        distinctUntilChanged(),
        scan(
            ({ prevProgress }, progress = 0) => ({
                prevProgress: progress,
                isIncreasing: progress > prevProgress,
            }),
            { prevProgress: 0, isIncreasing: false },
        ),
        filter(({ isIncreasing }) => isIncreasing),
        switchMap(() => {
            return timer(1000).pipe(
                map(() => false),
                startWith(true),
            )
        }),
    )

    isProgressBarVisible$ = new BehaviorSubject(true)
    progressOutputSubscription = combineLatest([
        this.digest$.pipe(map(digest => digest?.progress)),
        this.isProgressBarVisible$,
    ])
        .pipe(
            map(([progress, isProgressBarVisible]) => {
                if (isProgressBarVisible || !progress) return null

                return progress
            }),
            untilDestroyed(this),
        )
        .subscribe({
            next: progress => this.entityView.progress$.next(progress),
            complete: () => this.entityView.progress$.next(null),
        })
}
