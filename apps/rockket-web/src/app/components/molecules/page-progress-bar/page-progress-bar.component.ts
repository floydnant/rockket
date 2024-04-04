import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TaskPreview, TaskPreviewRecursive, TaskStatus } from '@rockket/commons'
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
import { TwColorClass, taskStatusColorMap } from 'src/app/shared/colors'
import { EntityViewComponent } from '../../organisms/entity-view/entity-view.component'

export const mapByStatus = <T extends TaskPreview>(taskTree: T[]) => {
    const statusCountMap = Object.values(TaskStatus).reduce(
        (acc, status) => ({
            ...acc,
            [status]: taskTree.filter(task => task.status == status),
        }),
        {} as Record<TaskStatus, T[]>,
    )
    return statusCountMap
}

export const getStatusCountMapRecursive = (taskTree: TaskPreviewRecursive[]): Record<TaskStatus, number> => {
    const map = Object.fromEntries(
        Object.entries(mapByStatus(taskTree)).map(([status, tasks]) => [status, tasks.length]),
    ) as Record<TaskStatus, number>

    const mapRecursive = taskTree.reduce<Record<TaskStatus, number>>((acc, task) => {
        // @TODO: this could be a ternary
        const childrenStatusCountMap =
            (task.children?.length && getStatusCountMapRecursive(task.children)) || null

        const statusCountEntries = Object.entries(acc).map(([status, taskCount]) => {
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

    taskStatuses = Object.values(TaskStatus)
    statusColorMap: Record<TaskStatus, TwColorClass> = {
        ...taskStatusColorMap,
        [TaskStatus.OPEN]: 'text-tinted-100',
        [TaskStatus.BACKLOG]: 'text-tinted-200',
    }

    taskTree$ = new BehaviorSubject<TaskPreviewRecursive[]>([])
    @Input() set taskTree(tasks: TaskPreviewRecursive[]) {
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

            const all = Object.values(statusTaskCountMap).reduce((acc, curr) => acc + curr)
            const closed =
                statusTaskCountMap[TaskStatus.NOT_PLANNED] + statusTaskCountMap[TaskStatus.COMPLETED]
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
        .subscribe(progress => this.entityView.progress$.next(progress))
}
