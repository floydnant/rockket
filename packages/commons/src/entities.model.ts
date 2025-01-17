import { z } from 'zod'
import { tasklistSchema } from './list/list.schema'
import { taskSchema } from './task/task.schema'

export enum EntityType {
    Tasklist = 'TASKLIST',
    Task = 'TASK',
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
        entityType: z.literal(EntityType.Task),
    })
    .merge(taskSchema)
export type TaskEntityPreview = z.infer<typeof taskEntitySchema>

export const tasklistEntitySchema = baseEntitySchema.extend({
    entityType: z.literal(EntityType.Tasklist),
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

export const entitesSearchResultDtoSchema = z.object({
    [EntityType.Task]: taskSchema.array(),
    [EntityType.Tasklist]: tasklistSchema.array(),
} satisfies Record<EntityType, z.Schema>)
export type EntitiesSearchResultDto = z.infer<typeof entitesSearchResultDtoSchema>
