import { AfterViewInit, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AppData, AppDataActions, AppState } from '../reducers';
import { AppDataService } from '../services/app-data.service';
import { ListsService } from '../services/lists.service';
import { TasksService } from '../services/tasks.service';
import { WINDOW_TITLE_SUFFIX } from '../shared/constants';
import { Task } from '../shared/task.model';
import { TaskList } from '../shared/taskList.model';
import { isTouchDevice, shortenText } from '../shared/utils';
import { ModalService } from './molecules/modal/modal.service';
import { DialogService } from './organisms/custom-dialog';
import { EditMenuService } from './organisms/edit-menu';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    constructor(
        private store: Store<AppState>,
        private appDataService: AppDataService,
        private listsService: ListsService,
        private tasksService: TasksService,
        private dialogService: DialogService
    ) {
        this.store.subscribe(data => {
            this.data = data.appData;
            this.activeTaskList = this.getListById(this.data.activeListId);
            this.completedTasksCount = this.activeTaskList.list.filter(t => t.isCompleted).length;
            this.openTasksCount = this.activeTaskList.list.filter(t => !t.isCompleted).length;

            console.log('%cupdated state:', 'color: gray', this.data);

            document.title = this.activeTaskList
                ? `${shortenText(this.activeTaskList.name, 20)} - ${WINDOW_TITLE_SUFFIX}`
                : WINDOW_TITLE_SUFFIX;
        });
    }

    ngAfterViewInit() {
        if (this.isTouchDevice) document.body.classList.add('touchDevice');
        this.quickAddInputField.focus(0);
    }

    data: AppData;
    completedTasksCount: number;
    openTasksCount: number;
    activeTaskList: TaskList | undefined;
    taskNameInput: string;

    showCompleted = false;

    isTouchDevice = isTouchDevice();
    isMobileMenuOpen: boolean;
    setMobileMenuOpen = (open: boolean) => (this.isMobileMenuOpen = open);

    quickAddInputField = {
        focusEventsSubject: [new Subject<boolean>(), new Subject<boolean>()],
        focus: (inputField: number) => this.quickAddInputField.focusEventsSubject[inputField].next(true),
    };

    //////////////////// Tasks ////////////////////
    onTaskCompletion(isCompleted: boolean) {
        if (isCompleted) {
            this.completedTasksCount++;
            this.openTasksCount--;
        } else {
            this.completedTasksCount--;
            this.openTasksCount++;
        }
    }

    createTask(newTaskName: string) {
        this.tasksService.createTask(this.activeTaskList.id, newTaskName);
    }
    addTask = [
        (newTaskName: string) => {
            if (!newTaskName) return;
            if (this.data.lists.length == 0) {
                this.dialogService.confirm({ title: "You don't have any lists." });
                return;
            }
            this.createTask(newTaskName);
            this.quickAddInputField.focus(0);
        },
        (newTaskName: string) => {
            this.createTask(newTaskName);
            this.quickAddInputField.focus(1);
        },
    ];

    //////////////////// Lists ////////////////////
    getListById = (id: string): TaskList | undefined => this.data.lists.find(list => list.id == id);
    getListIndexById = (id: string): number => this.data.lists.findIndex(list => list.id == id);

    setActiveList(listId: string) {
        this.listsService.setActiveList(listId);
        this.isMobileMenuOpen = false;
    }

    async createList() {
        const { created } = await this.listsService.createList();
        if (created) this.setMobileMenuOpen(false);
    }

    editList() {
        this.listsService.openListDetails(this.activeTaskList);
    }

    deleteList(listId: string) {
        this.listsService.deleteList(listId);
    }

    sortLists(sortedLists: TaskList[]) {
        this.listsService.sortLists(sortedLists);
    }

    exportActiveList() {
        return this.appDataService.exportAsJSON();
    }
    async importJson(inputRef: HTMLInputElement) {
        const unparsed = await inputRef.files[0].text();
        this.appDataService.importFromJSON(unparsed);
    }
}
