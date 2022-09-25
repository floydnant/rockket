import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { ListRepository } from './list.repository'
import { ListService } from './list.service'

describe('ListService', () => {
    let service: ListService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [ListService, ListRepository],
        }).compile()

        service = module.get<ListService>(ListService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
