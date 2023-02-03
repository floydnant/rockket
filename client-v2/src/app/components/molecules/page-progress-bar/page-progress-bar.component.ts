import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    ViewChild,
} from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
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
import { TaskPreview, TaskStatus, TaskPreviewRecursive } from 'src/app/fullstack-shared-models/task.model'
import { taskStatusColorMap, TwColorClass } from 'src/app/shared/colors'
import { EntityViewComponent } from '../../organisms/entity-view/entity-view.component'

const getMapByStatus = (taskTree: TaskPreview[]) => {
    const map = Object.values(TaskStatus).reduce((acc, status) => {
        return {
            ...acc,
            [status]: taskTree.filter(task => task.status === status).length,
        }
    }, {} as Record<TaskStatus, number>)
    return map
}
// @TODO: Implement this
const getMapByStatusRecursive = (taskTree: TaskPreviewRecursive[]): Record<TaskStatus, number> => {
    const map = getMapByStatus(taskTree)

    const mapRecursive = taskTree.reduce<Record<TaskStatus, number>>((acc, task) => {
        const childrenStatusMap = (task.children?.length && getMapByStatusRecursive(task.children)) || null
        console.log(childrenStatusMap)

        return Object.fromEntries(
            Object.entries(acc).map(([status, taskCount]) => {
                const childrenWithStatus = !task.children?.length
                    ? 0
                    : (childrenStatusMap?.[status as TaskStatus] || 0) / task.children.length
                const childrenWithStatusFormatted = parseFloat(childrenWithStatus.toFixed(2)) || 0

                const closedStatuses = [TaskStatus.COMPLETED, TaskStatus.NOT_PLANNED]
                const contribution =
                    closedStatuses.includes(status as TaskStatus) && closedStatuses.includes(task.status)
                        ? 1
                        : childrenWithStatusFormatted

                return [status, taskCount + contribution]
            })
        ) as Record<TaskStatus, number>
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
export class PageProgressBarComponent implements AfterViewInit, OnDestroy {
    constructor(
        private entityView: EntityViewComponent // needed to update the secondary progress bar, @TODO: find a clearer way to do this
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

    isShownAsPercentage = true

    digest$ = this.taskTree$.pipe(
        map(tasks => {
            if (!tasks) return null

            const statusTaskCountMap = getMapByStatus(tasks)
            const all = Object.values(statusTaskCountMap).reduce((acc, curr) => acc + curr)
            const closed = statusTaskCountMap[TaskStatus.NOT_PLANNED] + statusTaskCountMap[TaskStatus.COMPLETED]

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
        shareReplay({ bufferSize: 1, refCount: true })
    )

    isProgressBarIncreasing$ = this.digest$.pipe(
        map(digest => digest?.progress),
        distinctUntilChanged(),
        scan(
            ({ prevProgress }, progress = 0) => ({
                prevProgress: progress,
                isIncreasing: progress > prevProgress,
            }),
            { prevProgress: 0, isIncreasing: false }
        ),
        filter(({ isIncreasing }) => isIncreasing),
        switchMap(() => {
            return timer(1000).pipe(
                map(() => false),
                startWith(true)
            )
        })
    )

    isProgressBarHidden$ = new BehaviorSubject(false)
    progressOutputSubscription = combineLatest([
        this.digest$.pipe(map(digest => digest?.progress)),
        this.isProgressBarHidden$,
    ])
        .pipe(
            map(([progress, isProgressBarHidden]) => {
                if (!isProgressBarHidden || !progress) return null

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
}
