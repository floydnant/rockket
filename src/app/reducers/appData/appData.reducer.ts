import { getCopyOf } from 'src/app/shared/utility.model';
import { Task } from 'src/app/task/task.model';
import { TaskList } from '../../shared/taskList.model';
import * as AppDataActions from './appData.actions';
import { ACTIVE_VERSION, AppData, defaultState } from './appData.model';

export type Action = AppDataActions.All;

// const newState = (state: AppData, newData: AppData) => Object.assign({}, state, newData);
const newState = (state: AppData, newData: AppData) => ({ ...state, ...newData });

export function appDataReducer(state: AppData = defaultState, action: Action) {
    let newState_ = getCopyOf(state);

    const getListById = (id: string): TaskList => newState_.lists.find((list: TaskList) => list.id == id);
    const getTaskById = (
        taskId: string,
        taskList: Task[] = getListById(newState_.activeListId).list,
        getParentArr = false
    ) => {
        const recurse = (taskId: string, arr: Task[]): Task | Task[] | void => {
            for (let i in arr) {
                const task: Task = arr[i];

                if (task.id == taskId) return getParentArr ? arr : task;
                else if (task.subTasks.length != 0) {
                    const taskRef = recurse(taskId, task.subTasks);
                    if (taskRef) return taskRef;
                }
            }
        };
        return recurse(taskId, taskList);
    };

    console.log(`%caction type: %c${action.type}%c, state:`, 'color: gray;', 'color: yellowgreen;', 'color: gray;');
    console.log(state);

    switch (action.type) {
        case AppDataActions.CREATE_LIST: {
            const newList = new TaskList(action.newListName);
            newState_.lists.push(newList);
            newState_.activeListId = newList.id;
            return newState(state, newState_);
        }
        case AppDataActions.SET_ACTIVE_LIST: {
            newState_.activeListId = action.listId;
            return newState(state, newState_);
        }
        case AppDataActions.EDIT_LIST: {
            let taskList = getListById(action.listId);
            taskList = Object.assign(taskList, action.updatedList);
            return newState(state, newState_);
        }
        case AppDataActions.DELETE_LIST: {
            const taskList = getListById(action.listId);
            const listIndex = newState_.lists.indexOf(taskList);

            newState_.lists.splice(listIndex, 1);
            const listCount = newState_.lists.length;
            const nextListIndex = listIndex > 0 ? listIndex - 1 : 0;
            newState_.activeListId = listCount == 0 ? null : newState_.lists[nextListIndex].id;
            return newState_;
        }

        case AppDataActions.CREATE_TASK: {
            const taskList = getListById(action.listId);
            taskList.list.push(new Task(action.newTaskName));
            return newState(state, newState_);
        }
        case AppDataActions.EDIT_TASK: {
            let task = getTaskById(action.taskId);
            task = Object.assign(task, action.updatedTask);
            return newState(state, newState_);
        }
        case AppDataActions.SET_TASK_COMPLETED: {
            let task = getTaskById(action.taskId);
            task = Object.assign(task, { isCompleted: !(task as Task).isCompleted, timeCompleted: new Date() });
            return newState(state, newState_);
        }
        case AppDataActions.ADD_SUBTASK: {
            const task = getTaskById(action.taskId) as Task;
            task.subTasks.push(new Task(action.newTaskName));
            return newState(state, newState_);
        }
        case AppDataActions.TOGGLE_SUBTASK_LIST: {
            const task = getTaskById(action.taskId) as Task;
            task.collapseSubtaskList = !task.collapseSubtaskList;
            return newState(state, newState_);
        }
        case AppDataActions.DELETE_TASK: {
            const taskParent = getTaskById(action.taskId, getListById(newState_.activeListId).list, true);
            const task = getTaskById(action.taskId);
            const indexOfTaskInParent = (taskParent as Task[]).indexOf(task as Task);
            (taskParent as Task[]).splice(indexOfTaskInParent, 1);
            return newState_;
        }

        case AppDataActions.IMPORT_TO_DB: {
            return action.payload;
        }

        default:
            return state;
    }

    // localStorage -> ngRX Effects?
}
