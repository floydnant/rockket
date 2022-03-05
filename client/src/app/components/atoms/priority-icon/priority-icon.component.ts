import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
    selector: 'priority-icon',
    templateUrl: './priority-icon.component.html',
    styleUrls: ['./priority-icon.component.css'],
})
export class PriorityIconComponent implements OnInit, OnChanges {
    @Input() priority: string | number;
    priorityArr: any[] = [];

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
