import { ChangeDetectionStrategy, Component, Input, TrackByFunction } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
    entriesOf,
    isTruthy,
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
    distinctUntilKeyChanged,
    filter,
    map,
    scan,
    shareReplay,
    startWith,
    switchMap,
    timer,
} from 'rxjs'
import { UiStateService } from 'src/app/services/ui-state.service'
import { colorClassToValue, taskStatusColorMap } from 'src/app/shared/colors'
import { taskStatusLabelMap } from '../../atoms/icons/icon/icons'
import { EntityViewComponent } from '../../organisms/entity-view/entity-view.component'
import { debugObserver } from 'src/app/utils/observable.helpers'

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

const progressBarStatusSortingMap: Record<TaskStatus, number> = {
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.IN_REVIEW]: 1,
    [TaskStatus.NOT_PLANNED]: 2,
    [TaskStatus.COMPLETED]: 3,

    // Not shown in the progress bar
    [TaskStatus.OPEN]: 0,
    [TaskStatus.BACKLOG]: 0,
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

    taskStatusValues = valuesOf(TaskStatus)
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

    trackByStatus: TrackByFunction<{ status: TaskStatus }> = (_index, { status }) => status

    digest$ = this.taskTree$.pipe(
        map(tasks => {
            if (!tasks) return null

            const statusTaskCountMap = getStatusCountMapRecursive(tasks)

            const totalTaskCount = valuesOf(statusTaskCountMap).reduce((acc, curr) => acc + curr, 0)

            const byStatus__ = entriesOf(statusTaskCountMap)
                .filter(([status]) => taskStatusGroupMap[status] != TaskStatusGroup.Open)
                .map(([status, count]) => ({
                    status,
                    percent: (count / totalTaskCount) * 100 || 0,
                    colorClass: taskStatusColorMap[status].foregroundAsBg,
                    colorValue: colorClassToValue(taskStatusColorMap[status].foregroundAsBg),
                    count,
                    isFirst: false,
                    isLast: false,
                }))
                .sort((a, b) => progressBarStatusSortingMap[a.status] - progressBarStatusSortingMap[b.status])

            const firstWithCount = byStatus__.find(({ count }) => count > 0)
            if (firstWithCount) firstWithCount.isFirst = true

            byStatus__.reverse()
            const lastWithCount = byStatus__.find(({ count }) => count > 0)
            if (lastWithCount) lastWithCount.isLast = true
            byStatus__.reverse()

            const untackledTasksCount = this.taskStatusValues
                .filter(status => taskStatusGroupMap[status] == TaskStatusGroup.Open)
                .reduce((acc, status) => acc + statusTaskCountMap[status], 0)
            const closedTasksCount = this.taskStatusValues
                .filter(status => taskStatusGroupMap[status] == TaskStatusGroup.Closed)
                .reduce((acc, status) => acc + statusTaskCountMap[status], 0)
            const progress = (closedTasksCount / totalTaskCount) * 100 || 0

            return {
                totalTaskCount: totalTaskCount,
                untackledTasksCount: untackledTasksCount,
                closedTasksCount: closedTasksCount,
                byStatus: statusTaskCountMap,
                byStatus__,

                progress,
                progressRounded: Math.round(progress),
                /** This is for tracking if the progress bar updated */
                countsString: byStatus__.map(({ count }) => count).join(),
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    isMakingProgress$ = this.digest$.pipe(
        distinctUntilChanged((prev, curr) => prev?.countsString == curr?.countsString),
        filter(isTruthy),
        scan(
            (
                { prevUntackledTasksCount, prevClosedTasksCount },
                { untackledTasksCount, closedTasksCount },
            ) => {
                return {
                    prevUntackledTasksCount: untackledTasksCount,
                    prevClosedTasksCount: closedTasksCount,
                    isMakingProgress:
                        // If there are less untackled tasks than before, we're making progress
                        untackledTasksCount < prevUntackledTasksCount ||
                        // If there are more closed tasks than before, we're making progress
                        closedTasksCount > prevClosedTasksCount,
                }
            },
            {
                prevUntackledTasksCount: 0,
                prevClosedTasksCount: 0,
                isMakingProgress: false,
            },
        ),
        debugObserver('is increasing'),
        filter(({ isMakingProgress }) => isMakingProgress),
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
