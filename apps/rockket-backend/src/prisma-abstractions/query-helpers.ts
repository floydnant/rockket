export const SELECT_user_preview = {
    select: {
        id: true,
        username: true,
    },
}

export const SELECT_list_participant = {
    select: {
        id: true,
        user: SELECT_user_preview,
        permission: true,
    },
}

// @TODO: add tasklist select query helper
