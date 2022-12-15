import { TasklistPreview } from 'src/app/models/task.model'
import { TaskListPreviewRecursive } from './task.model'

export const getTasklistTree = (allLists: TasklistPreview[]) => {
    const getChildren = (childIds: string[]): TaskListPreviewRecursive[] => {
        const children = childIds
            .map(childId => allLists.find(list => list.id == childId))
            .filter(childList => !!childList) as TasklistPreview[]

        return children.map(child => {
            const grandChildren = getChildren(child.childLists)
            return { ...child, childLists: grandChildren }
        })
    }

    const listTree = allLists
        .filter(list => !list.parentListId)
        .map<TaskListPreviewRecursive>(list => ({ ...list, childLists: getChildren(list.childLists) }))
    return listTree
}

export type TasklistFlattend = Omit<TaskListPreviewRecursive, 'childLists'> & {
    path: string[]
    childrenCount: number
}

export const flattenListTree = (lists: TaskListPreviewRecursive[], path: string[] = []): TasklistFlattend[] => {
    return lists.flatMap(list => {
        const { childLists, ...rest } = list
        const flatList = { ...rest, path, childrenCount: childLists.length }
        const subpath = [...path, list.id]

        return [flatList, ...flattenListTree(childLists, subpath)]
    })
}

export const getTaskListById = (taskLists: TaskListPreviewRecursive[], id: string): TaskListPreviewRecursive | void => {
    for (let index = 0; index < taskLists.length; index++) {
        const tasklist = taskLists[index]

        if (tasklist.id == id) return tasklist

        if (tasklist.childLists.length) {
            const taskList = getTaskListById(tasklist.childLists, id)
            if (taskList) return taskList
        }
    }
}
