import { Injectable, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { downloadObjectAsJson, generateId } from 'src/app/shared/utils';

import { AppDataActions } from '.';
import { AppData, AppState } from './appData.model';

@Injectable({
    providedIn: 'root',
})
export class AppDataService implements OnInit {
    constructor(private store: Store<AppState>) {
        this.load();
        this.store.subscribe(data => {
            this.save(data);
            this.data = data;
            console.log(data);
        });
    }
    data: AppState;

    db = {
        localStorageKey: 'todoListData',
    };

    save = (data: AppState) => {
        localStorage[this.db.localStorageKey] = JSON.stringify(data);
        console.log('%cdatabase updated', 'color: orange;');
    };
    load = () => {
        try {
            let data = JSON.parse(localStorage[this.db.localStorageKey]);
            this.store.dispatch(new AppDataActions.ImportToDB(data.appData, true));
            console.log(
                '%cAppData successfully loaded from database (localStorage for now)',
                'color: hsl(113, 100%, 50%);'
            );
        } catch (err) {
            console.log('%ccould not load data from database (localStorage for now)', 'color: red;');
        }
    };
    exportAsJSON = (...listIds: string[]) => {
        console.log('exporting...');

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
    };
    importFromJSON = (data: AppData) => {
        this.store.dispatch(
            new AppDataActions.ImportToDB({
                ...data,
                lists: data.lists.map(list => {
                    // check if id already exists
                    const id = this.data.appData.lists.some(l => l.id == list.id) ? generateId() : list.id;
                    // check if name already exists
                    const name = this.data.appData.lists.some(l => l.name == list.name)
                        ? list.name + ' [1]' //TODO: make this increment programmatically so there is NEVER a duplicate name
                        : list.name;

                    return { ...list, id, name };
                }),
            })
        );
    };
    deleteAllData = () => localStorage.removeItem(this.db.localStorageKey);

    ngOnInit() {}
}
