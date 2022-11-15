import { TestBed } from '@angular/core/testing'
import { Store } from '@ngrx/store'

import { AuthGuard } from './auth.guard'

describe('LoggedInGuard', () => {
    let guard: AuthGuard

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: Store, useValue: { subscribe() {}, select() {} } },
            ],
        })
        guard = TestBed.inject(AuthGuard)
    })

    it('should be created', () => {
        expect(guard).toBeTruthy()
    })
})
