import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { ListRepository } from '../list/list.repository'
import { PermissionsService } from '../permissions/permissions.service'
import { TaskRepository } from './task.repository'
import { TaskService } from './task.service'
import { CommentService } from '../comment/comment.service'
import { CommentRepository } from '../comment/comment.repository'

describe('TaskService', () => {
    let service: TaskService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [
                TaskService,
                TaskRepository,
                ListRepository,
                PermissionsService,
                CommentService,
                CommentRepository,
            ],
        }).compile()

        service = module.get<TaskService>(TaskService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
