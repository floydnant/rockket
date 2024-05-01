import { z } from 'zod'
import { taskStatusSchema } from './task-status.schemas'
import { taskPrioritySchema } from './task-priority.schemas'

export const taskSchema = z.object({
    id: z.string(),
    title: z.string().min(1),
    description: z.string().nullable(),
    status: taskStatusSchema,
    priority: taskPrioritySchema,

    listId: z.string(),
    ownerId: z.string(),
    parentTaskId: z.string().nullable(),

    createdAt: z.date({ coerce: true }),
    statusUpdatedAt: z.date({ coerce: true }),

    deadline: z.date({ coerce: true }).nullable(),
})
export type Task = z.infer<typeof taskSchema>

export type TaskRecursive = Task & { children: TaskRecursive[] | null }
export type TaskFlattend = TaskRecursive & { path: string[] }

export const taskDetailSchema = z.object({})
// @TODO: TaskDetail should (instead of just duplicating the task again) contain relationsTo, relationsFrom, comments, events
export type TaskDetail = z.infer<typeof taskDetailSchema>
