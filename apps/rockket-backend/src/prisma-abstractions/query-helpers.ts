import { Prisma } from '@prisma/client'
import { MaskOf, UserPreview } from '@rockket/commons'

export const SELECT_UserPreview = {
    select: {
        id: true,
        username: true,
    } satisfies Prisma.UserSelect satisfies MaskOf<UserPreview>,
}

export const SELECT_ListParticipant = {
    select: {
        id: true,
        user: SELECT_UserPreview,
        permission: true,
    } satisfies Prisma.ListParticipantSelect,
}

// @TODO: add tasklist select query helper
