import { z } from 'zod'
import { taskSchema } from './task.schema'
import { entityEventSchema } from '../entity-event/entity-event.schemas'

const mutableTask = taskSchema.pick({
    title: true,
    description: true,
    status: true,
    priority: true,

    listId: true,
    parentTaskId: true,
    deadline: true,
})

////////// Update Task //////////
export const updateTaskDtoSchema = mutableTask.partial()
export type UpdateTaskDto = z.infer<typeof updateTaskDtoSchema>
//
export const updateTaskResponseSchema = z.object({ task: taskSchema, newEvents: entityEventSchema.array() })
export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>

////////// Create Task //////////
export const createTaskDtoSchema = mutableTask.partial().required({ title: true, listId: true })
export type CreateTaskDto = z.infer<typeof createTaskDtoSchema>
//
export const createTaskResponseSchema = taskSchema
export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>