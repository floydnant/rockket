import { Task } from './task.model';
import { generateId, shortenText } from './utils';

export class TaskListMeta {
    notes: string = '';
}

export class TaskList {
    public id: string;
    constructor(
        public name: string = 'ToDo',
        public list: Task[] = []
    ) { this.id = generateId(); } //prettier-ignore

    public meta: TaskListMeta = new TaskListMeta();
    public sortBy = {
        completion: true,
        priority: true,
    };
}

export const countTasks = (arr: Task[], which: 'open' | 'closed' = 'open') =>
    arr.filter(task => (which == 'open' ? !task.isCompleted : task.isCompleted)).length;

export const countTasksRecursive = (tasks: Task[], which: 'open' | 'closed' = 'open') => {
    let uncompleted = 0;
    const recurse = (tasks_: Task[]) =>
        tasks_.forEach(task => {
            if (which == 'open' ? !task.isCompleted : task.isCompleted) uncompleted++;
            if (task.subTasks.length) recurse(task.subTasks);
        });
    recurse(tasks);
    return uncompleted;
};

export const sortTasksBy = (tasks: Task[], property: string) => {
    const typeOfProperty = property == 'priority' ? 'number' : typeof tasks[0][property];

    let sort: (tasks_: Task[]) => Task[];
    switch (typeOfProperty) {
        case 'number':
            sort = arr => arr.reverse().sort((a, b) => parseInt(a[property]) - parseInt(b[property])).reverse(); //prettier-ignore
            break;
        case 'boolean':
            sort = arr => arr.sort((a, b) => (a[property] === b[property] ? 0 : b[property] ? -1 : 1));
            break;
    }

    const recurse = (tasks_: Task[]) => {
        sort(tasks_);
        tasks_.forEach(task => {
            if (task.subTasks.length) recurse(task.subTasks);
        });
    };
    recurse(tasks);
};

export const textFromListArr = (lists: { name: string }[]): string => {
    const firstListName = shortenText(lists[0].name, 15, true),
        listCount = lists.length;
    const moreListsStr = listCount == 1 ? '' : ` and ${listCount - 1} other list${listCount - 1 == 1 ? '' : 's'}`;
    return `'${firstListName}'` + moreListsStr;
};