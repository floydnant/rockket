import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { ListRepository } from '../list/list.repository'
import { PermissionsService } from '../permissions/permissions.service'
import { TaskController } from './task.controller'
import { TaskRepository } from './task.repository'
import { TaskService } from './task.service'
import { CommentRepository } from '../comment/comment.repository'
import { CommentService } from '../comment/comment.service'

describe('TaskController', () => {
    let controller: TaskController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            controllers: [TaskController],
            providers: [
                TaskService,
                TaskRepository,
                ListRepository,
                PermissionsService,
                CommentService,
                CommentRepository,
            ],
        }).compile()

        controller = module.get<TaskController>(TaskController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
