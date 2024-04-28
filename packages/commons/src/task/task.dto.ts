import { z } from 'zod'
import { TaskComment, taskSchema } from './task.model'

const updatableTask = taskSchema.pick({
    title: true,
    description: true,
    status: true,
    priority: true,

    listId: true,
    parentTaskId: true,
    blockedById: true,
    deadline: true,
})
export const createTaskDtoSchema = updatableTask.partial().required({ title: true, listId: true })
export const updateTaskDtoSchema = updatableTask.partial()

export type CreateTaskDto = z.infer<typeof createTaskDtoSchema>
export type UpdateTaskDto = z.infer<typeof updateTaskDtoSchema>

export const createTaskCommentDtoSchema = z.object({
    text: z.string(),
})
export const updateTaskCommentDtoSchema = z.object({
    text: z.string().optional(),
})

export type CreateTaskCommentDto = Pick<TaskComment, 'text'>
export type UpdateTaskCommentDto = CreateTaskCommentDto
