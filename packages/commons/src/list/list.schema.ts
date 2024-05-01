import { z } from 'zod'

export const tasklistSchema = z.object({
    id: z.string(),
    title: z.string().min(1),
    description: z.string().nullable(),
    createdAt: z.date({ coerce: true }),
    ownerId: z.string(),
    parentListId: z.string().nullable(),
})
export type Tasklist = z.infer<typeof tasklistSchema>

export type TasklistDetail = Pick<Tasklist, 'description' | 'ownerId' | 'createdAt'>

export enum ListPermission {
    Manage = 'Manage',
    Edit = 'Edit',
    Comment = 'Comment',
    View = 'View',
}
