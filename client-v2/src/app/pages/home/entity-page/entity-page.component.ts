import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
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
    of,
    shareReplay,
    switchMap,
    tap,
} from 'rxjs'
import { EntityType } from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { MenuItem, MenuItemVariant } from 'src/app/components/molecules/drop-down/drop-down.component'
import { DEFAULT_TASKLIST_NAME, TaskStatus } from 'src/app/models/task.model'
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
    DEFAULT_TASKLIST_NAME = DEFAULT_TASKLIST_NAME

    @ViewChild('listname') editableListName!: ElementRef<HTMLSpanElement>

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
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    activeTaskList$ = this.activeTasklistTrace$.pipe(map(trace => trace?.[trace.length - 1]))
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
                map(() => {
                    if (listName == DEFAULT_TASKLIST_NAME) return ''

                    return listName
                })
            )
        }),
        tap(listName => {
            /*  This is necessary in case of updating the listname from empty to also empty.
                Because apparently, angular does not do the update, which is bad when the listname was edited before,
                meaning, the edited listname won't be overwritten. So we have to do that manually.
                
                We could narrow this down even further with comparing to the previous listname (`pairwise()` operator),
                and only update if both are empty, but this should suffice for now. */
            if (listName === '' && this.editableListName?.nativeElement) {
                this.editableListName.nativeElement.innerText = ''
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true })
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
    listnameChanges$ = new BehaviorSubject<string | null>(null)

    listnameDomState$ = merge(
        this.listnameChanges$,
        this.activeListName$.pipe(
            tap(() => {
                if (this.listnameChanges$.value !== null) this.listnameChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

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
    ).pipe(
        map(newName => {
            if (newName === null) return null

            return newName || DEFAULT_TASKLIST_NAME
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    listNameUpdatesSubscription = this.listNameUpdateEvents$
        .pipe(
            distinctUntilChanged(),
            switchMap(newName => {
                return this.activeTaskList$.pipe(
                    first(),
                    tap(activeTaskList => {
                        if (!activeTaskList || !newName) return

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
