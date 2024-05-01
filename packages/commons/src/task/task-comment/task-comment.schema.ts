import { z } from 'zod'

export const taskCommentSchema = z.object({
    id: z.string(),
    taskId: z.string(),
    text: z.string(),
})
export type TaskComment = z.infer<typeof taskCommentSchema>
