import { TestBed } from '@angular/core/testing'
import { actionsMock } from '../utils/unit-test.mocks'

import { UiStateService } from './ui-state.service'

describe('UiStateService', () => {
    let service: UiStateService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [actionsMock],
        })
        service = TestBed.inject(UiStateService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
