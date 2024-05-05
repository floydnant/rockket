import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { PermissionsService } from './permissions.service'
import { CommentRepository } from '../comment/comment.repository'
import { CommentService } from '../comment/comment.service'

describe('PermissionsService', () => {
    let service: PermissionsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [PermissionsService, CommentService, CommentRepository],
        }).compile()

        service = module.get<PermissionsService>(PermissionsService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
