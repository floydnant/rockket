import {
    EntityPreview,
    EntityPreviewFlattend,
    EntityPreviewRecursive,
    EntityType,
    Task,
    TaskFlattend,
    TaskRecursive,
    prioritySortingMap,
    statusSortingMap,
} from '@rockket/commons'
import { TaskTreeMap } from './entities.state'

export const buildEntityTree = (allEntities: EntityPreview[]) => {
    const getChildren = (parentId: string): EntityPreviewRecursive[] => {
        const children = allEntities.filter(entity => parentId == entity.parentId)

        return children.map(entity => {
            const grandChildren = getChildren(entity.id)
            return { ...entity, children: grandChildren }
        })
    }

    const entityTree = allEntities
        .filter(entity => !entity.parentId)
        .map<EntityPreviewRecursive>(entity => ({
            ...entity,
            children: getChildren(entity.id),
        }))
    return entityTree
}

export const flattenEntityTree = (
    entityTree: EntityPreviewRecursive[],
    path: string[] = [],
): EntityPreviewFlattend[] => {
    return entityTree.flatMap(entity => {
        const { children, ...rest } = entity
        const flatEntity: EntityPreviewFlattend = { ...rest, path, childrenCount: children?.length }
        const subpath = [...path, entity.id]

        return [flatEntity, ...flattenEntityTree(children || [], subpath)]
    })
}
export const flattenEntityTreeWithFullPath = (
    entityTree: EntityPreviewRecursive[],
    path: EntityPreviewRecursive[] = [],
): (Omit<EntityPreviewFlattend, 'path'> & { path: EntityPreviewRecursive[] })[] => {
    return entityTree.flatMap(entity => {
        const { children, ...rest } = entity
        const flatEntity: Omit<EntityPreviewFlattend, 'path'> & { path: EntityPreviewRecursive[] } = {
            ...rest,
            path,
            childrenCount: children?.length,
        }
        const subpath = [...path, entity]

        return [flatEntity, ...flattenEntityTreeWithFullPath(children || [], subpath)]
    })
}

export const flattenTaskTree = (taskTree: TaskRecursive[], path: string[] = []): TaskFlattend[] => {
    return taskTree.flatMap(task => {
        const { children, ...restTask } = task
        // If (!children) console.warn(`Children for task '${task.id}' (${task.title}) not loaded yet!`)

        const flatTask = { ...restTask, path, children }
        const subpath = [...path, task.id]

        return [flatTask, ...flattenTaskTree(children || [], subpath)]
    })
}
export const flattenTaskTreeWithFullPath = (
    taskTree: TaskRecursive[],
    path: TaskRecursive[] = [],
): (Omit<TaskFlattend, 'path'> & { path: TaskRecursive[] })[] => {
    return taskTree.flatMap(task => {
        const { children, ...restTask } = task

        const flatTask = { ...restTask, path, children }
        const subpath = [...path, task]

        return [flatTask, ...flattenTaskTreeWithFullPath(children || [], subpath)]
    })
}

export const traceEntity = (enitityTree: EntityPreviewRecursive[], id: string): EntityPreviewRecursive[] => {
    return enitityTree.flatMap(entity => {
        if (entity.id == id) return [entity]

        if (!entity.children?.length) return []

        const subtrace = traceEntity(entity.children, id)
        if (subtrace.length) return [entity, ...subtrace]

        return []
    })
}

export const getParentEntityByChildId = (
    entityTree: EntityPreviewRecursive[],
    id: string,
): { subTree: EntityPreviewRecursive[]; index: number } | void => {
    for (let index = 0; index < entityTree.length; index++) {
        const entity = entityTree[index]

        if (entity.id == id) return { subTree: entityTree, index }

        if (entity.children?.length) {
            const result = getParentEntityByChildId(entity.children, id)
            if (result) return result
        }
    }
}

export const getEntityById = (
    entityTree: EntityPreviewRecursive[],
    id: string,
): EntityPreviewRecursive | void => {
    const res = getParentEntityByChildId(entityTree, id)
    if (!res) return

    return res.subTree[res.index]
}

interface TaskToEntityPreviewMapperFn {
    (task: Task): EntityPreview & Pick<Task, 'status' | 'priority'>
    (task: TaskRecursive): EntityPreviewRecursive & Pick<Task, 'status' | 'priority'>
}

// @TODO: find a good spot for this
export const mapTaskToEntityPreview: TaskToEntityPreviewMapperFn = ({
    id,
    listId,
    parentTaskId,
    title,
    status,
    priority,
    ...rest
}) => ({
    ...rest,
    id,
    entityType: EntityType.Task,
    parentId: parentTaskId || listId,
    parentTaskId,
    listId,
    title,
    status,
    priority,
    children: 'children' in rest ? rest.children?.map(mapTaskToEntityPreview) : undefined,
})

export const buildTaskTree = (alltasks: Task[]) => {
    const getChildren = (parentId: string): TaskRecursive[] => {
        const children = alltasks.filter(task => parentId == task.parentTaskId)

        return children.map(childTask => {
            const grandChildren = getChildren(childTask.id)
            return { ...childTask, children: grandChildren }
        })
    }

    const entityTree = alltasks
        .filter(entity => !entity.parentTaskId)
        .map<TaskRecursive>(task => ({
            ...task,
            children: getChildren(task.id),
        }))
    return entityTree
}

export const buildTaskTreeMap = (allTasks: Task[]) => {
    const listIds = new Set(allTasks.map(task => task.listId)).values()
    const taskTree = buildTaskTree(allTasks)

    const mapEntries = Array.from(listIds).map(listId => {
        const tasks = taskTree.filter(task => task.listId == listId)

        return [listId, tasks] as const
    })

    return Object.fromEntries(mapEntries) as TaskTreeMap
}

export const traceTask = (taskTree: TaskRecursive[], id: string): TaskRecursive[] => {
    return taskTree.flatMap(task => {
        if (task.id === id) return [task]

        if (!task.children?.length) return []

        const subtrace = traceTask(task.children, id)
        if (subtrace.length) return [task, ...subtrace]

        return []
    })
}

export const getParentTaskByChildId = (
    taskTree: TaskRecursive[],
    id: string,
): { subTree: TaskRecursive[]; index: number } | void => {
    for (let index = 0; index < taskTree.length; index++) {
        const task = taskTree[index]

        if (task.id == id) return { subTree: taskTree, index }

        if (task.children?.length) {
            const result = getParentTaskByChildId(task.children, id)
            if (result) return result
        }
    }
}

export const getTaskById = (taskTree: TaskRecursive[], id: string) => {
    const res = getParentTaskByChildId(taskTree, id)
    if (!res) return

    return res.subTree[res.index]
}

export type EntitySortingCompareFn = (a: { createdAt: Date }, b: { createdAt: Date }) => number
export type TaskSortingCompareFn = (a: Task, b: Task) => number

export type TaskSorter = (tasks: TaskRecursive[]) => TaskRecursive[]

export const entitySortingCompareFns = {
    byCreatedAtAsc: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    byCreatedAtDesc: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
} satisfies Record<string, EntitySortingCompareFn>

export const taskSortingCompareFns = {
    ...entitySortingCompareFns,

    byStatusAsc: (a, b) => statusSortingMap[a.status] - statusSortingMap[b.status],
    byStatusDesc: (a, b) => statusSortingMap[b.status] - statusSortingMap[a.status],

    byPriorityAsc: (a, b) => prioritySortingMap[a.priority] - prioritySortingMap[b.priority],
    byPriorityDesc: (a, b) => prioritySortingMap[b.priority] - prioritySortingMap[a.priority],

    byStatusUpdatedAtAsc: (a, b) => a.statusUpdatedAt.getTime() - b.statusUpdatedAt.getTime(),
    byStatusUpdatedAtDesc: (a, b) => b.statusUpdatedAt.getTime() - a.statusUpdatedAt.getTime(),
} satisfies Record<string, TaskSortingCompareFn>

export const applySortersRecursive = (
    taskTree: TaskRecursive[],
    ...compareFns: TaskSortingCompareFn[]
): TaskRecursive[] => {
    const mappedTree = taskTree.map(({ children, ...task }) => ({
        ...task,
        children: children && applySortersRecursive(children, ...compareFns),
    }))

    return compareFns.reduce((acc, compareFn) => acc.sort(compareFn), mappedTree)
}

export const applyMapperRecursive = (
    taskTree: TaskRecursive[],
    mapper: (tasks: TaskRecursive[]) => TaskRecursive[],
): TaskRecursive[] => {
    return mapper(taskTree).map(task => {
        if (!task.children) return task

        return {
            ...task,
            children: applyMapperRecursive(task.children, mapper),
        }
    })
}

export const visitDescendants = <T extends { children?: T[] | null }>(
    tree: T[],
    callback: (item: T) => void,
): void => {
    for (const item of tree) {
        callback(item)

        if (item.children) visitDescendants(item.children, callback)
    }
}

export const traceEntityIncludingTasks = (
    enitityTree: EntityPreviewRecursive[],
    taskTreeMap: TaskTreeMap,
    id: string,
): EntityPreviewRecursive[] => {
    return enitityTree.flatMap(entity => {
        if (entity.id == id) return [entity]

        if (entity.children?.length) {
            const subtrace = traceEntityIncludingTasks(entity.children, taskTreeMap, id)
            if (subtrace.length) return [entity, ...subtrace]
        }

        if (taskTreeMap[entity.id]?.length) {
            const taskTrace = traceTask(taskTreeMap[entity.id], id)
            if (taskTrace.length) return [entity, ...taskTrace.map(mapTaskToEntityPreview)]
        }

        return []
    })
}

export const flattenEntityTreeIncludingTasks = (
    entityTree: EntityPreviewRecursive[],
    taskTreeMap: TaskTreeMap,
    path: string[] = [],
): EntityPreviewFlattend[] => {
    return entityTree.flatMap(entity => {
        const { children, ...rest } = entity
        const tasks = taskTreeMap[entity.id]?.map(mapTaskToEntityPreview) || []
        const flatEntity = { ...rest, path, childrenCount: (children?.length || 0) + tasks.length }
        const subpath = [...path, entity.id]

        return [
            flatEntity,
            ...flattenEntityTreeIncludingTasks(children || [], taskTreeMap, subpath),
            ...flattenEntityTree(tasks, subpath),
            // ...flattenTaskTree(taskTreeMap[list.id].map(convertTaskToEntity)),
        ]
    })
}

export const getParentEntityByChildIdIncludingTasks = (
    entityTree: EntityPreviewRecursive[],
    taskTreeMap: TaskTreeMap,
    id: string,
): { subTree: (EntityPreviewRecursive | TaskRecursive)[]; index: number } | void => {
    for (let index = 0; index < entityTree.length; index++) {
        const entity = entityTree[index]

        if (entity.id == id) return { subTree: entityTree, index }

        if (entity.children?.length) {
            const result = getParentEntityByChildIdIncludingTasks(entity.children, taskTreeMap, id)
            if (result) return result
        }

        if (taskTreeMap[entity.id]?.length) {
            const result = getParentTaskByChildId(taskTreeMap[entity.id], id)
            if (result) return result
        }
    }
}

export const getEntityByIdIncludingTasks = (
    entityTree: EntityPreviewRecursive[],
    taskTreeMap: TaskTreeMap,
    id: string,
) => {
    const res = getParentEntityByChildIdIncludingTasks(entityTree, taskTreeMap, id)
    if (!res) return

    return res.subTree[res.index]
}
