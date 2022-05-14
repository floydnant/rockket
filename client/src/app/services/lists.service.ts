import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { DialogService } from '../components/organisms/custom-dialog';
import { EditMenuService } from '../components/organisms/edit-menu';
import { AppDataActions, AppState } from '../reducers';
import { TaskList } from '../shared/taskList.model';

@Injectable({
    providedIn: 'root',
})
export class ListsService {
    constructor(
        private dialogService: DialogService,
        private editMenuService: EditMenuService,
        private store: Store<AppState>
    ) {}

    setActiveList(listId: string) {
        this.store.dispatch(new AppDataActions.SetActiveList(listId));
    }

    async createList(listName?: string) {
        if (!listName)
            try {
                listName = await this.dialogService.prompt({
                    title: 'Create new list:',
                    buttons: ['Cancel', 'Create'],
                    placeholder: 'list name',
                });
            } catch {
                return { created: false };
            }

        this.store.dispatch(new AppDataActions.CreateList(listName));
        return { created: true };
    }

    async openListDetails(listData: TaskList) {
        let updatedTaskList: TaskList;
        try {
            updatedTaskList = (await this.editMenuService.editTaskListDetails(listData)) as TaskList;
        } catch (clickedButton) {
            if (clickedButton == 'Deleted') return await this.deleteList(listData.id);
            return { updated: false };
        }

        this.store.dispatch(new AppDataActions.EditList(listData.id, { ...listData, ...updatedTaskList }));
        return { updated: true };
    }

    async deleteList(listId: string) {
        try {
            await this.dialogService.confirm({ title: 'Delete this list?', buttons: ['Cancel', '!Delete'] });
        } catch {
            return { deleted: false };
        }

        this.store.dispatch(new AppDataActions.DeleteList(listId));
        return { deleted: true };
    }

    sortLists(sortedLists: TaskList[]) {
        this.store.dispatch(new AppDataActions.SortLists(sortedLists));
    }
}
