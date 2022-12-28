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
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'
import { MenuItem, MenuItemVariant } from 'src/app/components/molecules/drop-down/drop-down.component'
import { DEFAULT_TASKLIST_NAME, ENTITY_NAME_DEFAULTS } from 'src/app/models/defaults'
import { EntityType } from 'src/app/models/entities.model'
import { TaskStatus } from 'src/app/models/task.model'
import { AppState } from 'src/app/store'
import { entitiesActions, listActions } from 'src/app/store/entities/entities.actions'
import { traceEntity } from 'src/app/store/entities/utils'

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

    @ViewChild('editableEntityName') editableEntityName!: ElementRef<HTMLSpanElement>
    @ViewChild('top') topElement!: ElementRef<HTMLDivElement>

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

    entityOptionsItems: MenuItem[] = [
        {
            title: `Rename`,
            action: (id: string) => this.store.dispatch(entitiesActions.openRenameDialog({ id })),
        },
        {
            title: `Export`,
            action: (id: string) => this.store.dispatch(listActions.exportList({ id })),
        },
        { isSeperator: true },
        {
            title: `Delete`,
            variant: MenuItemVariant.DANGER,
            action: (id: string) => this.store.dispatch(entitiesActions.openDeleteDialog({ id })),
        },
    ]
    entityOptionsItems$ = of(this.entityOptionsItems)

    activeEntityId$ = this.route.paramMap.pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(paramMap => paramMap.get('id')!),
        tap(() => this.topElement?.nativeElement?.scrollIntoView({ behavior: 'smooth' })), // lets see how the 'smooth' behaviour feels after a while
        shareReplay({ bufferSize: 1, refCount: true })
    )

    activeEntityTrace$ = this.activeEntityId$.pipe(
        switchMap(activeId => {
            return this.store
                .select(state => state.entities.entityTree)
                .pipe(
                    map(entityTree => {
                        if (!entityTree) return null

                        return traceEntity(entityTree, activeId)
                    })
                )
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    activeEntity$ = this.activeEntityTrace$.pipe(map(trace => trace?.[trace.length - 1]))
    activeEntityName$ = this.activeEntity$.pipe(
        map(entity => entity?.name),
        distinctUntilChanged(),
        switchMap(entityName => {
            return this.entityNameChanges$.pipe(
                first(),
                filter(newEntityName => {
                    if (!newEntityName) return true

                    return entityName != newEntityName
                }),
                map(() => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (Object.values(ENTITY_NAME_DEFAULTS).includes(entityName!)) return ''

                    return entityName
                })
            )
        }),
        tap(entityName => {
            /*  This is necessary in case of updating the entityname from empty to also empty.
                Because apparently, angular does not do the update, which is bad when the entityname was edited before,
                meaning, the edited entityname won't be overwritten. So we have to do that manually.
                
                We could narrow this down even further with comparing to the previous entityname (`pairwise()` operator),
                and only update if both are empty, but this should suffice for now. */
            if (entityName === '' && this.editableEntityName?.nativeElement) {
                this.editableEntityName.nativeElement.innerText = ''
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    breadcrumbs$ = this.activeEntityTrace$.pipe(
        map(trace =>
            trace?.map<Breadcrumb>(entity => ({
                title: entity.name,
                icon: EntityType.TASKLIST, // @TODO: Remove hardcoded value
                route: `/home/${entity.id}`,
                contextMenuItems: this.entityOptionsItems.map(({ action, ...item }) => {
                    return {
                        ...item,
                        action: action ? () => action(entity.id) : undefined,
                    }
                }),
            }))
        )
    )

    keydownEvents$ = new BehaviorSubject<KeyboardEvent | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)
    entityNameChanges$ = new BehaviorSubject<string | null>(null)

    entityNameDomState$ = merge(
        this.entityNameChanges$,
        this.activeEntityName$.pipe(
            tap(() => {
                if (this.entityNameChanges$.value !== null) this.entityNameChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    entityNameUpdateEvents$ = merge(
        this.keydownEvents$.pipe(
            filter(event => {
                if (event?.code == 'Enter') {
                    event.preventDefault()
                    return true
                }
                return false
            }),
            switchMap(() => this.entityNameChanges$.pipe(first()))
        ),
        this.blurEvents$.pipe(
            filter(e => !!e),
            switchMap(() => this.entityNameChanges$.pipe(first()))
        ),
        this.entityNameChanges$.pipe(debounceTime(600))
    ).pipe(
        map(newEntityName => {
            if (newEntityName === null) return null

            return newEntityName || DEFAULT_TASKLIST_NAME
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    entityNameUpdatesSubscription = this.entityNameUpdateEvents$
        .pipe(
            distinctUntilChanged(),
            switchMap(newName => {
                return this.activeEntity$.pipe(
                    first(),
                    tap(activeEntity => {
                        if (!activeEntity || !newName) return

                        return this.store.dispatch(entitiesActions.rename({ id: activeEntity.id, newName }))
                    })
                )
            }),
            untilDestroyed(this)
        )
        .subscribe()

    createNewSublist() {
        this.activeEntityId$.pipe(first()).subscribe(activeId => {
            this.store.dispatch(listActions.createTaskList({ parentListId: activeId }))
        })
    }
}
