import { createTaskDtoSchema, updateTaskDtoSchema } from '@rockket/commons'
import { createZodDto } from 'nestjs-zod'

export class CreateTaskZodDto extends createZodDto(createTaskDtoSchema) {}
export class UpdateTaskZodDto extends createZodDto(updateTaskDtoSchema) {}
