import { TestBed } from '@angular/core/testing'
import { httpServiceMock } from '../utils/unit-test.mocks'

import { EntitiesService } from './entities.service'

describe('EntitiesService', () => {
    let service: EntitiesService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [httpServiceMock],
        })
        service = TestBed.inject(EntitiesService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
