export type TaskList = {
    id: string
    title: string
    description: string | null
    createdAt: string
    ownerId: string

    parentListId: string
    childLists: string[]
    taskIds: string[]
    // Participants: string[] // maybe this one as well
}

export type TasklistPreview = Pick<TaskList, 'id' | 'title' | 'childLists' | 'parentListId'>

export type TasklistDetail = Pick<TaskList, 'description' | 'ownerId' | 'createdAt'>

export enum ListPermission {
    Manage = 'Manage',
    Edit = 'Edit',
    Comment = 'Comment',
    View = 'View',
}
