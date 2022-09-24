import { TaskPriority, TaskStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description: string

    @IsOptional()
    @IsEnum(TaskStatus)
    status: TaskStatus

    @IsOptional()
    @IsEnum(TaskPriority)
    priority: TaskPriority

    @IsOptional()
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

export class UpdateTaskDto extends CreateTaskDto {
    @IsOptional()
    title: string
}

export class CreateTaskCommentDto {
    @IsNotEmpty()
    text: string
}
export class UpdateTaskCommentDto extends CreateTaskCommentDto {}
