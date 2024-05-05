import { z } from 'zod'
import { PartialMaskOf, createMatcher } from '../utils'
import { mapUnionOptions } from '../utils/zod-schema.utils'
import {
    EntityComment,
    EntityCommentType,
    baseEntityCommentSchema,
    entityCommentSchema,
} from './comment.schema'

const commentInputOmitMask = {
    id: true,
    createdAt: true,
    updatedAt: true,
    resolvedAt: true,
} as const satisfies PartialMaskOf<EntityComment>
export const createEntityCommentInputSchema = mapUnionOptions(entityCommentSchema, option => {
    return option.omit(commentInputOmitMask)
})
export type CreateEntityCommentInput = z.input<typeof createEntityCommentInputSchema>

////////// Create Comment //////////
export const createEntityCommentDtoSchema = z.object({
    data: mapUnionOptions(createEntityCommentInputSchema, option => option.omit({ userId: true })),
})
export type CreateEntityCommentDtoInput = z.input<typeof createEntityCommentDtoSchema>
export type CreateEntityCommentDto = z.infer<typeof createEntityCommentDtoSchema>

////////// Update Comment //////////
export const updateEntityCommentDtoSchema = baseEntityCommentSchema
    .pick({ text: true, resolvedAt: true })
    .partial()
export type UpdateEntityCommentDto = z.infer<typeof updateEntityCommentDtoSchema>

export const entityCommentsFilterSchema = z.enum(['all', 'unresolved', 'resolved'])
export type EntityCommentsFilter = z.infer<typeof entityCommentsFilterSchema>

////////// List Comment Query //////////
/** This will throw if no EntityCommentType could be matched from the input */
const isValidCommentsQuery = createMatcher<EntityCommentType, ListEntityCommentsQuery>().withSyncCases({
    [EntityCommentType.TaskComment]: query => {
        if (query.taskId) return true
        return undefined
    },
    [EntityCommentType.TasklistComment]: query => {
        if (query.listId) return true
        return undefined
    },
    default: () => false,
}).match

export const listEntityCommentsQuerySchema = z
    .object({
        filter: entityCommentsFilterSchema.default('unresolved'),
        taskId: z.string().optional(),
        listId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (isValidCommentsQuery(data)) return

        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Either taskId or listId must be provided',
            path: [],
        })
    })
export type ListEntityCommentsQuery = z.infer<typeof listEntityCommentsQuerySchema>
