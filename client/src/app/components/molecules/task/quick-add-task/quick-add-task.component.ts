import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'quick-add-task',
    templateUrl: './quick-add-task.component.html',
    styleUrls: ['./quick-add-task.component.css'],
})
export class QuickAddTaskComponent implements OnInit {
    constructor() {}

    newTaskName: string = '';

    @Output() onAddTask = new EventEmitter<string>();
    addTask = () => {
        this.onAddTask.emit(this.newTaskName);
        this.newTaskName = '';
    };

    ngOnInit(): void {}
}
