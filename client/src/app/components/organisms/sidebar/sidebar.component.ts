import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ListsService } from 'src/app/services/lists.service';
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
    constructor(private themeService: ThemeService, private listsService: ListsService) {}
    activeTheme = this.themeService.themeState;
    isTouchDevice = isTouchDevice();

    @Input() @Output() data!: AppData;

    sortableListsData: (TaskList & { selected: boolean })[];
    resetSelection() {
        this.sortableListsData = this.sortableListsData.map(l => ({ ...l, selected: false }));
    }
    selectMode = false;
    toggleSelectMode(nowSelectIsOn?: boolean) {
        this.selectMode = nowSelectIsOn !== undefined ? nowSelectIsOn : !this.selectMode;
        if (!this.selectMode) {
            this.sortLists();
            setTimeout(() => this.resetSelection(), 400);
        }
    }
    @Input() selectModeEvents: Observable<boolean>;
    selectModeEventsSubscription: Subscription;

    selectedListCount: number;
    toggleSelection(index: number) {
        this.sortableListsData[index].selected = !this.sortableListsData[index].selected;
        this.selectedListCount = this.sortableListsData.filter(l => l.selected).length;
    }
    private getSelectedListIds(): string[] {
        return this.sortableListsData.filter(l => l.selected).map(l => l.id);
    }

    async deleteSelectedLists() {
        const { deleted } = await this.listsService.deleteLists(this.getSelectedListIds());
        if (deleted) this.toggleSelectMode();
    }

    isLoading: string | null;

    @Output() closeMobileMenu = new EventEmitter();
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
    createList() {
        if (this.selectMode) this.toggleSelectMode();
        this.onCreateList.emit();
    }

    @Output() exportLists = new EventEmitter<string[]>();
    exportSelectedLists() {
        this.exportLists.emit(this.getSelectedListIds());
        this.toggleSelectMode();
    }

    @Output() importLists = new EventEmitter<HTMLInputElement>();
    importData = (inputRef: HTMLInputElement) => this.importLists.emit(inputRef);

    countOpenTasks = countTasks;

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.sortableListsData, event.previousIndex, event.currentIndex);
        this.sortLists();
    }
    @Output() onListSort = new EventEmitter<TaskList[]>();
    sortLists() {
        if (this.selectMode && this.getSelectedListIds().length > 0) return;

        const cleanedUpLists = this.sortableListsData.map(({ selected, ...list }) => list);
        const nothingHasChanged = Compare.array(cleanedUpLists, this.data.lists);
        if (nothingHasChanged) return;

        this.onListSort.emit(cleanedUpLists);
    }

    ngOnInit(): void {
        this.sortableListsData = getCopyOf(this.data.lists.map(l => ({ ...l, selected: false })));
        this.selectModeEventsSubscription = this.selectModeEvents.subscribe(nowSelectIsOn => {
            this.toggleSelectMode(nowSelectIsOn);
        });
    }
    ngOnChanges(changes: SimpleChanges): void {
        if ('data' in changes) {
            this.sortableListsData = getCopyOf(this.data.lists.map(l => ({ ...l, selected: false })));
            moveToMacroQueue(() => (this.isLoading = null));
        }
    }
    ngOnDestroy() {
        this.selectModeEventsSubscription.unsubscribe();
    }
}
