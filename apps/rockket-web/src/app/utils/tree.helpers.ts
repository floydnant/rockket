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
