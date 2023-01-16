import {
    EntityPreview,
    EntityPreviewFlattend,
    EntityPreviewRecursive,
} from 'src/app/fullstack-shared-models/entities.model'

export const buildEntityTree = (allEntities: EntityPreview[]) => {
    const getChildren = (childIds: string[]): EntityPreviewRecursive[] => {
        const children = allEntities.filter(entity => childIds.includes(entity.id))

        return children.map(({ childLists, ...child }) => {
            const grandChildren = getChildren(childLists)
            return { ...child, children: grandChildren }
        })
    }

    const entityTree = allEntities
        .filter(entity => !entity.parentListId)
        .map<EntityPreviewRecursive>(({ childLists, ...entity }) => ({
            ...entity,
            children: getChildren(childLists),
        }))
    return entityTree
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

export const getEntityById = (entityTree: EntityPreviewRecursive[], id: string): EntityPreviewRecursive | void => {
    const res = getParentByChildId(entityTree, id)
    if (!res) return

    return res.subTree[res.index]
}
