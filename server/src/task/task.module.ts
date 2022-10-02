import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { ListController } from './list/list.controller'
import { TaskController } from './task.controller'
import { ListService } from './list/list.service'
import { ListRepository } from './list/list.repository'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { TaskService } from './task.service'
import { TaskRepository } from './task.repository'
import { PermissionsService } from './permissions/permissions.service'

@Module({
    imports: [UserModule, PrismaModule],
    controllers: [ListController, TaskController],
    providers: [ListService, ListRepository, TaskService, TaskRepository, PermissionsService],
})
export class TaskModule {}
