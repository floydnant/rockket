import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
// import { Observable } from 'rxjs';

import { AppData, AppState } from './reducers/appData';
import { AppDataActions } from './reducers/';

import { ModalService } from './components/molecules/modal/modal.service';
import { getCopyOf, isTouchDevice } from './shared/utility.model';
import { countOpenTasks, TaskList } from './shared/taskList.model';
import { Task } from './shared/task.model';
import { DialogService } from './components/organisms/custom-dialog/custom-dialog.service';
import { EditMenuService } from './components/organisms/edit-menu/edit-menu.service';
import { AppDataService } from './reducers/appData/appData.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
    data!: AppData;
    activeTaskList!: TaskList;
    taskNameInput!: string;

    uncompletedTasks: Task[];
    showCompletedMaster = false;
    showCompleted = this.showCompletedMaster;
    completedTasks: Task[];

    countOpenTasks = countOpenTasks;

    isTouchDevice = isTouchDevice();
    isMobileMenuOpen: boolean;
    setMobileMenuOpen = (e: boolean) => (this.isMobileMenuOpen = e);

    // @ViewChild('nameInputRef') nameInputRef: ElementRef;
    updateCount = 0;
    focusChangeEventsSubject = new Subject<boolean>();
    changeFocus(shouldBeFocused: boolean) {
        this.focusChangeEventsSubject.next(shouldBeFocused);
    }

    constructor(
        public modalService: ModalService,
        private dialogService: DialogService,
        private editMenuService: EditMenuService,
        private store: Store<AppState>,
        private appDataService: AppDataService
    ) {
        this.store.subscribe((data: unknown) => {
            this.data = (data as { appData: AppData }).appData;
            this.activeTaskList = this.getListById(this.data.activeListId);

            this.uncompletedTasks = this.activeTaskList.list.filter(task => !task.isCompleted);
            this.completedTasks = this.activeTaskList.list.filter(task => task.isCompleted);

            this.updateCount++;
            if (this.updateCount > 1 && !this.isTouchDevice) this.changeFocus(true); //this.nameInputRef.nativeElement.select();

            console.log('%cupdated state:', 'color: gray', this.data);
        });
    }

    ///////////////////////////////////////////// Tasks ////////////////////////////////////////////////

    dispatchCreateTask = (newTaskName: string) =>
        this.store.dispatch(new AppDataActions.CreateTask(this.activeTaskList.id, newTaskName));
    addTask = (input: string) => {
        if (!(/* this.taskNameInput */ input)) return;
        if (this.data.lists.length == 0) {
            this.dialogService.confirm({ title: "You don't have any lists." });
            return;
        }
        this.dispatchCreateTask(/* this.taskNameInput */ input);
        // this.clearTaskNameInput();
    };
    getTaskById(taskId: string, taskList: Task[], getParentArr = false) {
        const recurse = (taskId: string, arr: Task[]): Task | Task[] | void => {
            for (let i in arr) {
                const task: Task = arr[i];

                if (task.id == taskId) return getParentArr ? arr : task;
                else if (task.subTasks.length != 0) {
                    const taskRef = recurse(taskId, task.subTasks);
                    if (taskRef) return taskRef;
                }
            }
        };
        return recurse(taskId, taskList);
    }

    ///////////////////////////////////////////// Lists ////////////////////////////////////////////////
    getListById = (id: string): TaskList => this.data.lists.find(list => list.id == id);
    getListIndexById = (id: string): number => this.data.lists.indexOf(this.data.lists.find(list => list.id == id));

    setActiveList = (listId: string) => {
        this.store.dispatch(new AppDataActions.SetActiveList(listId));
        this.isMobileMenuOpen = false;
    };
    createList = () =>
        this.dialogService
            .prompt({ title: 'Create new list:', buttons: ['Cancel', 'Create'], placeholder: 'list name' })
            .then((newListName: string) => {
                this.store.dispatch(new AppDataActions.CreateList(newListName));
                this.setMobileMenuOpen(false);
            })
            .catch(() => {});

    editList = (listId: string = this.data.activeListId) => {
        const taskList = this.getListById(listId);

        this.editMenuService
            .editTaskListDetails(taskList)
            .then((updatedTaskList: TaskList) => {
                this.store.dispatch(new AppDataActions.EditList(listId, { ...taskList, ...updatedTaskList }));
            })
            .catch(err => {
                if (err == 'Deleted')
                    this.dialogService
                        .confirm({ title: 'Delete this list?', buttons: ['Cancel', '!Delete'] })
                        .then(() => this.deleteList(listId))
                        .catch(err => {});
            });
    };
    deleteList = (listId: string) => this.store.dispatch(new AppDataActions.DeleteList(listId));

    ////////////////////////////////////// database interaction /////////////////////////////////////////
    db = {
        exportJson: () =>
            this.dialogService
                .confirm({ title: 'Download ToDo lists as file?', buttons: ['Cancel', 'Download'] })
                .then(() => this.appDataService.exportAsJSON())
                .catch(err => {}),
        importJson: async (inputRef: any) => {
            try {
                const unparsed = await inputRef.files[0].text();
                const jsonData = JSON.parse(unparsed.replace(/metaData/g, 'meta'));

                if ('appData' in jsonData) {
                    const appData = jsonData.appData;
                    if ('activeListId' in appData && 'lists' in appData) {
                        const data: AppData = getCopyOf(this.data);
                        // TODO: add a prompt wich lets the user select wich lists to import
                        data.lists = [...this.data.lists, ...appData.lists];
                        this.appDataService.importFromJSON(data);
                    } else this.dialogService.confirm({ title: 'The JSON File does not contain the necessary data.' });
                } else this.dialogService.confirm({ title: 'The JSON File might not be what you think it is.' });
            } catch (e) {
                this.dialogService.confirm({ title: 'Failed to import JSON file.', text: 'Have you modified it?' });
                console.error('Failed to parse JSON: ' + e);
            }
        },
    };

    ngOnInit(): void {}
    ngAfterViewInit() {
        // this.nameInputRef.nativeElement.select();
        this.changeFocus(true);

        if (this.isTouchDevice) document.body.classList.add('touchDevice');
    }
}
