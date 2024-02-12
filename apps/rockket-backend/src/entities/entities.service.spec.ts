import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { EntitiesService } from './entities.service'
import { ListRepository } from './list/list.repository'
import { ListService } from './list/list.service'
import { PermissionsService } from './permissions/permissions.service'
import { TaskRepository } from './task/task.repository'
import { TaskService } from './task/task.service'

describe('EntitiesService', () => {
    let service: EntitiesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PrismaModule],
            providers: [
                EntitiesService,
                TaskService,
                TaskRepository,
                ListService,
                ListRepository,
                PermissionsService,
            ],
        }).compile()

        service = module.get<EntitiesService>(EntitiesService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
