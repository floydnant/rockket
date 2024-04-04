import {
    createTaskCommentDtoSchema,
    createTaskDtoSchema,
    updateTaskCommentDtoSchema,
    updateTaskDtoSchema,
} from '@rockket/commons'
import { createZodDto } from 'nestjs-zod'

export class CreateTaskZodDto extends createZodDto(createTaskDtoSchema) {}
export class UpdateTaskZodDto extends createZodDto(updateTaskDtoSchema) {}

export class CreateTaskCommentZodDto extends createZodDto(createTaskCommentDtoSchema) {}
export class UpdateTaskCommentZodDto extends createZodDto(updateTaskCommentDtoSchema) {}
