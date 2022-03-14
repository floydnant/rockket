import { generateId } from './utility.model';

export class TaskMeta {
    notes: string = '';
    links: string[] = [];
}

export class Task {
    constructor(name: string = '', links: string[] = []) {
        this.name = name.replace(/->/g, '→').replace(/<-/g, '←'); // TODO: move 'replace' into component where the data comes from
        this.id = generateId();
        if (links.length) this.meta.links = links;
    }
    public name: string;
    public id: string;
    public priority: number = 0; // TODO: make this an enum
    // TODO: add field: public createdAt: Date | '' = '';
    public isCompleted: boolean = false;
    public completedAt: Date | null = null;
    public meta: TaskMeta = new TaskMeta();
    public collapseSubtaskList = false;
    public subTasks: Task[] = [];
}

export const sortCompletedTasks = (a: Task, b: Task): 0 | 1 | -1 => {
    try {
        const order = new Date(a.completedAt).valueOf() - new Date(b.completedAt).valueOf();
        return order > 0 ? -1 : order < 0 ? 1 : 0;
    } catch (e) {
        return -1;
    }
};