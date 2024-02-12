import { TestBed } from '@angular/core/testing'
import { httpServiceMock } from '../utils/unit-test.mocks'

import { AccountService } from './account.service'

describe('AccountService', () => {
    let service: AccountService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [httpServiceMock],
        })
        service = TestBed.inject(AccountService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
