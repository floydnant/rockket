import { Utility } from '../shared/utility.model';

export class Task {
    constructor(name: string) {
        this.name = name.replace(/->/g, '→').replace(/<-/g, '←');
        this.id = new Utility().generateId();
    }
    public name: string;
    public id: string;
    public priority: number = 0;
    public isCompleted: boolean = false;
    public timeCompleted: Date | '' = '';
    public meta = {
        links: [],
        notes: '',
    };
    public collapseSubtaskList = false;
    public subTasks: Task[] = [];
}
