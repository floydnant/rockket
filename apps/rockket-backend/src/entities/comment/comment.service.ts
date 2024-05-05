import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import {
    CreateEntityCommentInput,
    EntityComment,
    EntityCommentType,
    EntityCommentsFilter,
    assertUnreachable,
    newEntityComment,
} from '@rockket/commons'
import { CommentRepository } from './comment.repository'

/**
 * This will throw if
 * - the given parentComment could be found
 * - the type does not match the parentComment'
 * - the associated entity does not match the parentComment's
 */
const assertMatchingParentComment = (
    input: CreateEntityCommentInput,
    parentComment: EntityComment | null,
): void => {
    if (!input.parentCommentId) return
    if (!parentComment) {
        throw new NotFoundException('Parent comment was given but no matching comment could be found')
    }
    if (input.type != parentComment.type) {
        throw new UnprocessableEntityException('Type must match parentComment.type')
    }

    if (input.type == EntityCommentType.TaskComment) {
        if (input.taskId != parentComment.taskId) {
            throw new UnprocessableEntityException('TaskId must match parentComment.taskId')
        }
        return
    }
    if (input.type == EntityCommentType.TasklistComment) {
        if (input.listId != parentComment.listId) {
            throw new UnprocessableEntityException('ListId must match parentComment.listId')
        }
        return
    }

    return assertUnreachable(input)
}

@Injectable()
export class CommentService {
    constructor(private commentsRepo: CommentRepository) {}

    async listComments(query: {
        taskId?: string
        listId?: string
        filter: EntityCommentsFilter
    }): Promise<EntityComment[]> {
        return await this.commentsRepo.listComments(query)
    }

    listNestedRepliesIds(commentId: string): Promise<string[]> {
        return this.commentsRepo.listNestedRepliesIds(commentId)
    }

    async getCommentById(commentId: string): Promise<EntityComment | null> {
        return await this.commentsRepo.getCommentById(commentId)
    }

    async createComment(command: CreateEntityCommentInput): Promise<EntityComment> {
        const parentComment = command.parentCommentId
            ? await this.commentsRepo.getCommentById(command.parentCommentId)
            : null
        assertMatchingParentComment(command, parentComment)

        const comment = newEntityComment(command)
        await this.commentsRepo.createComment(comment)

        return comment
    }

    async updateComment(
        commentId: string,
        command: Partial<Pick<EntityComment, 'text' | 'resolvedAt'>>,
    ): Promise<{ comment: EntityComment; affectedNestedCommentsIds: string[] }> {
        const updateComment = () =>
            this.commentsRepo.updateComment(commentId, {
                text: command.text,
                resolvedAt: command.resolvedAt,
                updatedAt: command.text ? new Date() : undefined,
            })

        // If the comment is resolved, we need to resolve all nested replies as well
        // If the comment is unresolved, we only update the comment itself
        if (command.resolvedAt instanceof Date) {
            const nestedCommentsIds = await this.commentsRepo.listNestedRepliesIds(commentId)
            const [updatedComment] = await Promise.all([
                updateComment(),
                this.commentsRepo.resolveManyComments(nestedCommentsIds, command.resolvedAt),
            ])

            return {
                comment: updatedComment,
                affectedNestedCommentsIds: nestedCommentsIds,
            }
        }

        return {
            comment: await updateComment(),
            affectedNestedCommentsIds: [],
        }
    }

    async deleteComment(commentId: string) {
        // @TODO: do we want to allow deleting comments which have replies? Or do we do a soft delete instead?
        return this.commentsRepo.deleteComment(commentId)
    }
}
