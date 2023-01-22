import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { ListController } from '../entities/list/list.controller'
import { ListRepository } from '../entities/list/list.repository'
import { ListService } from '../entities/list/list.service'
import { PermissionsService } from '../entities/permissions/permissions.service'
import { TaskController } from '../entities/task/task.controller'
import { TaskRepository } from '../entities/task/task.repository'
import { TaskService } from '../entities/task/task.service'
import { UserModule } from '../user/user.module'
import { EntitiesController } from './entities.controller'
import { EntitiesService } from './entities.service'

@Module({
    imports: [UserModule, PrismaModule],
    controllers: [EntitiesController, ListController, TaskController],
    providers: [
        EntitiesService,
        ListService,
        ListRepository,
        TaskService,
        TaskRepository,
        PermissionsService,
    ],
})
export class EntitiesModule {}
