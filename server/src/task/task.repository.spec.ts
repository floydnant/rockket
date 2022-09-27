import { Test, TestingModule } from '@nestjs/testing'
import { TaskRepository } from './task.repository'

describe('TaskRepositoryService', () => {
    let service: TaskRepository

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TaskRepository],
        }).compile()

        service = module.get<TaskRepository>(TaskRepository)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
