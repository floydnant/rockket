import { z } from 'zod'
import { ValueOf } from '../utils'
import { EntityCommentType as DbEntityCommentType, EntityComment as DbEntityComment } from '@prisma/client'

export const EntityCommentType = {
    TaskComment: 'TASK_COMMENT',
    TasklistComment: 'TASKLIST_COMMENT',
} as const
export type EntityCommentType = ValueOf<typeof EntityCommentType>

// This is to ensure that the `EntityCommentType` is compatible with the `DbEntityCommentType`
const _entityCommentTypeAssertion = {} as Record<EntityCommentType, never> satisfies Record<
    DbEntityCommentType,
    never
>

export const baseEntityCommentSchema = z.object({
    id: z.string(),
    text: z.string().min(1),
    createdAt: z.date({ coerce: true }),
    updatedAt: z.date({ coerce: true }),
    resolvedAt: z.date({ coerce: true }).nullable(),
    parentCommentId: z.string().nullable().default(null),
    userId: z.string(),
})

export const taskCommentSchema = baseEntityCommentSchema.extend({
    type: z.literal(EntityCommentType.TaskComment),
    taskId: z.string(),
    listId: z.null().default(null),
})
export const tasklistCommentSchema = baseEntityCommentSchema.extend({
    type: z.literal(EntityCommentType.TasklistComment),
    taskId: z.null().default(null),
    listId: z.string(),
})

export const entityCommentSchema = z.discriminatedUnion('type', [taskCommentSchema, tasklistCommentSchema])
export type EntityComment = z.infer<typeof entityCommentSchema>

// This is to ensure that the `EntityCommentType` is exhaustively matched in the `entityCommentSchema` union
const _exhaustiveEntityCommentTypeAssertion = {} as Record<EntityComment['type'], never> satisfies Record<
    EntityCommentType,
    never
>

// This is to ensure that every entity comment is compatible with the `DbEntityComment`
const _entityCommentMetaDataAssertion = {} as EntityComment satisfies DbEntityComment
