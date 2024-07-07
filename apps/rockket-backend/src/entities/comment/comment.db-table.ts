import { EntityCommentType, entityCommentSchema } from '@rockket/commons'
import { createSqlTable } from '../../shared/sql.utils'

export const entityCommentsTable = createSqlTable({
    tableName: 'entity_comments',
    columns: {
        id: 'id',
        text: 'text',
        type: 'type',
        resolvedAt: 'resolved_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        parentCommentId: 'parent_comment_id',
        userId: 'user_id',
        taskId: 'task_id',
        listId: 'list_id',
    } as const,
    coreSchema: entityCommentSchema,
})

export const commentTypeColumnMap = {
    [EntityCommentType.TaskComment]: entityCommentsTable.taskId,
    [EntityCommentType.TasklistComment]: entityCommentsTable.listId,
} satisfies Record<EntityCommentType, string>
