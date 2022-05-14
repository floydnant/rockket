import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { TasksService } from 'src/app/services/tasks.service';
import { TaskUiState, UiStateService } from 'src/app/services/ui-state.service';
import { AppData, AppDataActions } from '../../../reducers';
import { Task } from '../../../shared/task.model';
import { countTasks, countTasksRecursive } from '../../../shared/taskList.model';
import { formatDateRelative, isTouchDevice, moveToMacroQueue } from '../../../shared/utils';
import { DialogService } from '../../organisms/dialog';
import { editmenuOptions } from '../../organisms/edit-menu/edit-menu.model';
import { EditMenuService } from '../../../services/edit-menu.service';
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
    constructor(private tasksService: TasksService, private uiStateService: UiStateService) {}
    ngOnInit() {
        this.isCompleted = this.data.isCompleted;

        this.openTasksCount = countTasks(this.data.subTasks);
        this.completedTasksCount = countTasks(this.data.subTasks, 'closed');

        this.formattedCompletionDate = this.isCompleted ? formatDateRelative(this.data.completedAt) || 'invalid' : null;

        this.uiState = this.uiStateService.getTaskState(this.data.id);
        this.isDetailsPopOutOpen = this.uiState.detailsPopOut.keepOpen;
        this.updatedNotes = this.data.meta.notes;
    }

    @Input() taskPosition: number;
    @Input() data: Task;
    completedTasksCount: number;
    openTasksCount: number;

    formattedCompletionDate: string | null;

    isCompleteBtnHovered = false; //TODO: outsource this into CSS

    isTouchDevice = isTouchDevice();
    isTaskActionBtnsMenuOpenOnTouchDevice = false;
    setIsTaskActionBtnsMenuOpenOnTouchDevice = (nowOpen: boolean) => (this.isTaskActionBtnsMenuOpenOnTouchDevice = nowOpen);

    quickAddInputFocusEventSubject = new Subject<boolean>();
    focusQuickAddInputField = () => this.quickAddInputFocusEventSubject.next(true);

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
    
    isFocused = false;
    updatedTaskName: string;
    updateTaskName() {
        if (this.updatedTaskName != this.data.name)
            this.tasksService.updateTaskDetails({ ...this.data, name: this.updatedTaskName });
    }

    isNotesBlockFocused = false;
    updatedNotes: string;
    updateNotes() {
        if (this.updatedNotes == this.data.meta.notes) return;

        this.tasksService.updateTaskDetails({
            ...this.data,
            meta: { ...this.data.meta, notes: this.updatedNotes },
        });
    }
    @ViewChild('notesBlock') notesBlock: ElementRef<HTMLDivElement>;
    notesBlockKeydownHandler(e: KeyboardEvent) {
        if (e.key == 'Enter' && (e.ctrlKey || e.metaKey)) this.leaveNotesBlock();
        if (e.key == 'Escape') {
            this.resetNotesBlock();
            this.leaveNotesBlock();
        }
    }
    @ViewChild('detailIconsWrapper') detailIconsWrapper: ElementRef<HTMLSpanElement>;
    @ViewChild('popOutContainer') popOutContainer: ElementRef<HTMLDivElement>;
    notesBlockOutsideClickHandler(event: MouseEvent) {
        if (!this.isDetailsPopOutOpen || !this.isNotesBlockFocused) return;

        const elemsToCheckIfClicked: ElementRef<HTMLElement>[] = [this.popOutContainer, this.detailIconsWrapper];
        const clickedOutsideNotesBlock = !event
            .composedPath()
            .some(elem => elemsToCheckIfClicked.some(elemToCheck => elem == elemToCheck?.nativeElement));
        if (clickedOutsideNotesBlock) this.leaveNotesBlock();
    }
    leaveNotesBlock() {
        this.notesBlock.nativeElement.blur();
        this.isNotesBlockFocused = false;

        if (this.uiState.detailsPopOut.keepOpen) this.updateNotes();
        else this.toggleDetailsPopOutOpen();
    }
    resetNotesBlock() {
        this.updatedNotes = this.data.meta.notes;
        this.notesBlock.nativeElement.innerHTML = this.data.meta.notes;
    }

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
                this.resetNotesBlock();
                this.notesBlock?.nativeElement?.focus();
            });
        } else {
            this.setKeepDetailsPopOutOpen(false);
            if (saveChanges) this.updateNotes();
        }
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
            this.openTasksCount--;
        } else {
            this.completedTasksCount--;
            this.openTasksCount++;
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
            { ...this.data, meta: { ...this.data.meta, notes: this.updatedNotes } },
            allowEdit,
            highlight
        );
        this.setIsViewingDetails(false);
    }

    async deleteTask() {
        this.setIsDeleting(true);

        // TODO: make this an inline prompt / hold to delete
        await this.tasksService.deleteTask(this.data.id, this.openTasksCount);
        this.setIsDeleting(false);
    }
}
