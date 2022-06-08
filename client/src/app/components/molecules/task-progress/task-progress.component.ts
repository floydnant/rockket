import { Component, Input } from '@angular/core';

@Component({
    selector: 'task-progress',
    templateUrl: './task-progress.component.html',
    styleUrls: ['./task-progress.component.scss'],
})
export class TaskProgressComponent {
    @Input() tasksCount: number;
    @Input() completedTasksCount: number;
    @Input() openTasksCount: number;

    @Input() showAlways = false;

    @Input() variant: 'border' | 'bar' = 'border';
}
