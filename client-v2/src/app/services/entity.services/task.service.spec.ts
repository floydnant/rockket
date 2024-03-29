import { TestBed } from '@angular/core/testing'
import { httpServiceMock } from 'src/app/utils/unit-test.mocks'

import { TaskService } from './task.service'

describe('TaskService', () => {
    let service: TaskService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [httpServiceMock],
        })
        service = TestBed.inject(TaskService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
