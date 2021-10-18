import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as AppDataActions from './appData.actions';

@Injectable()
export class AppDataEffects {
    constructor(private actions$: Actions, private store: Store) {}

    saveAppData$ = createEffect(() =>
        this.actions$.pipe(
            mergeMap(() =>
                this.store.pipe(
                    map(_data => new AppDataActions.SaveToDB()),
                    catchError(() => EMPTY)
                )
            )
        )
    );
}
