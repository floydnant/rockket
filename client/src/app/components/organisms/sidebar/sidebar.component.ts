import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AppData } from '../../../reducers';
import { countOpenTasks } from '../../../shared/taskList.model';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnChanges {
    constructor() {}
    @Input() @Output() data!: AppData;

    isLoading: string | null;

    @Output() onSetActiveList = new EventEmitter<string>();
    setActiveList = (listId: string) => {
        if (this.data.activeListId == listId) return;

        this.isLoading = listId;
        setTimeout(() => this.onSetActiveList.emit(listId), 0);
    };

    @Output() onCreateList = new EventEmitter();
    createList = () => this.onCreateList.emit();

    @Output() onExportData = new EventEmitter();
    exportData = () => this.onExportData.emit();

    @Output() onImportData = new EventEmitter<HTMLInputElement>();
    importData = (inputRef: HTMLInputElement) => this.onImportData.emit(inputRef);

    countOpenTasks = countOpenTasks;

    ngOnInit(): void {}
    ngOnChanges(changes: SimpleChanges): void {
        if ('data' in changes) setTimeout(() => (this.isLoading = null), 0);
    }
}
