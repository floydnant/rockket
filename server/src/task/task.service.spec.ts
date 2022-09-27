import { Test, TestingModule } from '@nestjs/testing'
import { UserModule } from '../user/user.module'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { ListRepository } from './list/list.repository'
import { TaskRepository } from './task.repository'
import { TaskService } from './task.service'

describe('TaskService', () => {
    let service: TaskService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule, UserModule],
            providers: [TaskService, TaskRepository, ListRepository],
        }).compile()

        service = module.get<TaskService>(TaskService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
