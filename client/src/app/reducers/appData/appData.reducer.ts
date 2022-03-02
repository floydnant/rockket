import { getCopyOf } from 'src/app/shared/utility.model';
import { Task } from 'src/app/shared/task.model';
import { countOpenTasksMultiLevel, sortTasksBy, TaskList } from '../../shared/taskList.model';
import * as AppDataActions from './appData.actions';
import { ACTIVE_VERSION, AppData, defaultState } from './appData.model';

const setAllSubtasksCompleted = (tasks: Task[]) => {
    const recurse = (tasks_: Task[]) => {
        tasks_ = tasks_.map(task => {
            task.isCompleted = true;
            task.completedAt = new Date();
            if (task.subTasks.length) recurse(task.subTasks);
            return task;
        });
    };
    recurse(tasks);
    return tasks;
};

export type Action = AppDataActions.All;

export function appDataReducer(state: AppData = defaultState, action: Action) {
    const getNewState = (newData: AppData) => ({ ...state, ...newData });

    let newState = getCopyOf(state);

    const getListById = (id: string): TaskList => newState.lists.find((list: TaskList) => list.id == id);
    const getTaskById = (
        taskId: string,
        getParentArr = false,
        tasks: Task[] = getListById(newState.activeListId).list
    ) => {
        const recurse = (taskId: string, list: Task[]): Task | Task[] | void => {
            for (let taskIndex in list) {
                const task: Task = list[taskIndex];

                if (task.id == taskId) return getParentArr ? list : task;

                if (task.subTasks.length) {
                    const taskRef = recurse(taskId, task.subTasks);
                    if (taskRef) return taskRef;
                }
            }
        };
        return recurse(taskId, tasks);
    };

    const activeList = getListById(newState.activeListId);
    if (activeList && !activeList.sortBy) activeList.sortBy = new TaskList().sortBy; // migration
    const SORT_BY_PROPERTIES = activeList?.sortBy || new TaskList().sortBy;

    const sortTasks = (tasks: Task[]) => {
        if (SORT_BY_PROPERTIES.priority) sortTasksBy(tasks, 'priority');
        if (SORT_BY_PROPERTIES.completion) sortTasksBy(tasks, 'isCompleted');
    };

    console.log(
        `%caction type: %c${action.type}%c, state:`,
        'color: gray;',
        'color: yellowgreen;',
        'color: gray;',
        state
    );

    switch (action.type) {
        case AppDataActions.CREATE_LIST: {
            const newList = new TaskList(action.newListName);
            newState.lists.push(newList);
            newState.activeListId = newList.id;
            return getNewState(newState);
        }
        case AppDataActions.SET_ACTIVE_LIST: {
            newState.activeListId = action.listId;
            return getNewState(newState);
        }
        case AppDataActions.EDIT_LIST: {
            let taskList = getListById(action.listId);
            taskList = Object.assign(taskList, action.updatedList);
            return getNewState(newState);
        }
        case AppDataActions.DELETE_LIST: {
            const taskList = getListById(action.listId);
            const listIndex = newState.lists.indexOf(taskList);

            newState.lists.splice(listIndex, 1);
            const listCount = newState.lists.length;
            const nextListIndex = listIndex > 0 ? listIndex - 1 : 0;
            newState.activeListId = listCount == 0 ? null : newState.lists[nextListIndex].id;
            return newState;
        }

        case AppDataActions.CREATE_TASK: {
            const taskList = getListById(action.listId);
            taskList.list.push(new Task(action.newTaskName));

            sortTasks(taskList.list);

            return getNewState(newState);
        }
        case AppDataActions.EDIT_TASK: {
            let task = getTaskById(action.taskId);
            task = Object.assign(task, action.updatedTask);

            const taskParentArr = getTaskById(action.taskId, true) as Task[];
            sortTasks(taskParentArr);

            return getNewState(newState);
        }
        case AppDataActions.SET_TASK_COMPLETED: {
            let task = getTaskById(action.taskId) as Task;
            const subtasksCopy = getCopyOf(task.subTasks);

            if (!task.isCompleted)
                if (action.allSubtasks) {
                    setAllSubtasksCompleted(subtasksCopy);
                    task.collapseSubtaskList = true;
                }
            task = Object.assign(task, {
                isCompleted: action.shouldBeCompleted,
                completedAt: new Date(),
                subTasks: subtasksCopy,
            });

            const taskParentArr = getTaskById(action.taskId, true) as Task[];
            sortTasks(taskParentArr);

            return getNewState(newState);
        }
        case AppDataActions.ADD_SUBTASK: {
            const task = getTaskById(action.taskId) as Task;
            task.subTasks.push(new Task(action.newTaskName));

            const taskParentArr = getTaskById(action.taskId, true) as Task[];
            sortTasks(taskParentArr);

            return getNewState(newState);
        }
        case AppDataActions.TOGGLE_SUBTASK_LIST: {
            const task = getTaskById(action.taskId) as Task;
            task.collapseSubtaskList = !task.collapseSubtaskList;
            return getNewState(newState);
        }
        case AppDataActions.DELETE_TASK: {
            const taskParent = getTaskById(action.taskId, true);
            const task = getTaskById(action.taskId);
            const indexOfTaskInParent = (taskParent as Task[]).indexOf(task as Task);
            (taskParent as Task[]).splice(indexOfTaskInParent, 1);
            return newState;
        }

        case AppDataActions.IMPORT_TO_DB: {
            const importedState = getCopyOf(action.payload);

            console.log('importedState.version:', importedState.version);

            // migrate 'timeCompleted' to 'completedAt'
            if (importedState.version != ACTIVE_VERSION)
                importedState.lists.forEach(tasklist => {
                    tasklist.list = tasklist.list.map(({ timeCompleted, ...task }: any) => ({
                        ...task,
                        completedAt: timeCompleted,
                    }));
                });

            return {
                ...newState,
                lists: [...(action.overwrite ? [] : newState.lists), ...importedState.lists],
                version: ACTIVE_VERSION,
            };
        }

        default:
            return state;
    }
}
