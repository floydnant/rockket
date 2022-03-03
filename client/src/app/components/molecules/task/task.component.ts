import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalService } from '../modal/modal.service';
import { AppData } from '../../../reducers';
import { isTouchDevice, formatDateRelative } from '../../../shared/utility.model';
import { Task } from '../../../shared/task.model';

import { AppDataActions } from '../../../reducers';
import { DialogService } from '../../organisms/custom-dialog';
import { EditMenuService } from '../../organisms/edit-menu/edit-menu.service';
import { countOpenTasksMultiLevel, countOpenTasks } from '../../../shared/taskList.model';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
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
            document.querySelector<HTMLInputElement>('#_' + this.data.id).focus();
        }, 200);
    };

    constructor(
        public modalService: ModalService,
        private store: Store<AppData>,
        private dialogService: DialogService,
        private editMenuService: EditMenuService
    ) {}

    @Input() @Output() data: Task;
    isCompleted: boolean;
    priorityArr: any[];

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
    editTaskDetails = (viewLinks = false) => {
        this.editMenuService
            .editTaskDetails(this.data, false, viewLinks)
            .then((updatedTask: Task) => {
                this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, ...updatedTask } as any));
            })
            .catch(err => {
                if (err == 'Deleted') this.deleteTask(this.data.id);
            });
    };
    showDetails = (viewLinks = false) => {
        this.editMenuService
            .editTaskDetails(this.data, true, viewLinks)
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
        this.completedTasks = this.data.subTasks.filter(task => task.isCompleted);

        this.priorityArr = [];
        for (let i = 0; i < parseInt(this.data.priority as unknown as string); i++) this.priorityArr.push(1);
    }

    // ngOnChanges(changes: SimpleChanges): void {}
}
