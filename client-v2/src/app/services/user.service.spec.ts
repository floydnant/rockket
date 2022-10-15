import { TestBed } from '@angular/core/testing'
import { HttpService } from '../http/http.service'

import { UserService } from './user.service'

describe('UserService', () => {
    let service: UserService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: HttpService, useValue: { post() {}, get() {} } },
            ],
        })
        service = TestBed.inject(UserService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
