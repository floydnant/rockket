import { interpolateParams } from '.'
import { MenuItem } from '../components/molecules/drop-down/drop-down.component'

export const useDataForAction = (data: unknown) => {
    return ({ action, children, ...item }: MenuItem): MenuItem => ({
        ...item,
        action: action ? (localData: unknown) => action(localData || data) : undefined,
        children: children?.map(useDataForAction(data)),
    })
}

export const interceptDataForAction = (callback: (data: unknown) => unknown) => {
    return ({ action, children, ...item }: MenuItem): MenuItem => ({
        ...item,
        action: action ? (localData: unknown) => action(callback(localData)) : undefined,
        children: children?.map(interceptDataForAction(callback)),
    })
}

export const interceptItem = (callback: (item: MenuItem) => MenuItem) => {
    return (item: MenuItem): MenuItem => ({
        ...callback(item),
        children: item.children?.map(interceptItem(callback)),
    })
}

export const useParamsForRoute = (params: Record<string, string | number>) => {
    return ({ route, children, ...item }: MenuItem): MenuItem => ({
        ...item,
        route: route ? interpolateParams(route, params) : undefined,
        children: children?.map(useParamsForRoute(params)),
    })
}
