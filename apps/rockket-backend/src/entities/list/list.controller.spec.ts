import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { PermissionsService } from '../permissions/permissions.service'
import { TaskRepository } from '../task/task.repository'
import { TaskService } from '../task/task.service'
import { ListController } from './list.controller'
import { ListRepository } from './list.repository'
import { ListService } from './list.service'
import { CommentRepository } from '../comment/comment.repository'
import { CommentService } from '../comment/comment.service'

describe('ListController', () => {
    let controller: ListController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [
                ListRepository,
                ListService,
                TaskService,
                TaskRepository,
                PermissionsService,
                CommentService,
                CommentRepository,
            ],
            controllers: [ListController],
        }).compile()

        controller = module.get<ListController>(ListController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
