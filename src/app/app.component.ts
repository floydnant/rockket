import { Component, OnInit } from '@angular/core';
import { TaskList } from './shared/taskList.model';
import { downloadObjectAsJson } from './shared/utility.model';
import { Task } from './task/task.model';

const ACTIVE_VERSION = '2.0';
export class AppData {
    constructor(list: TaskList) {
        this.activeListId = list.id;
        this.lists = [list];
    }
    activeListId!: string;
    lists!: TaskList[];
    version: string = ACTIVE_VERSION;
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

    log = console.log;

    clearTaskNameInput = (inputRef?: HTMLElement) => {
        this.taskNameInput = '';
        if (inputRef) inputRef.blur();
    };

    ///////////////////////////////////////////// Tasks ////////////////////////////////////////////////
    addTask = () => {
        if (!this.taskNameInput) return;
        if (this.data.lists.length == 0) alert("You don't have any lists.");

        this.activeTaskList.list.push(new Task(this.taskNameInput));
        this.clearTaskNameInput();

        this.db.save();
    };
    deleteTask = (id: string, prompt = true) => {
        const parentArr: any = this.getTaskById(id, this.activeTaskList.list, true);
        const task: any = this.getTaskById(id, this.activeTaskList.list);
        const indexOfTaskInParentArr = parentArr.indexOf(task);

        if (prompt) if (!confirm('Delete this task?')) return; // TODO: make this an inline animation
        parentArr.splice(indexOfTaskInParentArr, 1);

        this.db.save();
    };
    getTaskById(taskId: string, taskList: Task[], parent = false) {
        const recurse = (taskId: string, arr: Task[]): Task | Task[] | void => {
            for (let i in arr) {
                const task: Task = arr[i];

                if (task.id == taskId) return parent ? arr : task;
                else if (task.subTasks.length != 0) {
                    const taskRef = recurse(taskId, task.subTasks);
                    if (taskRef) return taskRef;
                }
            }
        };
        return recurse(taskId, taskList);
    }

    ///////////////////////////////////////////// Lists ////////////////////////////////////////////////
    getListById = (id: string): TaskList => this.data.lists.filter(list => list.id == id)[0];
    getListIndexById = (id: string): number =>
        this.data.lists.indexOf(this.data.lists.filter(list => list.id == id)[0]);
    setActiveList = (index: number) => {
        this.activeTaskList = this.data.lists[index];
        this.data.activeListId = this.data.lists[index].id;

        this.db.save();
    };
    createList = () => {
        const newListName = prompt('new list name');
        if (!newListName) return;
        this.data.lists.push(new TaskList(newListName));

        this.db.save();
    };
    editList = () => {
        const newListName = prompt('new task name', this.activeTaskList.name); // TODO: make edit menu work
        if (!newListName) return;
        this.activeTaskList.name = newListName;

        this.db.save();
    };
    deleteList = () => {};

    ////////////////////////////////////// database interaction /////////////////////////////////////////
    db = {
        localStorageKey: 'todoListData',
        getDefaultData: () => {
            const newList = new TaskList();
            return new AppData(newList);
        },
        save: () => (localStorage[this.db.localStorageKey] = JSON.stringify(this.data)),
        load: () => {
            try {
                this.data = JSON.parse(localStorage[this.db.localStorageKey]);
            } catch (err) {
                this.data = this.db.getDefaultData();
            }
            this.setActiveList(this.getListIndexById(this.data.activeListId));
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
                alert('Failed to parse JSON file. Have you modified it?');
                console.error('Failed to parse JSON: ' + e);
            }
        },
        delete: () => localStorage.removeItem(this.db.localStorageKey),
    };

    ngOnInit(): void {
        this.db.load();

        // TODO: alternate the background of every 2nd task
    }
}
