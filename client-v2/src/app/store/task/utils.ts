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

export const traceTaskList = (
    lists: TaskListPreviewRecursive[],
    id: string,
    trace: TaskListPreviewRecursive[] = []
): TaskListPreviewRecursive[] => {
    return lists.flatMap(list => {
        if (list.id == id) return [list]

        if (list.childLists.length) {
            const subtrace = traceTaskList(list.childLists, id, [...trace, list])
            if (subtrace.length) return [list, ...subtrace]

            return []
        }

        return []
    })
}

export const getParentListByChildId = (
    list: TaskListPreviewRecursive[],
    id: string
): { list: TaskListPreviewRecursive[]; index: number } | void => {
    for (let index = 0; index < list.length; index++) {
        const tasklist = list[index]

        if (tasklist.id == id) return { list, index }

        if (tasklist.childLists.length) {
            const result = getParentListByChildId(tasklist.childLists, id)
            if (result) return result
        }
    }
}

export const getTaskListById = (taskLists: TaskListPreviewRecursive[], id: string): TaskListPreviewRecursive | void => {
    const res = getParentListByChildId(taskLists, id)
    if (!res) return

    return res.list[res.index]
}
