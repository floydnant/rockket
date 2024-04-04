import {
    createTasklistDtoSchema,
    shareTasklistDtoSchema,
    updatePermissionsDtoSchema,
    updateTasklistDtoSchema,
} from '@rockket/commons'
import { createZodDto } from 'nestjs-zod'

export class CreateTasklistZodDto extends createZodDto(createTasklistDtoSchema) {}
export class UpdateTasklistZodDto extends createZodDto(updateTasklistDtoSchema) {}
export class ShareTasklistZodDto extends createZodDto(shareTasklistDtoSchema) {}
export class UpdatePermissionsZodDto extends createZodDto(updatePermissionsDtoSchema) {}
