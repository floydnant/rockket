import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from '../components/organisms/custom-dialog';
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

    // [X] update task completed status
    // [X] update task details
    // [ ] edit/view task details
    // [X] add subtask
    // [X] delete task

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
        try {
            await this.dialogService.confirm({
                title: 'Open subtasks left!',
                text: 'Do you want to mark all subtasks as completed too?',
                buttons: ['Keep uncompleted', 'Cancel', 'OK'],
            });

            return dispatchAction(true);
        } catch (clickedButton) {
            if (clickedButton == 'Keep uncompleted') return dispatchAction();
            return {
                changedStatus: false,
                collapseSubtaskList: false,
            };
        }
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
        if (!subtaskName)
            try {
                subtaskName = await this.dialogService.prompt({
                    title: 'Create new subtask:',
                    buttons: ['Cancel', 'Create'],
                    placeholder: 'subtask name',
                });
            } catch {
                return { created: false };
            }

        this.store.dispatch(new AppDataActions.AddSubtask(taskId, subtaskName));
        return { created: true };
    }

    async deleteTask(taskId: string, openSubtasksCount: number) {
        try {
            await this.dialogService.confirm({
                title: `Delete this task?`,
                text: openSubtasksCount
                    ? `and ${openSubtasksCount > 1 ? `all ` : ''}it's ${openSubtasksCount} open ${
                          openSubtasksCount > 1 ? `subtasks` : 'subtask'
                      }?`
                    : null,
                buttons: ['Cancel', '!Delete' + (openSubtasksCount ? ' all' : '')],
            });

            this.store.dispatch(new AppDataActions.DeleteTask(taskId));
            return { deleted: true };
        } catch {
            return { deleted: false };
        }
    }
}
