import { z } from 'zod'
import { ListPermission } from './list.model'

export type CreateTasklistDto = z.infer<typeof createTasklistDtoSchema>
export const createTasklistDtoSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    parentListId: z.string().optional(),
})

export type UpdateTasklistDto = z.infer<typeof updateTasklistDtoSchema>
export const updateTasklistDtoSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
})

export type ShareTasklistDto = z.infer<typeof shareTasklistDtoSchema>
export const shareTasklistDtoSchema = z.object({
    permission: z.nativeEnum(ListPermission).optional(),
})

export const updatePermissionsDtoSchema = z.object({
    permission: z.nativeEnum(ListPermission),
})
