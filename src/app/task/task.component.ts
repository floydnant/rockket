import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { ModalService } from '../modal/modal.service';
import { AppData } from '../reducers';
import { Utility } from '../shared/utility.model';
import { Task } from './task.model';

import * as AppDataActions from '../reducers';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
    util = new Utility();

    constructor(public modalService: ModalService, private store: Store<AppData>) {}

    @Output() onDataSensitiveAction = new EventEmitter();
    dataSensitiveAction = () => this.onDataSensitiveAction.emit();

    @Input() @Output() data!: Task;

    setCompleted = (status: boolean) => {
        // this.data.isCompleted = status;
        // this.data.timeCompleted = new Date();
        this.store.dispatch(new AppDataActions.SetCompleted(this.data.id));
        // this.dataSensitiveAction();
    };

    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);

    addSubTask = () => {
        const newTaskName = prompt('new task name');
        if (!newTaskName) return;
        // this.data.subTasks.push(new Task(newTaskName));
        this.store.dispatch(new AppDataActions.AddSubtask(this.data.id, newTaskName));

        this.dataSensitiveAction();
    };

    toggleSubtaskList = () => {
        // this.data.collapseSubtaskList = !this.data.collapseSubtaskList;
        this.store.dispatch(new AppDataActions.ToggleSubtaskList(this.data.id));

        this.dataSensitiveAction();
    };

    editTask = () => {
        // this.modalService.open('modal-' + this.data.id);

        const newTaskName = prompt('new task name', this.data.name); // TODO: make edit menu work
        if (!newTaskName) return;
        const updatedTask = JSON.parse(JSON.stringify(this.data));
        updatedTask.name = newTaskName;

        this.store.dispatch(new AppDataActions.EditTask(this.data.id, updatedTask));

        // this.dataSensitiveAction();
    };

    deleteTask = (id: string, prompt = true) => {
        // const parentArr: any = this.getTaskById(id, this.activeTaskList.list, true);
        // const task: any = this.getTaskById(id, this.activeTaskList.list);
        // const indexOfTaskInParentArr = parentArr.indexOf(task);
        if (prompt) if (!confirm('Delete this task?')) return; // TODO: make this an inline animation
        // parentArr.splice(indexOfTaskInParentArr, 1);
        this.store.dispatch(new AppDataActions.DeleteTask(this.data.id));
        // this.db.save();
    };

    // @Output() onDeleteTask = new EventEmitter<string>();
    // deleteTask = (id: string) => this.onDeleteTask.emit(id);

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        // alternate the background of every 2nd task
        document.querySelectorAll<HTMLElement>('.task').forEach((taskElement, i) => {
            if (i % 2 === 1) taskElement.style.background = 'var(--alt-bg)';
        });
    }
}
