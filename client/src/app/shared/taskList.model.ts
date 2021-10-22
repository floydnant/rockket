import { Task } from '../task/task.model';
import { generateId } from './utility.model';

export class TaskList {
    constructor(name = 'ToDo', list: Task[] = []) {
        this.name = name;
        this.id = generateId();
        this.list = list;
    }
    public name: string;
    public id: string;
    public list: Task[];
    public meta = {
        notes: '',
    };
}
