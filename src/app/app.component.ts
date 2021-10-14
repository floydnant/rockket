import { Component, OnInit, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppData } from './reducers/appData';
import * as AppDataActions from './reducers/';

import { ModalService } from './modal/modal.service';
import { downloadObjectAsJson } from './shared/utility.model';
import { TaskList } from './shared/taskList.model';
import { Task } from './task/task.model';

interface AppState {
    data: AppData;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    data!: AppData;
    activeTaskList!: TaskList;
    taskNameInput!: string;

    constructor(public modalService: ModalService, private store: Store<AppState>) {
        this.store.subscribe((data: unknown) => {
            this.data = (data as { appData: AppData }).appData;
            this.activeTaskList = this.getListById(this.data.activeListId);
            console.log(this.data);
        });
    }

    clearTaskNameInput = (inputRef?: HTMLElement) => {
        this.taskNameInput = '';
        if (inputRef) inputRef.blur();
    };

    ///////////////////////////////////////////// Tasks ////////////////////////////////////////////////

    addTask = () => {
        if (!this.taskNameInput) return;
        if (this.data.lists.length == 0) alert("You don't have any lists.");
        // this.activeTaskList.list.push(new Task(this.taskNameInput));
        this.store.dispatch(new AppDataActions.CreateTask(this.activeTaskList.id, this.taskNameInput));
        this.clearTaskNameInput();
        // this.db.save();
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
    getListIndexById = (id: string): number => this.data.lists.indexOf(this.data.lists.find(list => list.id == id)); //prettier-ignore

    setActiveList = (listId: string) => {
        // this.activeTaskList = this.data.lists[index];
        // this.data.activeListId = this.data.lists[index].id;
        // this.db.save();
        this.store.dispatch(new AppDataActions.SetActiveList(listId));
    };
    createList = () => {
        const newListName = prompt('new list name');
        if (!newListName) return;

        this.store.dispatch(new AppDataActions.CreateList(newListName));
        // this.db.save();
    };
    editList = (listId_?: string) => {
        const listId = listId_ || this.data.activeListId;
        const taskList = this.getListById(listId);

        const newListName = prompt('new list name or "[delete]" to delete the list', taskList.name); // TODO: make edit menu work
        if (!newListName) return;
        if (newListName == 'd') {
            this.deleteList(listId);
            return;
        }

        this.store.dispatch(new AppDataActions.EditList(listId, { name: newListName } as TaskList));
        // this.db.save();
    };
    deleteList = (listId: string) => this.store.dispatch(new AppDataActions.DeleteList(listId));

    ////////////////////////////////////// database interaction /////////////////////////////////////////
    db = {
        localStorageKey: 'todoListData',
        // getDefaultData: () => new AppData(),
        save: () => (localStorage[this.db.localStorageKey] = JSON.stringify(this.data)),
        load: () => {
            try {
                this.data = JSON.parse(localStorage[this.db.localStorageKey]);
            } catch (err) {
                // this.data = this.db.getDefaultData();
            }
            this.setActiveList(this.data.activeListId);
        },
        exportJson: () => {
            if (confirm('Download ToDo data as file?')) downloadObjectAsJson(this.data, 'ToDo-data', true);
        },
        importJson: async (inputRef: any) => {
            try {
                const unparsed = await inputRef.files[0].text();
                const jsonData = JSON.parse(unparsed.replace(/metaData/g, 'meta'));
                console.log(jsonData);

                if ('activeListId' in jsonData && 'lists' in jsonData) {
                    // TODO: add a prompt wich lets the user select wich lists to import
                    this.data.lists = [...this.data.lists, ...jsonData.lists];

                    this.db.save();
                } else alert('The JSON File does not contain the necessary data.');
            } catch (e) {
                alert('Failed to import JSON file. Have you modified it?');
                console.error('Failed to parse JSON: ' + e);
            }
        },
        delete: () => localStorage.removeItem(this.db.localStorageKey),
    };

    ngOnInit(): void {
        // this.db.load();
        // setTimeout(() => this.modalService.open('custom-dialog'), 1000);
    }
}
