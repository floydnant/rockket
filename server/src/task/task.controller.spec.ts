import { Test, TestingModule } from '@nestjs/testing'
import { UserModule } from '../user/user.module'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { ListRepository } from './list/list.repository'
import { TaskController } from './task.controller'
import { TaskRepository } from './task.repository'
import { TaskService } from './task.service'

describe('TaskController', () => {
    let controller: TaskController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule, UserModule],
            controllers: [TaskController],
            providers: [TaskService, TaskRepository, ListRepository],
        }).compile()

        controller = module.get<TaskController>(TaskController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
