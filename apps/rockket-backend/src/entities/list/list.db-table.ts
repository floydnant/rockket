import { tasklistSchema } from '@rockket/commons'
import { createSqlTable } from '../../shared/sql.utils'

export const listTable = createSqlTable({
    tableName: 'Tasklist',
    columns: {
        id: 'id',
        parentListId: 'parentListId',
        ownerId: 'ownerId',

        createdAt: 'createdAt',
        title: 'title',
        description: 'description',
    } as const,
    coreSchema: tasklistSchema,
})
