import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { downloadObjectAsJson, generateId } from 'src/app/shared/utils';
import { DialogService } from '../components/organisms/custom-dialog';

import { AppDataActions } from '../reducers/appData';
import { AppData, AppState } from '../reducers/appData/appData.model';

@Injectable({
    providedIn: 'root',
})
export class AppDataService {
    constructor(private store: Store<AppState>, private dialogService: DialogService) {
        this.load();
        this.store.subscribe(data => {
            this.save(data);
            this.data = data;
            console.log(data);
        });
    }
    data: AppState;

    localStorageKey = 'todoListData';

    save(data: AppState) {
        localStorage[this.localStorageKey] = JSON.stringify(data);
        console.log('%cdatabase updated', 'color: orange;');
    }
    load() {
        try {
            const data = JSON.parse(localStorage[this.localStorageKey]);
            this.store.dispatch(new AppDataActions.ImportToDB(data.appData, true));
            console.log(
                '%cAppData successfully loaded from database (localStorage for now)',
                'color: hsl(113, 100%, 50%);'
            );
        } catch (err) {
            console.log('%ccould not load data from database (localStorage for now)', 'color: red;');
        }
    }

    async exportAsJSON(...listIds: string[]) {
        try {
            await this.dialogService.confirm({ title: `Download this list as file?`, buttons: ['Cancel', 'Download'] });
        } catch {
            return;
        }

        const exportData = {
            appData: {
                ...this.data.appData,
                // only export the lists with the given id's or active list if none were given
                lists: this.data.appData.lists.filter(l => {
                    return (listIds || []).some(id => l.id == id) || l.id == this.data.appData.activeListId;
                }),
            },
        };
        const listCount = exportData.appData.lists.length;
        const fileName = listCount > 1 ? listCount + ' ToDo lists' : exportData.appData.lists[0].name + ' - todo list';

        downloadObjectAsJson(exportData, fileName, true);
    }
    importFromJSON(unparsed: string) {
        let jsonData: AppState | { [key: string]: any };
        try {
            jsonData = JSON.parse(unparsed.replace(/metaData/g, 'meta'));
        } catch (e) {
            this.dialogService.confirm({ title: 'Failed to read file.', text: 'Have you modified it?' });
            console.error('Failed to parse JSON: ' + e);
            return;
        }
        if (!('appData' in jsonData)) {
            this.dialogService.confirm({ title: 'The file cannot be interpreted as a task list.' });
            return;
        }
        const appData = jsonData.appData as AppData;
        if (!('activeListId' in appData && 'lists' in appData)) {
            this.dialogService.confirm({ title: 'The file cannot be interpreted as a task list.' });
            return;
        }

        // TODO: add a prompt wich lets the user select wich lists to import
        const data = {
            ...appData,
            lists: appData.lists.map(list => {
                // check if id already exists
                const id = this.data.appData.lists.some(l => l.id == list.id) ? generateId() : list.id;
                // check if name already exists
                const name = this.data.appData.lists.some(l => l.name == list.name)
                    ? list.name + ' [1]' //TODO: make this increment programmatically so there is NEVER a duplicate name
                    : list.name;

                return { ...list, id, name };
            }),
        };
        this.store.dispatch(new AppDataActions.ImportToDB(data));
    }
    deleteAllData() {
        localStorage.removeItem(this.localStorageKey);
    }
}
