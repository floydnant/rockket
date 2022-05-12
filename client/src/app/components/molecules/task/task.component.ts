import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
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
        './css/task-progress.task.component.css',
        './css/details-pop-out.task.component.css',
        './css/detail-icons.task.component.css',
        './css/completed-at.task.component.css',
    ],
})
export class TaskComponent implements OnInit {
    constructor(
        public modalService: ModalService,
        private store: Store<AppData>,
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

    updatedName: string;
    updateTaskName() {
        if (this.updatedName != this.data.name)
            this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, name: this.updatedName }));
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

        this.store.dispatch(
            new AppDataActions.EditTask(this.data.id, {
                ...this.data,
                meta: { ...this.data.meta, notes: this.notesAreaValue },
            })
        );
    }

    @Output() completion = new EventEmitter<boolean>();
    isCompleted: boolean;
    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);
    private setCompleted = (status: boolean) => {
        const openSubtasksLeft = !this.data.isCompleted && countTasksRecursive(this.data.subTasks) > 0;
        const dispatchAction = (completeAllSubtasks = false) => {
            if (status && (!openSubtasksLeft || completeAllSubtasks)) this.toggleCollapseSubtaskList(true);
            this.isCompleted = status;
            this.completion.emit(status);

            setTimeout(() => {
                this.store.dispatch(new AppDataActions.SetCompleted(this.data.id, status, completeAllSubtasks));
            }, 600);
        };

        if (openSubtasksLeft)
            this.dialogService
                .confirm({
                    title: 'Open subtasks left!',
                    text: 'Do you want to mark all subtasks as completed too?',
                    buttons: ['Keep uncompleted', 'Cancel', 'OK'],
                })
                .then(() => dispatchAction(true))
                .catch(clickedButton => clickedButton == 'Keep uncompleted' && dispatchAction());
        else dispatchAction();
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
        this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, priority }));
    }

    addSubTask = (newTaskName?: string) => {
        const dispatchNewSubtaskAction = (newTaskName: string) =>
            this.store.dispatch(new AppDataActions.AddSubtask(this.data.id, newTaskName));

        if (newTaskName) {
            dispatchNewSubtaskAction(newTaskName);
            this.focusQuickAddInputField();
        } else
            this.dialogService
                .prompt({ title: 'Create new subtask:', buttons: ['Cancel', 'Create'], placeholder: 'subtask name' })
                .then((newTaskName: string) => {
                    dispatchNewSubtaskAction(newTaskName);
                    this.focusQuickAddInputField();
                })
                .catch(() => {});
    };

    editDetails = (hightlight?: editmenuOptions['hightlight']) => {
        this.setIsViewingDetails(true);
        this.editMenuService
            .editTaskDetails(
                { ...this.data, meta: { ...this.data.meta, notes: this.notesAreaValue } },
                false,
                hightlight
            )
            .then((updatedTask: Task) => {
                this.setIsViewingDetails(false);
                this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, ...updatedTask }));
            })
            .catch(err => {
                this.setIsViewingDetails(false);
                if (err == 'Deleted') this.deleteTask(this.data.id);
            });
    };
    showDetails = (hightlight?: editmenuOptions['hightlight']) => {
        this.setIsViewingDetails(true);
        this.editMenuService
            .editTaskDetails(this.data, true, hightlight)
            .then(() => this.setIsViewingDetails(false))
            .catch(err => {
                this.setIsViewingDetails(false);
                if (err == 'Deleted') this.deleteTask(this.data.id);
            });
    };

    deleteTask = (id: string, prompt = true) => {
        this.setIsDeleting(true);
        const del = () => this.store.dispatch(new AppDataActions.DeleteTask(this.data.id));
        const openSubtasksCount = this.data.subTasks.filter(task => !task.isCompleted).length;
        if (prompt)
            // TODO: make this an inline prompt / hold to delete
            this.dialogService
                .confirm({
                    title: `Delete this task?`,
                    text: openSubtasksCount
                        ? `and ${openSubtasksCount > 1 ? `all ` : ''}it's ${openSubtasksCount} open ${
                              openSubtasksCount > 1 ? `subtasks` : 'subtask'
                          }?`
                        : null,
                    buttons: ['Cancel', '!Delete' + (openSubtasksCount ? ' all' : '')],
                })
                .then(() => del())
                .catch(() => this.setIsDeleting(false));
        else del();
    };
}
