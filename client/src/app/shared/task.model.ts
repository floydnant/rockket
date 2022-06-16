import { generateId } from './utils';

export class TaskMeta {
    notes: string = '';
    links: string[] = [];
}

export enum TaskPrioritry {
    HIGH = 3,
    MEDIUM = 2,
    LOW = 1,
    NONE = 0,
    OPTINAL = -1,
}

// enum TaskStatus {
//     IN_PROGRESS = 1,
//     OPEN = 0,
//     COMPLETED = -1,
// }

export class Task {
    constructor(name: string = '', links: string[] = []) {
        this.name = name.replace(/->/g, '→').replace(/<-/g, '←'); // TODO: move 'replace' into component where the data comes from
        this.id = generateId();
        this.createdAt = Date.now();
        if (links.length) this.meta.links = links;
    }
    public name: string;
    public id: string;
    public priority: TaskPrioritry = TaskPrioritry.NONE;
    public createdAt: number | null = null;
    public isCompleted: boolean = false; // TODO: this should be 'status' with enum type
    public completedAt: Date | null = null;
    public meta: TaskMeta = new TaskMeta();
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

export interface ProgressChangeEvent {
    prevProgress: number;
    currProgress: number;
}

export async function getProgressRecursive(list: Task[], inPercent = false) {
    const getListProgress = async (l: Task[]): Promise<number> => {
        const completedMap = await Promise.all(
            l.map(task => {
                if (task.isCompleted) return Promise.resolve(1);
                if (task.subTasks.length) return getListProgress(task.subTasks);
                return Promise.resolve(0);
            })
        );
        const completed = completedMap.reduce((a, b) => a + b, 0);

        if (completed == 0 || l.length == 0) return 0;
        return completed / l.length;
    };

    const progress = await getListProgress(list);
    return inPercent ? progress * 100 : progress;
}

export const getProgressFromCompletedCount = (completedCount: number, taskCount: number) =>
    completedCount != 0 && taskCount != 0 ? completedCount / taskCount : 0;