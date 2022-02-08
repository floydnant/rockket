import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppData } from '../../../reducers';
import { countOpenTasks } from '../../../shared/taskList.model';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
    constructor() {}
    @Input() @Output() data!: AppData;

    @Output() onSetActiveList = new EventEmitter<string>();
    setActiveList = (listId: string) => this.onSetActiveList.emit(listId);

    @Output() onCreateList = new EventEmitter();
    createList = () => this.onCreateList.emit();

    @Output() onExportData = new EventEmitter();
    exportData = () => this.onExportData.emit();

    @Output() onImportData = new EventEmitter<HTMLInputElement>();
    importData = (inputRef: HTMLInputElement) => this.onImportData.emit(inputRef);

    countOpenTasks = countOpenTasks;

    ngOnInit(): void {}
}
