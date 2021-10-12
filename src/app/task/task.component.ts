import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { Utility } from '../shared/utility.model';
import { Task } from './task.model';

@Component({
    selector: 'task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
    util = new Utility();
    constructor(public modalService: ModalService) {}
    @Output() onDataSensitiveAction = new EventEmitter();
    dataSensitiveAction = () => this.onDataSensitiveAction.emit();

    @Input() @Output() data!: Task;

    setCompleted = (status: boolean) => {
        this.data.isCompleted = status;
        this.data.timeCompleted = new Date();

        this.dataSensitiveAction();
    };

    toggleCompleted = () => this.setCompleted(!this.data.isCompleted);

    addSubTask = () => {
        const newTaskName = prompt('new task name') || '';
        if (!newTaskName) return;
        this.data.subTasks.push(new Task(newTaskName));

        this.dataSensitiveAction();
    };

    toggleSubtaskList = () => {
        this.data.collapseSubtaskList = !this.data.collapseSubtaskList;

        this.dataSensitiveAction();
    };

    editTask = () => {
        this.modalService.open('modal-' + this.data.id);

        // const newTaskName = prompt('new task name', this.data.name); // TODO: make edit menu work
        // if (!newTaskName) return;
        // this.data.name = newTaskName;

        // this.dataSensitiveAction();
    };

    @Output() onDeleteTask = new EventEmitter<string>();
    deleteTask = (id: string) => this.onDeleteTask.emit(id);

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
        // alternate the background of every 2nd task
        document.querySelectorAll<HTMLElement>('.task').forEach((taskElement, i) => {
            if (i % 2 === 1) taskElement.style.background = 'var(--alt-bg)';
        });
    }
}
