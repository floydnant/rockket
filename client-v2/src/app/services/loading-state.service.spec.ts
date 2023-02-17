import { TestBed } from '@angular/core/testing'
import { actionsMock } from '../utils/unit-test.mocks'

import { LoadingStateService } from './loading-state.service'

describe('LoadingStateService', () => {
    let service: LoadingStateService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [actionsMock],
        })
        service = TestBed.inject(LoadingStateService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
