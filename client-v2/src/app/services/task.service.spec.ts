import { TestBed } from '@angular/core/testing'
import { httpServiceMock } from '../utils/unit-test.mocks'

import { TaskService } from './task.service'

describe('TaskService', () => {
    let service: TaskService

    beforeEach(() => {
        TestBed.configureTestingModule({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            providers: [httpServiceMock],
        })
        service = TestBed.inject(TaskService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
