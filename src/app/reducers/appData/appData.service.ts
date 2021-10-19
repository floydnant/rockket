import { Injectable, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppDataActions } from '.';
import { AppState } from './appData.model';

@Injectable({
    providedIn: 'root',
})
export class AppDataService implements OnInit {
    constructor(private store: Store<AppState>) {
        this.load();
        this.store.subscribe(data => {
            this.save(data);
            console.log(data);
        });
    }

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
            this.store.dispatch(new AppDataActions.ImportToDB(data.appData));
            console.log(
                '%cAppData successfully loaded from database (localStorage for now)',
                'color: hsl(113, 100%, 50%);'
            );
        } catch (err) {
            console.log('%ccould not load data from database (localStorage for now)', 'color: red;');
            // this.data = this.db.getDefaultData();
        }
    };

    ngOnInit() {
        // this.load();
    }
}
