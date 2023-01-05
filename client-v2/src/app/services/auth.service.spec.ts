import { TestBed } from '@angular/core/testing'
import { httpServiceMock } from '../utils/unit-test.mocks'

import { AuthService } from './auth.service'

describe('AuthService', () => {
    let service: AuthService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [httpServiceMock],
        })
        service = TestBed.inject(AuthService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
