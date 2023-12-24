import { TaskPriority, TaskStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { enumInvalidMessage } from '../../utilities/validation'

class TaskDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description: string

    @IsOptional()
    @IsEnum(TaskStatus, enumInvalidMessage('status', TaskStatus))
    status: TaskStatus

    @IsOptional()
    @IsEnum(TaskPriority, enumInvalidMessage('priority', TaskPriority))
    priority: TaskPriority

    // ListId must always be given, even when the task is not a root level task
    @IsUUID()
    listId: string

    @IsOptional()
    @IsUUID()
    parentTaskId: string

    @IsOptional()
    @IsDateString()
    deadline: string

    @IsOptional()
    @IsUUID()
    blockedById: string
}

export class CreateTaskDto extends TaskDto {}

export class UpdateTaskDto extends TaskDto {
    @IsOptional()
    title: string

    // But we only need the listId here if we move the task to a different list
    @IsOptional()
    listId: string
}

export class CreateTaskCommentDto {
    @IsNotEmpty()
    text: string
}
export class UpdateTaskCommentDto extends CreateTaskCommentDto {}
