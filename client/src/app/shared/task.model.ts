import { Utility } from './utility.model';

export class TaskMeta {
    notes: string = '';
    links: string[] = [];
}

export class Task {
    constructor(name: string = '') {
        this.name = name.replace(/->/g, '→').replace(/<-/g, '←');
        this.id = new Utility().generateId();
    }
    public name: string;
    public id: string;
    public priority: number = 0;
    public isCompleted: boolean = false;
    public timeCompleted: Date | '' = '';
    public meta: TaskMeta = new TaskMeta();
    public collapseSubtaskList = false;
    public subTasks: Task[] = [];
}
