import { Action } from '@ngrx/store';
import { TaskList } from 'src/app/shared/taskList.model';
import { AppData } from './appData.model';

export const CREATE_LIST = '[List] Create';
export const SET_ACTIVE_LIST = '[List] SetActive';
export const EDIT_LIST = '[List] Edit';
export const DELETE_LIST = '[List] Delete';

export const CREATE_TASK = '[Task] Create';
export const EDIT_TASK = '[Task] Edit';
export const SET_TASK_COMPLETED = '[Task] SetCompleted';
export const ADD_SUBTASK = '[Task] AddSubtask';
export const TOGGLE_SUBTASK_LIST = '[Task] ToggleSubtaskList';
export const DELETE_TASK = '[Task] Delete';

export const IMPORT_TO_DB = '[DB] Import';

export class CreateList implements Action {
    readonly type = CREATE_LIST;

    constructor(public newListName: string) {}
}
export class SetActiveList implements Action {
    readonly type = SET_ACTIVE_LIST;

    constructor(public listId: string) {}
}
export class EditList implements Action {
    readonly type = EDIT_LIST;

    constructor(public listId: string, public updatedList: TaskList) {}
}
export class DeleteList implements Action {
    readonly type = DELETE_LIST;

    constructor(public listId: string) {}
}

export class CreateTask implements Action {
    readonly type = CREATE_TASK;

    constructor(public listId: string, public newTaskName: string) {}
}
export class EditTask implements Action {
    readonly type = EDIT_TASK;

    constructor(public taskId: string, public updatedTask: Task) {}
}
export class SetCompleted implements Action {
    readonly type = SET_TASK_COMPLETED;

    constructor(public taskId: string, public shouldBeCompleted: boolean, public allSubtasks = false) {}
}
export class AddSubtask implements Action {
    readonly type = ADD_SUBTASK;

    constructor(public taskId: string, public newTaskName: string) {}
}
export class ToggleSubtaskList implements Action {
    readonly type = TOGGLE_SUBTASK_LIST;

    constructor(public taskId: string) {}
}
export class DeleteTask implements Action {
    readonly type = DELETE_TASK;

    constructor(public taskId: string) {}
}


export class ImportToDB implements Action {
    readonly type = IMPORT_TO_DB;

    constructor(public payload: AppData, public overwrite = false) {}
}

export type All =
    | CreateList
    | SetActiveList
    | EditList
    | DeleteList
    | CreateTask
    | EditTask
    | SetCompleted
    | AddSubtask
    | ToggleSubtaskList
    | DeleteTask
    | ImportToDB;
