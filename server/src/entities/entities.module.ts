import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma-abstractions/prisma.module'
import { ListController } from 'src/entities/list/list.controller'
import { ListRepository } from 'src/entities/list/list.repository'
import { ListService } from 'src/entities/list/list.service'
import { PermissionsService } from 'src/entities/permissions/permissions.service'
import { TaskController } from 'src/entities/task/task.controller'
import { TaskRepository } from 'src/entities/task/task.repository'
import { TaskService } from 'src/entities/task/task.service'
import { UserModule } from 'src/user/user.module'
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
