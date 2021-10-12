import { Component, Input, OnInit, Output } from '@angular/core';
import { TaskList } from '../shared/taskList.model';

class DataEdit_ {
    constructor(
        public name: string,
        public priority: number,
        public meta: {
            notes: string;
            links: string[];
        }
    ) {}
}

@Component({
    selector: 'app-edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.css'],
})
export class EditMenuComponent implements OnInit {
    @Input() @Output() data: any; // Task | TaskList
    dataEdit!: DataEdit_;

    ngOnInit(): void {
        let data = this.data;
        this.dataEdit = new DataEdit_(data.name, data.priority, data.meta);
    }
}
