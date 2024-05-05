import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma-abstractions/prisma.module'
import { UserModule } from '../user/user.module'
import { EntitiesController } from './entities.controller'
import { EntitiesService } from './entities.service'
import { ListController } from './list/list.controller'
import { ListRepository } from './list/list.repository'
import { ListService } from './list/list.service'
import { PermissionsService } from './permissions/permissions.service'
import { TaskController } from './task/task.controller'
import { TaskRepository } from './task/task.repository'
import { TaskService } from './task/task.service'
import { CommentController } from './comment/comment.controller'
import { CommentRepository } from './comment/comment.repository'
import { CommentService } from './comment/comment.service'

@Module({
    imports: [UserModule, PrismaModule],
    controllers: [EntitiesController, ListController, TaskController, CommentController],
    providers: [
        EntitiesService,
        ListService,
        ListRepository,
        TaskService,
        TaskRepository,
        CommentService,
        CommentRepository,
        PermissionsService,
    ],
})
export class EntitiesModule {}
