import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { TaskUiState, UiStateService } from 'src/app/services/ui-state.service';
import { AppData, AppDataActions } from '../../../reducers';
import { sortCompletedTasks, Task } from '../../../shared/task.model';
import { countOpenTasks, countOpenTasksMultiLevel } from '../../../shared/taskList.model';
import { formatDateRelative, isTouchDevice } from '../../../shared/utility.model';
import { DialogService } from '../../organisms/custom-dialog';
import { editmenuOptions } from '../../organisms/edit-menu/edit-menu.model';
import { EditMenuService } from '../../organisms/edit-menu/edit-menu.service';
import { ModalService } from '../modal/modal.service';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit, AfterViewInit {
    formatDateRelative = formatDateRelative;
    countOpenTasks = countOpenTasks;

    @Input() taskPosition: number;

    log = (...v: any) => console.log(...v);

    completeBtnIsHovered = false;

    isTouchDevice = isTouchDevice();
    touchDevice_showBtns = false;
    /** toggle the task action buttons when on touch a device */
    toggleTaskActionBtns = (v: boolean) => (this.touchDevice_showBtns = v);

    focusQuickAddInputField = () => {
        setTimeout(() => {
            document.querySelector<HTMLInputElement>('#_' + this.data.id)?.focus();
        }, 200);
    };

    uiState: TaskUiState;
    setNotesPopOutState(open: boolean) {
        this.uiState.notesPopOutOpen = open;
        this.uiStateService.setTaskState(this.data.id, { ...this.uiState, notesPopOutOpen: open });
    }

    @ViewChild('notesArea') notesArea: ElementRef<HTMLTextAreaElement>;
    setHeightOfArea(area: HTMLTextAreaElement = this.notesArea?.nativeElement) {
        if (area) area.style.height = area.scrollHeight + 2 + 'px';
    }
    toggleNotesPopOutOpen(save = true) {
        this.setNotesPopOutState(!this.uiState.notesPopOutOpen);

        if (this.uiState.notesPopOutOpen) {
            this.notesAreaValue = this.data.meta.notes;
            setTimeout(() => {
                this.setHeightOfArea();
                this.notesArea.nativeElement.focus();
            }, 0);
        } else if (this.notesAreaValue != this.data.meta.notes && save) this.updateNotes();
    }

    constructor(
        public modalService: ModalService,
        private store: Store<AppData>,
        private dialogService: DialogService,
        private editMenuService: EditMenuService,
        private uiStateService: UiStateService
    ) {}

    @Input() @Output() data: Task;
    isCompleted: boolean;

    uncompletedTasks: Task[];
    @Input() showCompleted: boolean;
    completedTasks: Task[];

    setCompleted = (status: boolean) => {
        const dispatchAction = (allSubtasks = false) => {
            this.isCompleted = status;

            setTimeout(
                () => this.store.dispatch(new AppDataActions.SetCompleted(this.data.id, status, allSubtasks)),
                600
            );
        };

        if (!this.data.isCompleted && countOpenTasksMultiLevel(this.data.subTasks) > 0)
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
    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);

    setPriority(priority: number) {
        this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, priority }));
    }

    notesAreaValue: string;
    updateNotes() {
        if (this.notesAreaValue != this.data.meta.notes)
            this.store.dispatch(
                new AppDataActions.EditTask(this.data.id, {
                    ...this.data,
                    meta: { ...this.data.meta, notes: this.notesAreaValue },
                })
            );
    }

    dispatchNewSubtaskAction = (newTaskName: string) =>
        this.store.dispatch(new AppDataActions.AddSubtask(this.data.id, newTaskName));
    addSubTask = (newTaskName?: string) => {
        if (!newTaskName)
            this.dialogService
                .prompt({ title: 'Create new subtask:', buttons: ['Cancel', 'Create'], placeholder: 'subtask name' })
                .then((newTaskName: string) => {
                    this.dispatchNewSubtaskAction(newTaskName);
                    this.focusQuickAddInputField();
                })
                .catch(() => {});
        else {
            this.dispatchNewSubtaskAction(newTaskName);
            this.focusQuickAddInputField();
        }
    };
    toggleSubtaskList = () => this.store.dispatch(new AppDataActions.ToggleSubtaskList(this.data.id));
    editTaskDetails = (hightlight?: editmenuOptions['hightlight']) => {
        this.editMenuService
            .editTaskDetails(
                { ...this.data, meta: { ...this.data.meta, notes: this.notesAreaValue } },
                false,
                hightlight
            )
            .then((updatedTask: Task) => {
                this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, ...updatedTask }));
            })
            .catch(err => {
                if (err == 'Deleted') this.deleteTask(this.data.id);
            });
    };
    showDetails = (hightlight?: editmenuOptions['hightlight']) => {
        this.editMenuService
            .editTaskDetails(this.data, true, hightlight)
            .then(() => {})
            .catch(err => {
                if (err == 'Deleted') this.deleteTask(this.data.id);
            });
    };
    deleteTask = (id: string, prompt = true) => {
        const del = () => this.store.dispatch(new AppDataActions.DeleteTask(this.data.id));
        const openSubtasksCount = this.data.subTasks.filter(task => !task.isCompleted).length;
        if (prompt)
            // TODO: make this an inline prompt
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
                .catch(() => {});
        else del();
    };

    ngOnInit(): void {
        this.isCompleted = this.data.isCompleted;

        this.uncompletedTasks = this.data.subTasks.filter(task => !task.isCompleted);
        this.completedTasks = this.data.subTasks.filter(task => task.isCompleted).sort(sortCompletedTasks);

        this.uiState = this.uiStateService.getTaskState(this.data.id);
        this.notesAreaValue = this.data.meta.notes;
    }
    ngAfterViewInit() {
        this.setHeightOfArea();
    }
    // ngOnChanges(changes: SimpleChanges): void {}
}
