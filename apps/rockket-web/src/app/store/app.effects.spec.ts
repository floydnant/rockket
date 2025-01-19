import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { Action } from '@ngrx/store/src/models'
import { Observable } from 'rxjs'
import { AppEffects } from './app.effects'
import { storeMock } from '../utils/unit-test.mocks'

describe('AppEffects', () => {
    const actions$: Observable<Action> = new Observable()
    let effects: AppEffects

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AppEffects, storeMock, provideMockActions(() => actions$)],
        })

        effects = TestBed.inject(AppEffects)
    })

    it('should be created', () => {
        expect(effects).toBeTruthy()
    })
})
