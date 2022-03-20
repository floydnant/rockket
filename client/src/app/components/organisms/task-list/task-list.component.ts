import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { sortCompletedTasks, Task } from 'src/app/shared/task.model';
import { countOpenTasks } from 'src/app/shared/taskList.model';
import { generateId, getCopyOf } from 'src/app/shared/utility.model';

@Component({
    selector: 'task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.css'],
})
export class TasklistComponent implements OnInit, OnChanges {
    constructor() {}

    @Input() tasklist: Task[];
    uncompletedTasks: Task[];
    completedTasks: Task[];
    sortableTaskData: Task[];

    @Input() variant: 'task' | 'subtask';
    @Input() id: string = generateId();
    @Input() taskPosition?: number = 0;
    @Input() isCompleted?: boolean = false;
    @Input() collapseCompletedTasks: boolean = true;

    @Output() onAddSubtask = new EventEmitter<string>();
    addTask(newTaskName: string) {
        this.onAddSubtask.emit(newTaskName);
    }
    @Output() onToggleCollapseCompleted = new EventEmitter();
    toggleCollapseCompletedSubtasks() {
        this.onToggleCollapseCompleted.emit();
    }

    @Input() focusChangeEvents?: Observable<boolean>;
    private focusChangeEventsSubscription?: Subscription;
    changeQuickAddInputFocus = (focus: boolean) => {
        if (focus)
            setTimeout(() => {
                document.querySelector<HTMLInputElement>('#_' + this.id)?.focus();
            }, 200);
        else document.querySelector<HTMLInputElement>('#_' + this.id)?.blur();
    };

    private initData() {
        this.tasklist ||= [];
        this.uncompletedTasks = this.tasklist.filter(task => !task.isCompleted);
        this.completedTasks = this.tasklist.filter(task => task.isCompleted).sort(sortCompletedTasks);

        this.sortableTaskData = getCopyOf(this.uncompletedTasks);
    }
    ngOnInit(): void {
        this.initData();

        if (this.focusChangeEvents)
            this.focusChangeEventsSubscription = this.focusChangeEvents.subscribe(focus =>
                this.changeQuickAddInputFocus(focus)
            );
    }
    ngOnChanges(changes: SimpleChanges): void {
        if ('tasklist' in changes) this.initData();
    }
    ngOnDestroy() {
        this.focusChangeEventsSubscription?.unsubscribe();
    }

    countOpenTasks = countOpenTasks;
}
