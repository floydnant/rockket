import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Store } from '@ngrx/store'
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    EMPTY,
    filter,
    first,
    map,
    merge,
    switchMap,
    tap,
} from 'rxjs'
import { EntityType } from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { TaskStatus } from 'src/app/models/task.model'
import { AppState } from 'src/app/store'
import { listActions } from 'src/app/store/task/task.actions'
import { traceTaskList } from 'src/app/store/task/utils'

@Component({
    selector: 'app-entity-page',
    templateUrl: './entity-page.component.html',
    styleUrls: ['./entity-page.component.css'],
})
export class EntityPageComponent implements AfterViewInit, OnDestroy {
    constructor(private store: Store<AppState>, private route: ActivatedRoute) {}

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeTasklistId$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('id')!))

    activeListAndTrace$ = this.activeTasklistId$.pipe(
        switchMap(activeId => {
            return this.store
                .select(state => state.task.listPreviews)
                .pipe(
                    map(listPreviews => {
                        if (!listPreviews) return null

                        const trace = traceTaskList(listPreviews, activeId)
                        const activeTaskList = trace[trace.length - 1]

                        return { activeTaskList, trace }
                    })
                )
        })
    )

    activeTaskList$ = this.activeListAndTrace$.pipe(map(derived => derived?.activeTaskList))
    activeListName$ = this.activeTaskList$.pipe(
        map(list => list?.name),
        distinctUntilChanged(),
        switchMap(listName => {
            return this.listnameChanges$.pipe(
                first(),
                filter(newListname => {
                    if (!newListname) return true

                    return listName != newListname
                }),
                map(() => listName)
            )
        })
    )
    breadcrumbs$ = this.activeListAndTrace$.pipe(
        map(derived =>
            derived?.trace.map<Breadcrumb>(list => ({
                title: list.name,
                icon: EntityType.TASKLIST,
                route: `/home/${list.id}`,
            }))
        )
    )

    TaskStatus = TaskStatus
    EntityType = EntityType

    closedTasks = 16
    allTasks = 37
    progress = Math.round((this.closedTasks / this.allTasks) * 100)
    isShownAsPercentage = true

    createNewSublist() {
        this.activeTasklistId$.pipe(first()).subscribe(activeId => {
            this.store.dispatch(listActions.createTaskList({ parentListId: activeId }))
        })
    }

    isSecondaryProgressBarVisible = false
    @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>
    progressBarObserver = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting) this.isSecondaryProgressBarVisible = false
            else this.isSecondaryProgressBarVisible = true
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
