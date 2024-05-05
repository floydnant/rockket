import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { PermissionsService } from '../permissions/permissions.service'
import { ListRepository } from './list.repository'
import { ListService } from './list.service'
import { CommentRepository } from '../comment/comment.repository'
import { CommentService } from '../comment/comment.service'

describe('ListService', () => {
    let service: ListService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [ListService, ListRepository, PermissionsService, CommentService, CommentRepository],
        }).compile()

        service = module.get<ListService>(ListService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
