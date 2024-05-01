import { z } from 'zod'
import { taskCommentSchema } from './task-comment.schema'

////////// Create Task Comment //////////
export const createTaskCommentDtoSchema = taskCommentSchema.pick({ text: true })
export type CreateTaskCommentDto = z.infer<typeof createTaskCommentDtoSchema>

////////// Update Task Comment //////////
export const updateTaskCommentDtoSchema = taskCommentSchema.pick({ text: true }).partial()
export type UpdateTaskCommentDto = z.infer<typeof updateTaskCommentDtoSchema>
