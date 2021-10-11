import { Component, Input, OnInit, Output } from '@angular/core';
import { TaskList } from '../shared/taskList.model';

@Component({
    selector: 'app-edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.css'],
})
export class EditMenuComponent implements OnInit {
    @Input() @Output() data: any; // Task | TaskList
    dataEdit!: {
        name: string;
        priority: number;
        meta: {
            notes: string;
            links: string[];
        };
    }; // Task | TaskList

    ngOnInit(): void {
        let data = this.data;
        this.dataEdit = {
            name: data.name,
            priority: data.priority,
            meta: {
                notes: data.meta.notes,
                links: data.meta.links,
            },
        };
    }
}
