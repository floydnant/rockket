import { TestBed } from '@angular/core/testing'

import { InsightsService } from './insights.service'
import { actionsMock } from '../utils/unit-test.mocks'
import { RouterTestingModule } from '@angular/router/testing'

describe('InsightsService', () => {
    let service: InsightsService

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [actionsMock],
        })
        service = TestBed.inject(InsightsService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
