import { z } from 'zod'
import { ListPermission, tasklistSchema } from './list.schema'
import { entityEventSchema } from '../task'

const mutableTasklist = tasklistSchema.pick({
    title: true,
    description: true,
    parentListId: true,
})

////////// Create Tasklist //////////
export const createTasklistDtoSchema = mutableTasklist.partial({
    description: true,
    parentListId: true,
})
export type CreateTasklistDto = z.infer<typeof createTasklistDtoSchema>
//
export const createTasklistResponseSchema = tasklistSchema
export type CreateTasklistResponse = z.infer<typeof createTasklistResponseSchema>

////////// Update Tasklist //////////
export const updateTasklistDtoSchema = mutableTasklist.partial()
export type UpdateTasklistDto = z.infer<typeof updateTasklistDtoSchema>
//
export const updateTasklistResponseSchema = z.object({
    tasklist: tasklistSchema,
    newEvents: entityEventSchema.array(),
})
export type UpdateTasklistResponse = z.infer<typeof updateTasklistResponseSchema>

////////// Share Tasklist //////////
export type ShareTasklistDto = z.infer<typeof shareTasklistDtoSchema>
export const shareTasklistDtoSchema = z.object({
    permission: z.nativeEnum(ListPermission).optional(),
})

////////// Update Tasklist permission //////////
export const updatePermissionsDtoSchema = z.object({
    permission: z.nativeEnum(ListPermission),
})
