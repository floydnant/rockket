import { Test, TestingModule } from '@nestjs/testing'
import { ListRepository } from './list.repository'

describe('ListRepositoryService', () => {
    let service: ListRepository

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ListRepository],
        }).compile()

        service = module.get<ListRepository>(ListRepository)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
