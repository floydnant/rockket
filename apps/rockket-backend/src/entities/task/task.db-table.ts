import { taskSchema } from '@rockket/commons'
import { createSqlTable } from '../../shared/sql.utils'

export const taskTable = createSqlTable({
    tableName: 'Task',
    columns: {
        id: 'id',
        listId: 'listId',
        parentTaskId: 'parentTaskId',
        ownerId: 'ownerId',

        createdAt: 'createdAt',
        statusUpdatedAt: 'statusUpdatedAt',
        title: 'title',
        description: 'description',
        deadline: 'deadline',
        priority: 'priority',
        status: 'status',
    } as const,
    coreSchema: taskSchema,
})
