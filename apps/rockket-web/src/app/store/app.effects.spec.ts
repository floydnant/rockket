import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { Action } from '@ngrx/store/src/models'
import { Observable } from 'rxjs'

import { AppEffects } from './app.effects'

describe('AppEffects', () => {
    let actions$: Observable<Action>
    let effects: AppEffects

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AppEffects, provideMockActions(() => actions$)],
        })

        effects = TestBed.inject(AppEffects)
    })

    it('should be created', () => {
        expect(effects).toBeTruthy()
    })
})
