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
