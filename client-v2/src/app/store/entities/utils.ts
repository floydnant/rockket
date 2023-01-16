import {
    EntityPreview,
    EntityPreviewFlattend,
    EntityPreviewRecursive,
} from 'src/app/fullstack-shared-models/entities.model'

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

export const getParentEntityByChildId = (
    entityTree: EntityPreviewRecursive[],
    id: string
): { subTree: EntityPreviewRecursive[]; index: number } | void => {
    for (let index = 0; index < entityTree.length; index++) {
        const entity = entityTree[index]

        if (entity.id == id) return { subTree: entityTree, index }

        if (entity.children.length) {
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
