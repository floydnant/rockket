import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { ListController } from './list/list.controller'
import { ListRepository } from './list/list.repository'
import { ListService } from './list/list.service'
import { PermissionsService } from './permissions/permissions.service'
import { TaskController } from './task/task.controller'
import { TaskRepository } from './task/task.repository'
import { TaskService } from './task/task.service'
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
