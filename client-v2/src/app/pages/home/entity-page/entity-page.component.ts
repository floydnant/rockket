import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
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
    of,
    switchMap,
    tap,
} from 'rxjs'
import { EntityType } from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { MenuItem, MenuItemVariant } from 'src/app/components/molecules/drop-down/drop-down.component'
import { TaskStatus } from 'src/app/models/task.model'
import { AppState } from 'src/app/store'
import { listActions } from 'src/app/store/task/task.actions'
import { traceTaskList } from 'src/app/store/task/utils'

@UntilDestroy()
@Component({
    selector: 'app-entity-page',
    templateUrl: './entity-page.component.html',
    styleUrls: ['./entity-page.component.css'],
})
export class EntityPageComponent implements AfterViewInit, OnDestroy {
    constructor(private store: Store<AppState>, private route: ActivatedRoute, private router: Router) {}

    TaskStatus = TaskStatus
    EntityType = EntityType

    isPrimaryProgressBarHidden = false
    @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>
    progressBarObserver = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting) this.isPrimaryProgressBarHidden = false
            else this.isPrimaryProgressBarHidden = true
        },
        { threshold: [0.5] }
    )

    ngAfterViewInit(): void {
        this.progressBarObserver.observe(this.progressBar.nativeElement)
    }
    ngOnDestroy(): void {
        this.progressBarObserver.disconnect()
    }

    closedTasks = 16
    allTasks = 37
    progress = Math.round((this.closedTasks / this.allTasks) * 100)
    isShownAsPercentage = true

    tasklistOptionsItems: MenuItem[] = [
        {
            title: `Rename`,
            action: (id: string) => this.store.dispatch(listActions.renameListDialog({ id })),
        },
        {
            title: `Export`,
            action: (id: string) => this.store.dispatch(listActions.exportList({ id })),
        },
        { isSeperator: true },
        {
            title: `Delete`,
            variant: MenuItemVariant.DANGER,
            action: (id: string) => this.store.dispatch(listActions.deleteListDialog({ id })),
        },
    ]
    tasklistOptionsItems$ = of(this.tasklistOptionsItems)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    activeTasklistId$ = this.route.paramMap.pipe(map(paramMap => paramMap.get('id')!))

    activeTasklistTrace$ = this.activeTasklistId$.pipe(
        switchMap(activeId => {
            return this.store
                .select(state => state.task.listPreviews)
                .pipe(
                    map(listPreviews => {
                        if (!listPreviews) return null

                        return traceTaskList(listPreviews, activeId)
                    })
                )
        })
    )

    activeTaskList$ = this.activeTasklistTrace$.pipe(map(trace => trace?.[trace?.length - 1]))
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

    breadcrumbs$ = this.activeTasklistTrace$.pipe(
        map(trace =>
            trace?.map<Breadcrumb>(list => ({
                title: list.name,
                icon: EntityType.TASKLIST,
                route: `/home/${list.id}`,
            }))
        )
    )

    keydownEvents$ = new BehaviorSubject<KeyboardEvent | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)
    listnameChanges$ = new BehaviorSubject('')

    listNameUpdateEvents$ = merge(
        this.keydownEvents$.pipe(
            filter(event => {
                if (event?.code == 'Enter') {
                    event.preventDefault()
                    return true
                }
                return false
            }),
            switchMap(() => this.listnameChanges$.pipe(first()))
        ),
        this.blurEvents$.pipe(
            filter(e => !!e),
            switchMap(() => this.listnameChanges$.pipe(first()))
        ),
        this.listnameChanges$.pipe(debounceTime(600))
    )

    listNameUpdatesSubscription = this.listNameUpdateEvents$
        .pipe(
            distinctUntilChanged(),
            switchMap(newName => {
                return this.activeTaskList$.pipe(
                    first(),
                    tap(activeTaskList => {
                        if (!activeTaskList || !newName) return EMPTY

                        return this.store.dispatch(listActions.renameList({ id: activeTaskList.id, newName }))
                    })
                )
            }),
            untilDestroyed(this)
        )
        .subscribe()

    createNewSublist() {
        this.activeTasklistId$.pipe(first()).subscribe(activeId => {
            this.store.dispatch(listActions.createTaskList({ parentListId: activeId }))
        })
    }
}
