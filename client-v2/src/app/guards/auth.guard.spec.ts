import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'

import { AuthGuard } from './auth.guard'

describe('AuthGuard', () => {
    let guard: AuthGuard

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: Store, useValue: { subscribe() {}, select() {} } },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: Router, useValue: { pareseUrl() {} } },
            ],
        })
        guard = TestBed.inject(AuthGuard)
    })

    it('should be created', () => {
        expect(guard).toBeTruthy()
    })
})
