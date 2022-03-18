import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { getCopyOf, isTouchDevice, moveToMacroQueue } from 'src/app/shared/utility.model';
import { AppData } from '../../../reducers';
import { countOpenTasks, TaskList } from '../../../shared/taskList.model';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnChanges {
    constructor() {}
    isTouchDevice = isTouchDevice();

    sortableListsData: TaskList[];
    selectMode = false;
    @Input() @Output() data!: AppData;

    isLoading: string | null;

    @Output() onSetActiveList = new EventEmitter<string>();
    setActiveList = (listId: string) => {
        if (this.data.activeListId == listId) return;

        this.isLoading = listId;
        moveToMacroQueue(() => this.onSetActiveList.emit(listId));
    };

    @Output() onCreateList = new EventEmitter();
    createList = () => this.onCreateList.emit();

    @Output() onExportData = new EventEmitter();
    exportData = () => this.onExportData.emit();

    @Output() onImportData = new EventEmitter<HTMLInputElement>();
    importData = (inputRef: HTMLInputElement) => this.onImportData.emit(inputRef);

    countOpenTasks = countOpenTasks;

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.sortableListsData, event.previousIndex, event.currentIndex);
        this.sortLists(this.sortableListsData);
    }
    @Output() onListSort = new EventEmitter<TaskList[]>();
    sortLists = (sortedLists: TaskList[]) => this.onListSort.emit(sortedLists);

    ngOnInit(): void {
        this.sortableListsData = getCopyOf(this.data.lists);
    }
    ngOnChanges(changes: SimpleChanges): void {
        if ('data' in changes) {
            this.sortableListsData = getCopyOf(this.data.lists);
            moveToMacroQueue(() => (this.isLoading = null));
        }
    }
}
