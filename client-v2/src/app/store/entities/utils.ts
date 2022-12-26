import { TasklistPreview } from 'src/app/models/task.model'
import { EntityPreviewRecursive } from './entities.model'

export const getEntityTree = (allEntities: TasklistPreview[]) => {
    const getChildren = (childIds: string[]): EntityPreviewRecursive[] => {
        const children = allEntities.filter(entity => childIds.includes(entity.id))

        return children.map(child => {
            const grandChildren = getChildren(child.childLists)
            return { ...child, children: grandChildren }
        })
    }

    const entityTree = allEntities
        .filter(entity => !entity.parentListId)
        .map<EntityPreviewRecursive>(entity => ({ ...entity, children: getChildren(entity.childLists) }))
    return entityTree
}

export type EntityPreviewFlattend = Omit<EntityPreviewRecursive, 'children'> & {
    path: string[]
    childrenCount: number
}

export const flattenEntityTree = (lists: EntityPreviewRecursive[], path: string[] = []): EntityPreviewFlattend[] => {
    return lists.flatMap(list => {
        const { children: childLists, ...rest } = list
        const flatEntity = { ...rest, path, childrenCount: childLists.length }
        const subpath = [...path, list.id]

        return [flatEntity, ...flattenEntityTree(childLists, subpath)]
    })
}

export const traceEntity = (
    enitityTree: EntityPreviewRecursive[],
    id: string,
    trace: EntityPreviewRecursive[] = []
): EntityPreviewRecursive[] => {
    return enitityTree.flatMap(entity => {
        if (entity.id == id) return [entity]

        if (entity.children.length) {
            const subtrace = traceEntity(entity.children, id, [...trace, entity])
            if (subtrace.length) return [entity, ...subtrace]

            return []
        }

        return []
    })
}

export const getParentByChildId = (
    entityTree: EntityPreviewRecursive[],
    id: string
): { subTree: EntityPreviewRecursive[]; index: number } | void => {
    for (let index = 0; index < entityTree.length; index++) {
        const entity = entityTree[index]

        if (entity.id == id) return { subTree: entityTree, index }

        if (entity.children.length) {
            const result = getParentByChildId(entity.children, id)
            if (result) return result
        }
    }
}

export const getEntityById = (taskLists: EntityPreviewRecursive[], id: string): EntityPreviewRecursive | void => {
    const res = getParentByChildId(taskLists, id)
    if (!res) return

    return res.subTree[res.index]
}
