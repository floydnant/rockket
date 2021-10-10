import { Task } from '../task/task.model';
import { generateId } from './utility.model';

export class TaskList {
    constructor(name = 'ToDo', list: Task[] = []) {
        this.name = name;
        this.id = generateId();
        this.list = list;
    }
    name: string;
    id: string;
    list: Task[];
    meta = {
        notes: '',
    };
}
