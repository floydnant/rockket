import { generateId } from './utility.model';

export class TaskMeta {
    notes: string = '';
    links: string[] = [];
}

export class Task {
    constructor(name: string = '') {
        this.name = name.replace(/->/g, '→').replace(/<-/g, '←'); // TODO: move 'replace' into component where the data comes from
        this.id = generateId();
    }
    public name: string;
    public id: string;
    public priority: number = 0; // TODO: make this an enum
    // TODO: add field: public createdAt: Date | '' = '';
    public isCompleted: boolean = false;
    public timeCompleted: Date | '' = ''; // TODO: rename field: timeCompleted -> completedAt
    public meta: TaskMeta = new TaskMeta();
    public collapseSubtaskList = false;
    public subTasks: Task[] = [];
}
