import { interpolateParams } from '.'
import { MenuItem } from '../components/molecules/drop-down/drop-down.component'

export const interceptItem = (callback: (item: MenuItem) => Partial<Omit<MenuItem, 'children'>>) => {
    return (item: MenuItem): MenuItem => {
        if (item.isSeperator) return item
        return {
            ...item,
            ...callback(item),
            children: item.children?.map(interceptItem(callback)),
        }
    }
}

export const useDataForAction = (data: unknown) => {
    return interceptItem(({ action }) => ({
        action: action && ((localData: unknown) => action(localData || data)),
    }))
}

export const interceptDataForAction = (callback: (data: unknown) => unknown) => {
    return interceptItem(({ action }) => ({
        action: action && ((localData: unknown) => action(callback(localData))),
    }))
}

export const useParamsForRoute = (params: Record<string, string | number>) => {
    return interceptItem(({ route }) => ({
        route: route && interpolateParams(route, params),
    }))
}

// @TODO: this should better be in a dedicated testing utils file
export const useStubsForActions = (stubMap?: Record<string, ReturnType<typeof cy.stub>>) => {
    return interceptItem(({ action, title }) => {
        const customStub = title && stubMap?.[title]
        const stub = customStub || cy.stub().as(`item:${title}`)
        return { action: action && stub }
    })
}
