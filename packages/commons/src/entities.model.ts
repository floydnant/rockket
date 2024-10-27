import { z } from 'zod'
import { Tasklist } from './list/list.schema'
import { Task, taskSchema } from './task/task.schema'

export enum EntityType {
    TASKLIST = 'Tasklist',
    TASK = 'Task',
    // DOCUMENT = 'Document',
    // VIEW = 'View',
}

const baseEntitySchema = z.object({
    id: z.string(),
    entityType: z.nativeEnum(EntityType),
    createdAt: z.date({ coerce: true }),
    title: z.string(),
    parentId: z.string().nullable().optional(),
})

export const taskEntitySchema = baseEntitySchema
    .extend({
        entityType: z.literal(EntityType.TASK),
    })
    .merge(taskSchema)
export type TaskEntityPreview = z.infer<typeof taskEntitySchema>

export const tasklistEntitySchema = baseEntitySchema.extend({
    entityType: z.literal(EntityType.TASKLIST),
})
export type TasklistEntityPreview = z.infer<typeof tasklistEntitySchema>

export const entityPreviewSchema = z.union([taskEntitySchema, tasklistEntitySchema])
export type EntityPreview = z.infer<typeof entityPreviewSchema>

export type EntityPreviewRecursive = EntityPreview & {
    children: EntityPreviewRecursive[] | undefined
}
export type EntityPreviewFlattend = Omit<EntityPreviewRecursive, 'children'> & {
    path: string[]
    childrenCount: number | undefined
}

export type EntitiesSearchResultDto = Record<EntityType, unknown> & {
    [EntityType.TASK]: Task[]
    [EntityType.TASKLIST]: Tasklist[]
}
