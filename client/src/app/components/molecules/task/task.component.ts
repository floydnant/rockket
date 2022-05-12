import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { TasksService } from 'src/app/services/tasks.service';
import { TaskUiState, UiStateService } from 'src/app/services/ui-state.service';
import { AppData, AppDataActions } from '../../../reducers';
import { Task } from '../../../shared/task.model';
import { countTasks, countTasksRecursive } from '../../../shared/taskList.model';
import { formatDateRelative, isTouchDevice, moveToMacroQueue } from '../../../shared/utils';
import { DialogService } from '../../organisms/custom-dialog';
import { editmenuOptions } from '../../organisms/edit-menu/edit-menu.model';
import { EditMenuService } from '../../organisms/edit-menu/edit-menu.service';
import { ModalService } from '../modal/modal.service';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: [
        './css/task.component.css',
        './css/priority-icon.task.component.css',
        './css/details-pop-out.task.component.css',
        './css/detail-icons.task.component.css',
        './css/completed-at.task.component.css',
    ],
})
export class TaskComponent implements OnInit {
    constructor(
        public modalService: ModalService,
        private store: Store<AppData>,
        private tasksService: TasksService,
        private dialogService: DialogService,
        private editMenuService: EditMenuService,
        private uiStateService: UiStateService
    ) {}

    ngOnInit(): void {
        this.isCompleted = this.data.isCompleted;

        this.uncompletedTasksCount = countTasks(this.data.subTasks);
        this.completedTasksCount = countTasks(this.data.subTasks, 'closed');

        this.formattedCompletionDate = this.isCompleted ? formatDateRelative(this.data.completedAt) || 'invalid' : null;

        this.uiState = this.uiStateService.getTaskState(this.data.id);
        this.isDetailsPopOutOpen = this.uiState.detailsPopOut.keepOpen;
        this.notesAreaValue = this.data.meta.notes;
    }

    @Input() taskPosition: number;
    @Input() data: Task;
    completedTasksCount: number;
    uncompletedTasksCount: number;

    updatedTaskName: string;
    updateTaskName() {
        if (this.updatedTaskName != this.data.name)
            this.tasksService.updateTaskDetails({ ...this.data, name: this.updatedTaskName });
    }

    isFocused = false;
    isViewingDetails = false;
    setIsViewingDetails(isViewing: boolean) {
        if (isViewing) this.isViewingDetails = true;
        else setTimeout(() => (this.isViewingDetails = false), 500);
    }
    isDeleting = false;
    setIsDeleting(isDeleting: boolean) {
        if (isDeleting) this.isDeleting = true;
        else setTimeout(() => (this.isDeleting = false), 500);
    }

    formattedCompletionDate: string | null;

    completeBtnIsHovered = false; //TODO: outsource this into CSS

    isTouchDevice = isTouchDevice();
    showTaskActionButtonsOnTouchDevice = false;
    setShowTaskActionButtonsOnTouchDevice = (show: boolean) => (this.showTaskActionButtonsOnTouchDevice = show);

    quickAddInputFieldEventSubject = new Subject<boolean>();
    focusQuickAddInputField = () => this.quickAddInputFieldEventSubject.next(true);

    uiState: TaskUiState;
    isDetailsPopOutOpen: boolean;
    setKeepDetailsPopOutOpen(keepOpen: boolean) {
        this.uiState.detailsPopOut.keepOpen = keepOpen;
        this.uiStateService.setTaskState(this.data.id, this.uiState);
    }
    toggleCollapseCompletedSubtasks() {
        this.uiState.collapseCompletedSubtasks = !this.uiState.collapseCompletedSubtasks;
        this.uiStateService.setTaskState(this.data.id, this.uiState);
    }
    toggleCollapseSubtaskList(collapse?: boolean) {
        this.uiState.collapseSubtaskList = collapse !== undefined ? collapse : !this.uiState.collapseSubtaskList;
        this.uiStateService.setTaskState(this.data.id, this.uiState);
    }
    toggleDetailsPopOutOpen(saveChanges = true) {
        this.isDetailsPopOutOpen = !this.isDetailsPopOutOpen;

        if (this.isDetailsPopOutOpen) {
            moveToMacroQueue(() => {
                this.resetNotesArea();
                this.notesArea?.nativeElement?.focus();
            });
        } else {
            this.setKeepDetailsPopOutOpen(false);
            if (saveChanges) this.updateNotes();
        }
    }

    @ViewChild('notesArea') notesArea: ElementRef<HTMLTextAreaElement>;
    setNotesAreaHeight() {
        const area = this.notesArea?.nativeElement;
        if (!area) return;

        area.style.height = '10px';
        area.style.height = area.scrollHeight + 2 + 'px';

        if (this.uiState.detailsPopOut.keepOpen && this.uiState.detailsPopOut.notesAreaHeight != area.style.height) {
            this.uiState.detailsPopOut.notesAreaHeight = area.style.height;
            this.uiStateService.setTaskState(this.data.id, {
                ...this.uiState,
                detailsPopOut: {
                    ...this.uiState.detailsPopOut,
                    notesAreaHeight: this.uiState.detailsPopOut.notesAreaHeight,
                },
            });
        }
    }
    resetNotesArea() {
        this.notesAreaValue = this.data.meta.notes;
        moveToMacroQueue(() => this.setNotesAreaHeight());
    }
    @ViewChild('detailIconsWrapper') detailIconsWrapper: ElementRef<HTMLSpanElement>;
    @ViewChild('popOutContainer') popOutContainer: ElementRef<HTMLDivElement>;
    @HostListener('document:click', ['$event'])
    notesAreaBlurHandler(event: MouseEvent) {
        if (!this.isDetailsPopOutOpen || !this.popOutContainer?.nativeElement) return;

        const elemsToCheck: ElementRef<HTMLElement>[] = [this.popOutContainer, this.detailIconsWrapper];
        const clickedOneOfThem = event
            .composedPath()
            .some(elem => elemsToCheck.some(elemToCheck => elem == elemToCheck?.nativeElement));

        if (!clickedOneOfThem)
            if (this.uiState.detailsPopOut.keepOpen) this.updateNotes();
            else this.toggleDetailsPopOutOpen();
    }
    notesAreaValue: string;
    updateNotes() {
        if (this.notesAreaValue == this.data.meta.notes) return;

        this.tasksService.updateTaskDetails({
            ...this.data,
            meta: { ...this.data.meta, notes: this.notesAreaValue },
        });
    }

    @Output() completion = new EventEmitter<boolean>();
    isCompleted: boolean;
    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);
    private setCompleted = async (nowCompleted: boolean) => {
        const { changedStatus, collapseSubtaskList } = await this.tasksService.updateTaskStatus(this.data.id, {
            nowCompleted,
            wasCompletedBefore: this.data.isCompleted,
            hasOpenSubtasks: countTasksRecursive(this.data.subTasks) > 0,
        });

        if (changedStatus) {
            this.isCompleted = nowCompleted;
            this.completion.emit(nowCompleted);
            if (collapseSubtaskList) this.toggleCollapseSubtaskList(true);
        }
    };
    onSubtaskCompletion(isCompleted: boolean) {
        if (isCompleted) {
            this.completedTasksCount++;
            this.uncompletedTasksCount--;
        } else {
            this.completedTasksCount--;
            this.uncompletedTasksCount++;
        }
    }

    setPriority(priority: number) {
        this.tasksService.updateTaskDetails({ ...this.data, priority });
    }

    async addSubTask(newTaskName?: string) {
        const { created } = await this.tasksService.addSubtask(this.data.id, newTaskName);
        if (created) this.focusQuickAddInputField();
    }

    async openDetails(allowEdit: boolean, highlight?: editmenuOptions['hightlight']) {
        this.setIsViewingDetails(true);
        await this.tasksService.openTaskDetails(
            { ...this.data, meta: { ...this.data.meta, notes: this.notesAreaValue } },
            allowEdit,
            highlight
        );
        this.setIsViewingDetails(false);
    };

    async deleteTask() {
        this.setIsDeleting(true);

        // TODO: make this an inline prompt / hold to delete
        await this.tasksService.deleteTask(this.data.id, this.uncompletedTasksCount);
        this.setIsDeleting(false);
    }
}
