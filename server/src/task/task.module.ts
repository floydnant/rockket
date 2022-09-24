import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { ListController } from './list/list.controller'
import { TaskController } from './task.controller'

@Module({
    imports: [UserModule],
    controllers: [ListController, TaskController],
})
export class TaskModule {}
