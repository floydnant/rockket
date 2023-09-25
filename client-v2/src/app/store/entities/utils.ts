import {
    EntityPreview,
    EntityPreviewFlattend,
    EntityPreviewRecursive,
    EntityType,
} from 'src/app/fullstack-shared-models/entities.model'
import {
    prioritySortingMap,
    statusSortingMap,
    TaskPreview,
    TaskPreviewFlattend,
    TaskPreviewRecursive,
} from 'src/app/fullstack-shared-models/task.model'
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
    path: string[] = []
): EntityPreviewFlattend[] => {
    return entityTree.flatMap(entity => {
        const { children, ...rest } = entity
        const flatEntity: EntityPreviewFlattend = { ...rest, path, childrenCount: children?.length }
        const subpath = [...path, entity.id]

        return [flatEntity, ...flattenEntityTree(children || [], subpath)]
    })
}

export const flattenTaskTree = (taskTree: TaskPreviewRecursive[], path: string[] = []): TaskPreviewFlattend[] => {
    return taskTree.flatMap(task => {
        const { children, ...restTask } = task
        // if (!children) console.warn(`Children for task '${task.id}' (${task.title}) not loaded yet!`)

        const flatTask = { ...restTask, path, childrenCount: children?.length || 0 }
        const subpath = [...path, task.id]

        return [flatTask, ...flattenTaskTree(children || [], subpath)]
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
    id: string
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

export const getEntityById = (entityTree: EntityPreviewRecursive[], id: string): EntityPreviewRecursive | void => {
    const res = getParentEntityByChildId(entityTree, id)
    if (!res) return

    return res.subTree[res.index]
}

interface ConvertTaskToEntity {
    (task: TaskPreview): EntityPreview & Pick<TaskPreview, 'status' | 'priority'>
    (task: TaskPreviewRecursive): EntityPreviewRecursive & Pick<TaskPreview, 'status' | 'priority'>
}

// @TODO: find a good spot for this
export const convertTaskToEntity: ConvertTaskToEntity = ({
    id,
    listId,
    parentTaskId,
    title,
    status,
    priority,
    ...rest
}) => ({
    id,
    entityType: EntityType.TASK,
    parentId: parentTaskId || listId,
    title,
    status,
    priority,
    children: 'children' in rest ? rest.children?.map(convertTaskToEntity) : undefined,
})

export const buildTaskTree = (alltasks: TaskPreview[]) => {
    const getChildren = (parentId: string): TaskPreviewRecursive[] => {
        const children = alltasks.filter(task => parentId == task.parentTaskId)

        return children.map(childTask => {
            const grandChildren = getChildren(childTask.id)
            return { ...childTask, children: grandChildren }
        })
    }

    const entityTree = alltasks
        .filter(entity => !entity.parentTaskId)
        .map<TaskPreviewRecursive>(task => ({
            ...task,
            children: getChildren(task.id),
        }))
    return entityTree
}

export const buildTaskTreeMap = (allTasks: TaskPreview[]) => {
    const listIds = new Set(allTasks.map(task => task.listId)).values()
    const taskTree = buildTaskTree(allTasks)

    const mapEntries = Array.from(listIds).map(listId => {
        const tasks = taskTree.filter(task => task.listId == listId)

        return [listId, tasks] as const
    })

    return Object.fromEntries(mapEntries) as TaskTreeMap
}

export const traceTask = (taskTree: TaskPreviewRecursive[], id: string): TaskPreviewRecursive[] => {
    return taskTree.flatMap(task => {
        if (task.id === id) return [task]

        if (!task.children?.length) return []

        const subtrace = traceTask(task.children, id)
        if (subtrace.length) return [task, ...subtrace]

        return []
    })
}

export const getParentTaskByChildId = (
    taskTree: TaskPreviewRecursive[],
    id: string
): { subTree: TaskPreviewRecursive[]; index: number } | void => {
    for (let index = 0; index < taskTree.length; index++) {
        const task = taskTree[index]

        if (task.id == id) return { subTree: taskTree, index }

        if (task.children?.length) {
            const result = getParentTaskByChildId(task.children, id)
            if (result) return result
        }
    }
}

export const getTaskById = (taskTree: TaskPreviewRecursive[], id: string) => {
    const res = getParentTaskByChildId(taskTree, id)
    if (!res) return

    return res.subTree[res.index]
}

export type TaskSorter = (a: TaskPreview, b: TaskPreview) => number

export const sortByStatus: TaskSorter = (a, b) => statusSortingMap[a.status] - statusSortingMap[b.status]
export const sortByPriority: TaskSorter = (a, b) => prioritySortingMap[a.priority] - prioritySortingMap[b.priority]

export const applySorters = (taskTree: TaskPreviewRecursive[], ...sorters: TaskSorter[]): TaskPreviewRecursive[] => {
    const mappedTree = taskTree.map(({ children, ...task }) => ({
        ...task,
        children: children && applySorters(children, ...sorters),
    }))

    return sorters.reduce((acc, sorter) => acc.sort(sorter), mappedTree)
}

export const traceEntityIncludingTasks = (
    enitityTree: EntityPreviewRecursive[],
    taskTreeMap: TaskTreeMap,
    id: string
): EntityPreviewRecursive[] => {
    return enitityTree.flatMap(entity => {
        if (entity.id == id) return [entity]

        if (entity.children?.length) {
            const subtrace = traceEntityIncludingTasks(entity.children, taskTreeMap, id)
            if (subtrace.length) return [entity, ...subtrace]
        }

        if (taskTreeMap[entity.id]?.length) {
            const taskTrace = traceTask(taskTreeMap[entity.id], id)
            if (taskTrace.length) return [entity, ...taskTrace.map(convertTaskToEntity)]
        }

        return []
    })
}

export const flattenEntityTreeIncludingTasks = (
    entityTree: EntityPreviewRecursive[],
    taskTreeMap: TaskTreeMap,
    path: string[] = []
): EntityPreviewFlattend[] => {
    return entityTree.flatMap(entity => {
        const { children, ...rest } = entity
        const tasks = taskTreeMap[entity.id]?.map(convertTaskToEntity) || []
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
    id: string
): { subTree: (EntityPreviewRecursive | TaskPreviewRecursive)[]; index: number } | void => {
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
    id: string
) => {
    const res = getParentEntityByChildIdIncludingTasks(entityTree, taskTreeMap, id)
    if (!res) return

    return res.subTree[res.index]
}
