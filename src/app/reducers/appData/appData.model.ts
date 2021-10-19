import { Task } from 'src/app/task/task.model';
import { TaskList } from '../../shared/taskList.model';

export const ACTIVE_VERSION = '2.0';

export interface AppData {
    activeListId: string;
    lists: TaskList[];
    version: string;
}
export interface AppState {
    data: AppData;
}

const newTasklist0 = new TaskList();
// const newTasklist1 = new TaskList('test list two', [new Task('test task')]);
export const defaultState: AppData = {
    activeListId: newTasklist0.id,
    lists: [newTasklist0],
    version: ACTIVE_VERSION,
};

// export class AppData {
//     constructor(list: TaskList = new TaskList()) {
//         this.activeListId = list.id;
//         this.lists = [list];
//     }
//     activeListId!: string;
//     lists!: TaskList[];
//     version: string = ACTIVE_VERSION;
// }
