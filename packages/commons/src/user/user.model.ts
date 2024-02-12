import { z } from 'zod'

export const userSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
})
export type User = z.infer<typeof userSchema>

export const userPreviewSchema = userSchema.pick({ id: true, username: true })
export type UserPreview = z.infer<typeof userPreviewSchema>
