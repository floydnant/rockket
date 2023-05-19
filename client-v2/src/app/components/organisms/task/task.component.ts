import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    first,
    map,
    merge,
    shareReplay,
    Subject,
    switchMap,
    tap,
} from 'rxjs'
import { EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { colors, taskStatusColorMap } from 'src/app/shared/colors'
import { ENTITY_TITLE_DEFAULTS } from 'src/app/shared/defaults'
import { insertElementAfter, moveToMacroQueue } from 'src/app/utils'
import { TaskPreviewFlattend, TaskPriority, TaskStatus } from '../../../fullstack-shared-models/task.model'
import { EntityState } from '../../atoms/icons/icon/icons'
import { MenuItem } from '../../../dropdown/drop-down/drop-down.component'
import { TaskTreeNode } from '../task-tree/task-tree.component'
import { RtEditorComponent } from '../../../rich-text-editor/rt-editor/rt-editor.component'

@UntilDestroy()
@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
    EntityType = EntityType
    TaskStatus = TaskStatus
    TaskPriority = TaskPriority
    PLACEHOLDER = ENTITY_TITLE_DEFAULTS[EntityType.TASK]

    statusColorMap = {
        ...taskStatusColorMap,
        [TaskStatus.OPEN]: 'text-tinted-100',
        [TaskStatus.BACKLOG]: 'text-tinted-100',
    }

    placeholderColorMap = {
        ...(Object.fromEntries(Object.values(TaskStatus).map(status => [status, colors.tinted[400]])) as Record<
            TaskStatus,
            string
        >),
        [TaskStatus.COMPLETED]: colors.submit[600],
    }

    highlightQuery$ = new BehaviorSubject<string | null>(null)
    @Input() set highlightQuery(value: string) {
        this.highlightQuery$.next(value)
    }

    task$ = new BehaviorSubject<TaskPreviewFlattend | null>(null)
    nodeData$ = new BehaviorSubject<Omit<TaskTreeNode, 'taskPreview'> | null>(null)
    @Input() set data({ taskPreview, ...data }: TaskTreeNode) {
        this.nodeData$.next(data)
        this.task$.next(taskPreview)
    }

    @Input() set menuItems(items: MenuItem[]) {
        this.menuItems_$.next(items)
    }
    menuItems_$ = new BehaviorSubject<MenuItem[] | null>(null)
    menuItems$ = this.menuItems_$.pipe(
        map(items => {
            if (this.readonly) return null
            if (!items || this.task$.value?.description) return items

            const descriptionItem: MenuItem = {
                title: 'Add description',
                icon: 'description',
                action: () => this.addDescription(),
            }

            const insertAfterIndex = items.findIndex(({ title }) => title && /Rename/.test(title))
            insertElementAfter(items, insertAfterIndex, descriptionItem)

            return items
        }),
        untilDestroyed(this),
        shareReplay(1)
    )

    statusMenuItems$ = this.menuItems_$.pipe(
        map(items => {
            if (this.readonly) return null
            return items?.find(({ title }) => title == 'Status')?.children
        })
    )
    priorityMenuItems$ = this.menuItems_$.pipe(
        map(items => {
            if (this.readonly) return null
            return items?.find(({ title }) => title == 'Priority')?.children
        })
    )

    @Output() expansionChange = new EventEmitter<boolean>()

    @Output() titleChange = new EventEmitter<string>()
    @Output() descriptionChange = new EventEmitter<string>()
    @Output() descriptionExpansionChange = new EventEmitter<boolean>()
    @Output() statusChange = new EventEmitter<TaskStatus>()
    @Output() priorityChange = new EventEmitter<TaskPriority>()

    isOverdue = false
    @Input() isLoading = false
    get loading() {
        return this.isLoading ? EntityState.LOADING : false
    }
    blocked = false // disabled for now

    @Input() readonly = false

    isHovered = false

    descriptionChanges$ = new BehaviorSubject<{ html: string; text: string } | null>(null)

    descriptionExpansionChanges$ = new Subject<{ emit: boolean; isExpanded: boolean }>()
    isDescriptionExpanded$ = merge(
        this.nodeData$.pipe(map(nodeData => ({ emit: false, isExpanded: nodeData?.isDescriptionExpanded ?? false }))),
        this.descriptionExpansionChanges$
    ).pipe(
        distinctUntilChanged((prev, curr) => {
            if (curr.emit) return false

            return prev.isExpanded == curr.isExpanded
        }),
        tap(({ emit, isExpanded }) => {
            if (!emit) return

            this.descriptionExpansionChange.emit(isExpanded)
        }),
        map(({ isExpanded }) => isExpanded),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    @ViewChild('descriptionEditor') descriptionEditor!: RtEditorComponent
    addDescription() {
        this.descriptionExpansionChanges$.next({ emit: false, isExpanded: true })
        moveToMacroQueue(() => {
            this.descriptionEditor.editor.commands.focus()
        })
    }
    resetDescription() {
        this.descriptionEditor.editor.commands.setContent(this.task$.value?.description || '')
    }
    toggleDescription() {
        this.isDescriptionExpanded$.pipe(first()).subscribe(isExpanded => {
            this.descriptionExpansionChanges$.next({ emit: true, isExpanded: !isExpanded })
        })
    }

    isDescriptionFocused$ = new BehaviorSubject<boolean>(false)
    descriptionBlurEvents$ = new Subject()
    descriptionUpdatesSub = this.descriptionBlurEvents$
        .pipe(
            switchMap(() => this.descriptionChanges$.pipe(first())),
            filter(Boolean),
            tap(({ text }) => {
                if (!text) this.descriptionExpansionChanges$.next({ emit: true, isExpanded: false })
            }),
            filter(({ text, html }) => {
                if (!text && !this.task$.value?.description) return false
                // if (this.task$.value?.description == text) return false
                if (this.task$.value?.description == html) return false

                return true
            }),
            tap(({ text, html }) => {
                this.descriptionChange.emit(text ? html : '')

                if (text) this.descriptionExpansionChanges$.next({ emit: true, isExpanded: true })
            }),
            untilDestroyed(this)
        )
        .subscribe()
}
