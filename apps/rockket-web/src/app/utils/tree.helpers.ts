import { NOOP_GROUP_KEY } from '../components/organisms/entity-view/shared/view-settings/task-grouping-strategies'

export const filterTree = <T extends { children?: T[] | null }>(
    taskTree: T[],
    predicate: (elem: T) => boolean,
    /** This will be mutated */
    predicateMatches = { matches: 0 },
): T[] => {
    return taskTree
        .map(elem => {
            const matches = predicate(elem)
            if (matches) predicateMatches.matches++

            const children = elem.children?.length
                ? filterTree(elem.children, predicate, predicateMatches)
                : []

            return matches || children.length ? { ...elem, children, matches } : null
        })
        .filter(Boolean)
}

export type GroupedItem<
    TItem extends { children?: TItem[] | null },
    TGroupKey extends string | number | symbol,
> = TItem & { grouped: Record<TGroupKey, GroupedItem<TItem, TGroupKey>[]> }

export const groupItemsRecursive = <
    TItem extends { children?: TItem[] | null },
    TGroupKey extends string | number | symbol,
>(
    tree: TItem[],
    groupBy: (item: TItem, level: number) => TGroupKey,
    level = 0,
) => {
    const groupMap = tree.reduce((acc, item) => {
        const groupKey = groupBy(item, level)
        const mappedItem = {
            ...item,
            grouped: groupItemsRecursive(item.children || [], groupBy, level + 1),
        }

        if (!acc[groupKey]) acc[groupKey] = []
        acc[groupKey].push(mappedItem)

        return acc
    }, {} as Record<TGroupKey, GroupedItem<TItem, TGroupKey>[]>)

    return groupMap
}

export const flattenTree = <T extends { id: string; children?: T[] | null }>(
    tree: T[],
    path: string[] = [],
): (T & { path: string[] })[] => {
    return tree.flatMap(node => {
        const flatNode: T & { path: string[] } = { ...node, path }
        const subpath = [...path, node.id]

        return [flatNode, ...flattenTree(node.children || [], subpath)]
    })
}
