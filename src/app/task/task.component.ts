import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalService } from '../modal/modal.service';
import { AppData } from '../reducers';
import { Utility } from '../shared/utility.model';
import { Task } from './task.model';

import { AppDataActions } from '../reducers';
import { DialogService } from '../custom-dialog';
import { EditMenuService } from '../edit-menu/edit-menu.service';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
    util = new Utility();

    constructor(
        public modalService: ModalService,
        private store: Store<AppData>,
        private dialogService: DialogService,
        private editMenuService: EditMenuService
    ) {}

    @Input() @Output() data!: Task;

    setCompleted = (status: boolean) => this.store.dispatch(new AppDataActions.SetCompleted(this.data.id));
    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);
    addSubTask = () => {
        this.dialogService
            .prompt({ title: 'Create new subtask:', buttons: ['Cancel', 'Create'] })
            .then((newTaskName: string) => {
                this.store.dispatch(new AppDataActions.AddSubtask(this.data.id, newTaskName));
            })
            .catch(() => {});
    };
    toggleSubtaskList = () => this.store.dispatch(new AppDataActions.ToggleSubtaskList(this.data.id));
    editTask = () => {
        // this.dialogService
        //     .prompt({ title: 'Update task name:', defaultValue: this.data.name, buttons: ['Cancel', 'Update'] })
        this.editMenuService
            .editTask(this.data)
            .then((updatedTask: Task) => {
                // const updatedTask = JSON.parse(JSON.stringify(this.data));
                // updatedTask.name = updatedTaskName;
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

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        // alternate the background of every 2nd task
        document.querySelectorAll<HTMLElement>('.task').forEach((taskElement, i) => {
            if (i % 2 === 1) taskElement.style.background = 'var(--alt-bg)';
        });
    }
}
