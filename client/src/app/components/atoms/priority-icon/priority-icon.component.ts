import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'priority-icon',
    templateUrl: './priority-icon.component.html',
    styleUrls: ['./priority-icon.component.css'],
})
export class PriorityIconComponent implements OnInit {
    @Input() priority: string | number;
    priorityArr: any[] = [];

    ngOnInit(): void {
        const priority = this.priority > 0 ? parseInt(this.priority as string) : 0;

        // for (let i = 0; i < priority; i++) this.priorityArr.push(1);
        this.priorityArr = new Array(priority).fill(1);
    }
}
