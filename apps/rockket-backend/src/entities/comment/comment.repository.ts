import { BadRequestException, Injectable } from '@nestjs/common'
import {
    EntityComment,
    EntityCommentType,
    EntityCommentsFilter,
    baseEntityCommentSchema,
    createMatcher,
    entityCommentSchema,
    valuesOf,
} from '@rockket/commons'
import { PrismaService } from '../../prisma-abstractions/prisma.service'
import { entityCommentsTable } from './comment.db-table'
import { commentTypeColumnMap } from './comment.db-table'
import { wrapInDoubleQuotes } from '../../shared/sql.utils'

const entityRefMatcher = createMatcher<
    EntityCommentType,
    { taskId?: string; listId?: string }
>().withSyncCases({
    [EntityCommentType.TaskComment]: query => {
        if (query.taskId)
            return {
                type: EntityCommentType.TaskComment as EntityCommentType,
                entityId: query.taskId,
            }
    },
    [EntityCommentType.TasklistComment]: query => {
        if (query.listId)
            return {
                type: EntityCommentType.TasklistComment as EntityCommentType,
                entityId: query.listId,
            }
    },
    default: () => {
        throw new BadRequestException('You must specify a task or list to retrieve comments for')
    },
})

@Injectable()
export class CommentRepository {
    constructor(private prisma: PrismaService) {}

    async listComments(query: {
        taskId?: string
        listId?: string
        filter: EntityCommentsFilter
    }): Promise<EntityComment[]> {
        const { filter, ...entity } = query

        const machine = {
            all: async () => {
                const comments = await this.prisma.entityComment.findMany({
                    where: entity,
                    orderBy: { createdAt: 'desc' },
                })
                // @TODO: throw db integrity/inconsistency exception if comments are not valid
                return entityCommentSchema.array().parse(comments)
            },

            resolved: async () => {
                const comments = await this.prisma.entityComment.findMany({
                    where: {
                        ...entity,
                        resolvedAt: { not: null },
                    },
                    orderBy: { createdAt: 'desc' },
                })
                // @TODO: throw db integrity/inconsistency exception if comments are not valid
                return entityCommentSchema.array().parse(comments)
            },

            unresolved: async () => {
                const allColumns = valuesOf(entityCommentsTable.$columns).map(wrapInDoubleQuotes)
                const { entityId, type } = entityRefMatcher.match(query)

                // @SCHEMA_CHANGE: EntityComment
                const rows = await this.prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
                    WITH RECURSIVE all_comments AS (
                        SELECT ${allColumns.join(', ')}
                        FROM "${entityCommentsTable.$tableName}"
                        WHERE "${commentTypeColumnMap[type]}" = '${entityId}'
                        AND "${entityCommentsTable.parentCommentId}" IS NULL
                        AND "${entityCommentsTable.resolvedAt}" IS NULL
                    
                        UNION
                    
                        SELECT ${allColumns.map(v => 't.' + v).join(', ')}
                        FROM "${entityCommentsTable.$tableName}" t
                            INNER JOIN all_comments a
                            ON a."${entityCommentsTable.id}" = t."${entityCommentsTable.parentCommentId}"
                    )
                    SELECT * FROM all_comments
                    ORDER BY "${entityCommentsTable.createdAt}" DESC
                `)

                return entityCommentsTable.parseRows(rows)
            },
        } satisfies Record<EntityCommentsFilter, () => Promise<EntityComment[]>>

        return await machine[filter]()
    }

    async createComment(comment: EntityComment): Promise<void> {
        await this.prisma.entityComment.create({ data: comment })
    }

    async getCommentById(commentId: string): Promise<EntityComment | null> {
        const comment = await this.prisma.entityComment.findUnique({ where: { id: commentId } })

        // @TODO: throw db integrity/inconsistency exception if comment is not valid
        return entityCommentSchema.parse(comment)
    }

    /** Returns all nested replies' ids */
    async listNestedRepliesIds(commentId: string): Promise<string[]> {
        const validCommentId = baseEntityCommentSchema.shape.id.uuid().parse(commentId)

        // @SCHEMA_CHANGE: EntityComment
        const nestedChildren: { id: string; parent_comment_id: string }[] = await this.prisma
            .$queryRawUnsafe(`
                WITH RECURSIVE all_comments AS (
                    SELECT "${entityCommentsTable.id}", "${entityCommentsTable.parentCommentId}"
                    FROM "${entityCommentsTable.$tableName}"
                    WHERE "${entityCommentsTable.id}" = '${validCommentId}'

                    UNION

                    SELECT t."${entityCommentsTable.id}", t."${entityCommentsTable.parentCommentId}"
                    FROM "${entityCommentsTable.$tableName}" t
                        INNER JOIN all_comments a ON a."${entityCommentsTable.id}" = t."${entityCommentsTable.parentCommentId}"
                )
                SELECT * FROM all_comments
            `)

        return nestedChildren.map(child => child.id).filter(id => id != commentId)
    }
    /**
     * Walks up the comment tree and returns all the comments' ids in the path to the root comment
     */
    async getCommentPath(commentId: string): Promise<string[]> {
        const validCommentId = baseEntityCommentSchema.shape.id.uuid().parse(commentId)

        // @SCHEMA_CHANGE: EntityComment
        const nestedChildren: { id: string; parent_comment_id: string }[] = await this.prisma
            .$queryRawUnsafe(`
                WITH RECURSIVE all_comments AS (
                    SELECT "${entityCommentsTable.id}", "${entityCommentsTable.parentCommentId}"
                    FROM "${entityCommentsTable.$tableName}"
                    WHERE "${entityCommentsTable.id}" = '${validCommentId}'

                    UNION

                    SELECT t."${entityCommentsTable.id}", t."${entityCommentsTable.parentCommentId}"
                    FROM "${entityCommentsTable.$tableName}" t
                        INNER JOIN all_comments a ON a."${entityCommentsTable.parentCommentId}" = t."${entityCommentsTable.id}"
                )
                SELECT * FROM all_comments
            `)

        return nestedChildren.map(child => child.id).reverse()
    }

    async updateComment(commentId: string, command: Partial<EntityComment>): Promise<EntityComment> {
        const updatedComment = await this.prisma.entityComment.update({
            where: { id: commentId },
            data: command,
        })

        // @TODO: throw db integrity/inconsistency exception if comment is not valid
        return entityCommentSchema.parse(updatedComment)
    }

    async resolveManyComments(commentIds: string[], resolvedAt: Date): Promise<void> {
        await this.prisma.entityComment.updateMany({
            where: {
                id: { in: commentIds },
                resolvedAt: null, // Only resolve unresolved comments
            },
            data: { resolvedAt },
        })
    }

    async deleteComment(commentId: string): Promise<void> {
        await this.prisma.entityComment.delete({ where: { id: commentId } })
    }
}
