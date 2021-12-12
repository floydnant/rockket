import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalService } from '../modal/modal.service';
import { AppData } from '../reducers';
import { Utility, isTouchDevice } from '../shared/utility.model';
import { Task } from '../shared/task.model';

import { AppDataActions } from '../reducers';
import { DialogService } from '../custom-dialog';
import { EditMenuService } from '../edit-menu/edit-menu.service';
import { countOpenTasksMultiLevel, countOpenTasks } from '../shared/taskList.model';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
    util = new Utility();
    countOpenTasks = countOpenTasks;

    isTouchDevice = isTouchDevice();
    touchDevice_showBtns = false;
    /** toggle the task action buttons when on touch a device */
    toggleTaskActionBtns = (v: boolean) => (this.touchDevice_showBtns = v);

    constructor(
        public modalService: ModalService,
        private store: Store<AppData>,
        private dialogService: DialogService,
        private editMenuService: EditMenuService
    ) {}

    @Input() @Output() data: Task;

    uncompletedTasks: Task[];
    @Input() showCompleted = true;
    completedTasks: Task[];

    setCompleted = (status: boolean) => {
        const dispatchAction = (allSubtasks = false) =>
            this.store.dispatch(new AppDataActions.SetCompleted(this.data.id, status, allSubtasks));

        if (!this.data.isCompleted && countOpenTasksMultiLevel(this.data.subTasks) > 0)
            this.dialogService
                .confirm({
                    title: 'Open subtasks left!',
                    text: 'Do you want to mark all subtasks as completed too?',
                    buttons: ['keep uncompleted', 'OK'],
                })
                .then(() => dispatchAction(true))
                .catch(err => dispatchAction());
        else dispatchAction();
    };
    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);

    dispatchNewSubtaskAction = (newTaskName: string) =>
        this.store.dispatch(new AppDataActions.AddSubtask(this.data.id, newTaskName));
    addSubTask = () => {
        this.dialogService
            .prompt({ title: 'Create new subtask:', buttons: ['Cancel', 'Create'] })
            .then((newTaskName: string) => this.dispatchNewSubtaskAction(newTaskName))
            .catch(() => {});
    };
    toggleSubtaskList = () => this.store.dispatch(new AppDataActions.ToggleSubtaskList(this.data.id));
    editTask = () => {
        this.editMenuService
            .editTask(this.data)
            .then((updatedTask: Task) => {
                this.store.dispatch(new AppDataActions.EditTask(this.data.id, { ...this.data, ...updatedTask } as any));
            })
            .catch(err => {
                if (err == 'Deleted') this.deleteTask(this.data.id);
            });
    };
    deleteTask = (id: string, prompt = true) => {
        const del = () => this.store.dispatch(new AppDataActions.DeleteTask(this.data.id));
        if (prompt)
            this.dialogService
                .confirm({ title: 'Delete this task?', buttons: ['Cancel', '!Delete'] })
                .then(() => {
                    del();
                }) // TODO: make this an inline animation
                .catch(() => {});
        else del();
    };

    ngOnInit(): void {
        this.uncompletedTasks = this.data.subTasks.filter(task => !task.isCompleted);
        this.completedTasks = this.data.subTasks.filter(task => task.isCompleted);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // alternate the background of every 2nd task
        document.querySelectorAll<HTMLElement>('.task').forEach((taskElement, i) => {
            if (i % 2 === 1) taskElement.style.background = 'var(--alt-bg)';
        });
    }
}
