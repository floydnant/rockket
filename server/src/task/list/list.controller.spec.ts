import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../../prisma-abstractions/prisma.module'
import { UserModule } from '../../user/user.module'
import { ListController } from './list.controller'
import { ListRepository } from './list.repository'
import { ListService } from './list.service'

describe('ListController', () => {
    let controller: ListController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [UserModule, PrismaModule],
            providers: [ListRepository, ListService],
            controllers: [ListController],
        }).compile()

        controller = module.get<ListController>(ListController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
