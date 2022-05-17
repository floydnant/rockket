import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from '../components/organisms/dialog';
import { EditMenuService } from '../components/organisms/edit-menu';
import { editmenuOptions } from '../components/organisms/edit-menu/edit-menu.model';
import { AppData, AppDataActions } from '../reducers';
import { Task } from '../shared/task.model';
import { countTasks } from '../shared/taskList.model';

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    constructor(
        private store: Store<AppData>,
        private dialogService: DialogService,
        private editMenuService: EditMenuService
    ) {}

    createTask(listId: string, taskName: string) {
        this.store.dispatch(new AppDataActions.CreateTask(listId, taskName));
    }

    async updateTaskStatus(
        taskId: string,
        {
            nowCompleted,
            wasCompletedBefore,
            hasOpenSubtasks,
        }: { nowCompleted: boolean; wasCompletedBefore: boolean; hasOpenSubtasks: boolean }
    ) {
        const dispatchAction = (completeAllSubtasks = false) => {
            setTimeout(() => {
                this.store.dispatch(new AppDataActions.SetCompleted(taskId, nowCompleted, completeAllSubtasks));
            }, 600);

            return {
                changedStatus: true,
                collapseSubtaskList: nowCompleted && (wasCompletedBefore || !hasOpenSubtasks || completeAllSubtasks),
            };
        };

        if (wasCompletedBefore || !hasOpenSubtasks) return dispatchAction();

        const { clickedButton } = await this.dialogService.confirm({
            title: 'Open subtasks left!',
            text: 'Do you want to mark all subtasks as completed too?',
            buttons: ['Keep uncompleted', 'Cancel', 'OK'],
        });
        switch (clickedButton) {
            case 'OK':
                return dispatchAction(true);
            case 'Keep uncompleted':
                return dispatchAction();
            default:
                return {
                    changedStatus: false,
                    collapseSubtaskList: false,
                };
        } // prettier-ignore
    }

    updateTaskDetails(taskData: Task) {
        this.store.dispatch(new AppDataActions.EditTask(taskData.id, taskData));
    }
    async openTaskDetails(taskData: Task, allowEdit = true, highlight?: editmenuOptions['hightlight']) {
        try {
            const updatedTask = await this.editMenuService.editTaskDetails(taskData, !allowEdit, highlight);
            if (allowEdit) this.updateTaskDetails({ ...taskData, ...(updatedTask as Task) });
        } catch (clickedButton) {
            if (clickedButton == 'Deleted') this.deleteTask(taskData.id, countTasks(taskData.subTasks));
        }
    }

    async addSubtask(taskId: string, subtaskName?: string) {
        if (!subtaskName) {
            const { clickedButton, responseValue } = await this.dialogService.prompt({
                title: 'Create new subtask:',
                buttons: ['Cancel', 'Create'],
                placeholder: 'subtask name',
            });
            if (clickedButton == 'Cancel') return { created: false };
            subtaskName = responseValue;
        }

        this.store.dispatch(new AppDataActions.AddSubtask(taskId, subtaskName));
        return { created: true };
    }

    async deleteTask(taskId: string, openSubtasksCount: number) {
        const { clickedButton } = await this.dialogService.confirm({
            title: `Delete this task?`,
            text: openSubtasksCount
                ? `and ${openSubtasksCount > 1 ? `all ` : ''}it's ${openSubtasksCount} open ${
                      openSubtasksCount > 1 ? `subtasks` : 'subtask'
                  }?`
                : null,
            buttons: ['Cancel', '!Delete' + (openSubtasksCount ? ' all' : '')],
        });
        if (clickedButton == 'Cancel') return { deleted: false };

        this.store.dispatch(new AppDataActions.DeleteTask(taskId));
        return { deleted: true };
    }

    getTaskById(taskId: string, taskList: Task[], getParentArr = false) {
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
    }
}
