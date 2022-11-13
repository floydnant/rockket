export enum TaskStatus {
    BACKLOG = 'Backlog',
    OPEN = 'Open',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    NOT_PLANNED = 'Not Planned',
}

export const statusSortingMap: Record<TaskStatus, number> = {
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.OPEN]: 1,
    [TaskStatus.BACKLOG]: 2,
    [TaskStatus.COMPLETED]: 3,
    [TaskStatus.NOT_PLANNED]: 4,
}

export enum TaskPriority {
    OPTIONAL = 'Optional',
    NONE = 'None',
    MEDIUM = 'Medium',
    HIGH = 'High',
    URGENT = 'Urgent',
}
export const prioritySortingMap: Record<TaskPriority, number> = {
    [TaskPriority.URGENT]: 0,
    [TaskPriority.HIGH]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.NONE]: 3,
    [TaskPriority.OPTIONAL]: 4,
}

export interface ITask {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    // more to come: createdAt, openedAt, inProgressSince, closedAt, events, deadline, blockedBy
}
