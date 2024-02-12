import { z } from 'zod'
import { Task, TaskComment, taskSchema } from './task.model'

export const createTaskDtoSchema = taskSchema.partial({ status: true, priority: true })
export const updateTaskDtoSchema = taskSchema.partial()

type TaskUpdatable = Pick<
    Task,
    'title' | 'description' | 'status' | 'priority' | 'listId' | 'parentTaskId' | 'deadline' | 'blockedById'
>
export type CreateTaskDto = Pick<TaskUpdatable, 'title' | 'listId'> & Partial<TaskUpdatable>
export type UpdateTaskDto = Partial<TaskUpdatable>

export const createTaskCommentDtoSchema = z.object({
    text: z.string(),
})
export const updateTaskCommentDtoSchema = z.object({
    text: z.string().optional(),
})

export type CreateTaskCommentDto = Pick<TaskComment, 'text'>
export type UpdateTaskCommentDto = CreateTaskCommentDto
