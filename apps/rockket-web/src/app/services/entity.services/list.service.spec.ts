import { TestBed } from '@angular/core/testing'
import { httpServiceMock } from '../../utils/unit-test.mocks'

import { ListService } from './list.service'

describe('ListService', () => {
    let service: ListService

    beforeEach(() => {
        TestBed.configureTestingModule({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            providers: [httpServiceMock],
        })
        service = TestBed.inject(ListService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
