import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'priority-icon',
    templateUrl: './priority-icon.component.html',
    styleUrls: ['./priority-icon.component.css'],
})
export class PriorityIconComponent implements OnInit, OnChanges {
    @Input() priority: string | number;
    priorityArr: any[] = [];
    @Input() noEdit = false;
    @Input() showDropDown = false;

    @Output() change = new EventEmitter<number>();
    updatePriorityFromWithin = (priority: string) => {
        this.priority = priority;
        this.updatePriority();

        this.change.emit(parseInt(priority));
    };

    updatePriority() {
        const priority = this.priority > 0 ? parseInt(this.priority as string) : 0;
        this.priorityArr = new Array(priority).fill(1);
    }

    ngOnInit(): void {
        this.updatePriority();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if ('priority' in changes) this.updatePriority();
    }
}
