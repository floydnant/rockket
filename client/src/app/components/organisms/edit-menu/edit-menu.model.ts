import { TaskMeta, Task } from '../../../shared/task.model';
import { TaskList, TaskListMeta } from '../../../shared/taskList.model';
import { getCopyOf } from '../../../shared/utility.model';

export class EditmenuTasklistData {
    name: TaskList['name'] = '';
    meta: TaskListMeta = new TaskListMeta();
}
export class EditmenuTaskData {
    name: Task['name'] = '';
    priority: Task['priority'] = 0;
    meta: TaskMeta = new TaskMeta();
}

export interface editmenuOptions {
    type: 'Task' | 'TaskList';
    noEdit: boolean;
    viewLinks?: boolean;
    data: EditmenuTaskData | EditmenuTasklistData;
}
export interface responseHandlerInterface {
    updatedData: EditmenuTaskData | EditmenuTasklistData;
    responseStatus: 'OK' | 'Cancelled' | 'Deleted';
}
