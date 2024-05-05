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
