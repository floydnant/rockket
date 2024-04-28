import { Task, TaskStatus } from './task.model'

export const getTaskStatusUpdatedAt = (
    task: Pick<Task, 'statusUpdatedAt' | 'status'>,
    newStatus: TaskStatus | undefined,
): Task['statusUpdatedAt'] => {
    // If the status wasn't updated => keep the current statusUpdatedAt
    if (!newStatus) return task.statusUpdatedAt
    // If the status didn't actually change => keep the current statusUpdatedAt
    if (task.status == newStatus) return task.statusUpdatedAt

    return new Date()
}
