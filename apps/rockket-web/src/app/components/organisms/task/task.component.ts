import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
    EntityType,
    TaskPreview,
    TaskPreviewFlattend,
    TaskPreviewRecursive,
    TaskPriority,
    TaskStatus,
} from '@rockket/commons'
import { createDocument, getSchema } from '@tiptap/core'
import {
    BehaviorSubject,
    Subject,
    distinctUntilChanged,
    distinctUntilKeyChanged,
    filter,
    first,
    map,
    merge,
    mergeWith,
    share,
    shareReplay,
    startWith,
    throttleTime,
    withLatestFrom,
} from 'rxjs'
import {
    createCounterWidget,
    updateCounterWidget,
} from 'src/app/rich-text-editor/editor-features/extensions/checklist-counter.extension'
import {
    getDefaultEditorFeatures,
    getDefaultEditorLayout,
    provideEditorFeatures,
} from 'src/app/rich-text-editor/editor.features'
import { ChecklistCount, countChecklistItems } from 'src/app/rich-text-editor/editor.helpers'
import { TipTapEditorComponent } from 'src/app/rich-text-editor/tip-tap-editor/tip-tap-editor.component'
import { DeviceService } from 'src/app/services/device.service'
import { colors, taskPriorityColorMap, taskStatusColorMap } from 'src/app/shared/colors'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { insertElementAfter, moveToMacroQueue } from 'src/app/utils'
import { MenuItem } from '../../../dropdown/drop-down/drop-down.component'
import { EntityState, taskPriorityLabelMap, taskStatusLabelMap } from '../../atoms/icons/icon/icons'
import { getStatusCountMapRecursive } from '../../molecules/page-progress-bar/page-progress-bar.component'
import { TaskTreeNode } from '../task-tree/task-tree.component'

@Component({
    selector: 'app-elem-container',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElemContainerComponent implements OnInit {
    constructor(private elemRef: ElementRef<HTMLElement>) {}

    @Input() elem: HTMLElement | null = null
    ngOnInit(): void {
        if (this.elem) this.elemRef.nativeElement.appendChild(this.elem)
    }
}

const editorFeatures = getDefaultEditorFeatures({ checklistCounterFeature: false })
const editorSchema = getSchema(editorFeatures.flatMap(feature => feature.extensions))

@UntilDestroy()
@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [provideEditorFeatures(editorFeatures)],
})
export class TaskComponent {
    constructor(private deviceService: DeviceService) {}

    EntityType = EntityType
    PLACEHOLDER = ENTITY_TITLE_DEFAULTS[EntityType.TASK]

    toolbarLayout$ = this.deviceService.isTouchPrimary$.pipe(map(getDefaultEditorLayout))

    TaskStatus = TaskStatus
    taskStatusLabelMap = taskStatusLabelMap
    statusColorMap = {
        ...taskStatusColorMap,
        [TaskStatus.OPEN]: 'text-tinted-100',
        [TaskStatus.BACKLOG]: 'text-tinted-100',
    }
    TaskPriority = TaskPriority
    taskPriorityLabelMap = taskPriorityLabelMap
    priorityColorMap = taskPriorityColorMap

    placeholderColorMap = {
        ...(Object.fromEntries(
            Object.values(TaskStatus).map(status => [status, colors.tinted[400]]),
        ) as Record<TaskStatus, string>),
        [TaskStatus.COMPLETED]: colors.submit[600],
    }

    searchTerm$ = new BehaviorSubject<string | null>(null)
    @Input() set searchTerm(value: string) {
        this.searchTerm$.next(value)
    }

    task$ = new BehaviorSubject<TaskPreviewFlattend | null>(null)
    nodeData$ = new BehaviorSubject<Omit<TaskTreeNode, 'taskPreview'> | null>(null)
    @Input() set data({ taskPreview, ...data }: TaskTreeNode) {
        this.nodeData$.next(data)
        this.task$.next(taskPreview)
    }

    @Input() set menuItems(items: MenuItem[]) {
        this.menuItemsInput$.next(items)
    }
    menuItemsInput$ = new BehaviorSubject<MenuItem[] | null>(null)
    menuItems$ = this.menuItemsInput$.pipe(
        map(items => {
            if (this.readonly) return null
            if (!items || this.task$.value?.description) return items

            const descriptionItem: MenuItem = {
                title: 'Add description',
                icon: 'description',
                action: () => this.openDescription(),
            }

            const insertAfterIndex = items.findIndex(({ title }) => title && /Rename/.test(title))
            insertElementAfter(items, insertAfterIndex, descriptionItem)

            return items
        }),
        untilDestroyed(this),
        shareReplay(1),
    )

    statusMenuItems$ = this.menuItemsInput$.pipe(
        map(items => {
            if (this.readonly) return null
            return items?.find(({ title }) => title == 'Status')?.children
        }),
    )
    priorityMenuItems$ = this.menuItemsInput$.pipe(
        map(items => {
            if (this.readonly) return null
            return items?.find(({ title }) => title == 'Priority')?.children
        }),
    )

    @Output() expansionChange = new EventEmitter<boolean>()

    @Output() titleChange = new EventEmitter<string>()
    @Output() statusChange = new EventEmitter<TaskStatus>()
    @Output() priorityChange = new EventEmitter<TaskPriority>()

    isOverdue = false
    @Input() isLoading = false
    get loading() {
        return this.isLoading ? EntityState.LOADING : false
    }
    blocked = false // Disabled for now

    @Input() readonly = false

    isSelected = false

    @Output('descriptionChange') descriptionUpdateOnBlur$ = new EventEmitter<string>()

    // This is where the editor output lands
    descriptionUpdates$ = new Subject<string>()
    descriptionState$ = merge(
        this.descriptionUpdates$,
        this.task$.pipe(
            map(task => task?.description),
            filter((description): description is string => description !== undefined && description !== null),
        ),
    ).pipe(share({ resetOnRefCountZero: true }))

    @Output() isDescriptionActive$ = new BehaviorSubject<boolean>(false)
    descriptionBlur$ = new Subject<void>()

    // This is where explicit toggles by the user land
    isDescriptionExpandedInput$ = new Subject<{
        emit: boolean
        isExpanded: boolean
    }>()
    // This is what controls the flow -> combines explicit and implicit toggles (blur events)
    isDescriptionExpandedBus$ = this.nodeData$.pipe(
        map(nodeData => ({ emit: false, isExpanded: nodeData?.isDescriptionExpanded ?? false })),
        mergeWith(this.isDescriptionExpandedInput$),
        mergeWith(
            this.descriptionBlur$.pipe(
                withLatestFrom(this.descriptionState$.pipe(startWith(null))),
                map(([, latestEditorState]) => ({ emit: true, isExpanded: !!latestEditorState })),
            ),
        ),
        startWith({ emit: false, isExpanded: false }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    // This drives the view
    isDescriptionExpanded$ = this.isDescriptionExpandedBus$.pipe(
        map(({ isExpanded }) => isExpanded),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    // This is what the parent component listens to
    @Output('descriptionExpansionChange') isDescriptionExpandedOutput$ = this.isDescriptionExpandedBus$.pipe(
        filter(({ emit }) => emit),
        map(({ isExpanded }) => isExpanded),
        distinctUntilChanged(),
    )

    bindConfig$ = this.task$.pipe(
        filter(Boolean),
        distinctUntilKeyChanged('id'),
        map(task => {
            const description$ = this.task$.pipe(
                map(task => task?.description || ''),
                distinctUntilChanged(),
            )
            return { input$: description$, context: task.id }
        }),
    )

    @ViewChild(TipTapEditorComponent) descriptionEditor?: TipTapEditorComponent

    private counterWidgetId!: string
    private counterWidget: HTMLDivElement | null = null

    getChecklistCounterWidget() {
        if (!this.task$.value) return null
        if (this.counterWidget) return this.counterWidget

        this.counterWidgetId = 'checklist-counter' + this.task$.value.id

        const checklistCount = countChecklistItems(
            this.descriptionEditor?.editor.state.doc ||
                createDocument(this.task$.value.description, editorSchema),
        )

        this.counterWidget = createCounterWidget({
            widgetId: this.counterWidgetId,
            sticky: false,
            withLabel: false,
            style: {
                display: checklistCount.totalItems == 0 ? 'none' : 'flex',
            },
            overrideStyles: true,
            checklistCount,
        })

        this.descriptionState$
            .pipe(untilDestroyed(this), throttleTime(400, undefined, { leading: true, trailing: true }))
            .subscribe(description => {
                if (!this.task$.value) return

                const checklistCount = countChecklistItems(
                    this.descriptionEditor?.editor.state.doc || createDocument(description, editorSchema),
                )

                updateCounterWidget({
                    widgetId: this.counterWidgetId,
                    checklistCount,
                    sticky: false,
                    overrideStyles: true,
                    style: {
                        display: checklistCount.totalItems == 0 ? 'none' : 'flex',
                    },
                })
            })

        return this.counterWidget
    }

    getTaskProgress(task: { children?: TaskPreview[] | null }): ChecklistCount {
        const totalItems = task.children?.length || 0
        const checkedItems =
            task.children?.filter(
                task => task.status == TaskStatus.COMPLETED || task.status == TaskStatus.NOT_PLANNED,
            ).length || 0
        const progress = (checkedItems / totalItems) * 100 || 0

        return { totalItems, checkedItems, progress }
    }
    getTaskProgressRecursive(task: { children?: TaskPreviewRecursive[] | null }): ChecklistCount {
        const statusTaskCountMap = getStatusCountMapRecursive(task.children || [])

        const totalItems = Object.values(statusTaskCountMap).reduce((acc, curr) => acc + curr)
        const checkedItems =
            statusTaskCountMap[TaskStatus.NOT_PLANNED] + statusTaskCountMap[TaskStatus.COMPLETED]
        const progress = (checkedItems / totalItems) * 100 || 0

        return { totalItems, checkedItems, progress }
    }
    private taskCounterWidgetId!: string
    private taskCounterWidget: HTMLDivElement | null = null
    getTaskCounterWidget() {
        if (!this.task$.value) return null
        if (this.taskCounterWidget) return this.taskCounterWidget

        this.taskCounterWidgetId = 'task-counter' + this.task$.value.id
        const taskCount = this.getTaskProgressRecursive(this.task$.value)

        this.taskCounterWidget = createCounterWidget({
            widgetId: this.taskCounterWidgetId,
            sticky: false,
            withLabel: false,
            style: {
                display: taskCount.totalItems == 0 ? 'none' : 'flex',
            },
            overrideStyles: true,
            checklistCount: taskCount,
        })

        // @TODO: can we skip some redundant recalculations here?
        this.task$.pipe(untilDestroyed(this)).subscribe(task => {
            if (!task) return

            const taskCount = this.getTaskProgressRecursive(task)
            updateCounterWidget({
                widgetId: this.taskCounterWidgetId,
                checklistCount: taskCount,
                sticky: false,
                overrideStyles: true,
                style: {
                    display: taskCount.totalItems == 0 ? 'none' : 'flex',
                },
            })
        })

        return this.taskCounterWidget
    }

    openDescription() {
        this.isDescriptionExpandedInput$.next({ emit: false, isExpanded: true })
        moveToMacroQueue(() => {
            this.descriptionEditor?.editor.commands.focus()
        })
    }
    toggleDescription() {
        this.isDescriptionExpanded$.pipe(first()).subscribe(isExpanded => {
            this.isDescriptionExpandedInput$.next({ emit: true, isExpanded: !isExpanded })
        })
    }
}
