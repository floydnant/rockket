import { z } from 'zod'
import { newUuid } from '../utils'
import { CreateEntityCommentInput, createEntityCommentInputSchema } from './comment.dto'
import { EntityComment } from './comment.schema'

export const newEntityComment = (input: CreateEntityCommentInput): EntityComment => {
    return {
        ...createEntityCommentInputSchema.parse(input),
        id: newUuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
    }
}
export const newEntityComment_ = z
    .function()
    .args(createEntityCommentInputSchema)
    .implement((input: CreateEntityCommentInput): EntityComment => {
        return {
            parentCommentId: null,
            taskId: null,
            listId: null,
            ...input,
            id: newUuid(),
            createdAt: new Date(),
            updatedAt: new Date(),
            resolvedAt: null,
        }
    })
