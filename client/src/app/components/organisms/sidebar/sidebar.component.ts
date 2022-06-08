import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { getCopyOf, isTouchDevice, moveToMacroQueue } from 'src/app/shared/utils';
import { Compare } from 'src/app/shared/utils/objects';
import { AppData } from '../../../reducers';
import { countTasks, TaskList } from '../../../shared/taskList.model';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnChanges {
    constructor(private themeService: ThemeService) {}
    activeTheme = this.themeService.themeState
    isTouchDevice = isTouchDevice();

    sortableListsData: TaskList[];
    selectMode = false;
    @Input() @Output() data!: AppData;

    isLoading: string | null;

    @Output() closeMobileMenu = new EventEmitter<never>();
    @Output() onSetActiveList = new EventEmitter<string>();
    setActiveList = (listId: string) => {
        if (this.selectMode) return;

        if (this.data.activeListId == listId) {
            this.closeMobileMenu.emit();
            return;
        }

        this.isLoading = listId;
        moveToMacroQueue(() => this.onSetActiveList.emit(listId));
    };

    @Output() onCreateList = new EventEmitter();
    createList = () => this.onCreateList.emit();

    @Output() onExportData = new EventEmitter();
    exportData = () => this.onExportData.emit();

    @Output() onImportData = new EventEmitter<HTMLInputElement>();
    importData = (inputRef: HTMLInputElement) => this.onImportData.emit(inputRef);

    countOpenTasks = countTasks;

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.sortableListsData, event.previousIndex, event.currentIndex);
        if (!Compare.array(this.sortableListsData, this.data.lists)) this.sortLists(this.sortableListsData);
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
