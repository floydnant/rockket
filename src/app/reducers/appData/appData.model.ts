import { TaskList } from '../../shared/taskList.model';

export const ACTIVE_VERSION = '2.0';

export interface AppData {
    activeListId: string;
    lists: TaskList[];
    version: string;
}

// export class AppData {
//     constructor(list: TaskList = new TaskList()) {
//         this.activeListId = list.id;
//         this.lists = [list];
//     }
//     activeListId!: string;
//     lists!: TaskList[];
//     version: string = ACTIVE_VERSION;
// }
