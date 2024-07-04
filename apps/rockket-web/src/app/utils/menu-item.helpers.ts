import { Task } from '@rockket/commons'
import { interpolateParams } from '.'
import { MenuItem } from '../dropdown/drop-down/drop-down.component'
import { Type } from '@angular/core'

export interface WrappedMenuItems<T> extends Array<MenuItem<T>> {
    applyOperators(...operator: ((item: MenuItem<T>) => MenuItem<T>)[]): WrappedMenuItems<T>
}
const getOperatorApplier = <T>(items: MenuItem<T>[]) => {
    return (...operators: ((item: MenuItem<T>) => MenuItem<T>)[]): WrappedMenuItems<T> => {
        const result = items.map(item => {
            return operators.reduce((prevMapperResult, operator) => operator(prevMapperResult), item)
        })
        return wrapMenuItems(result)
    }
}

export const isChildrenMenuItems = (children: MenuItem['children']): children is MenuItem[] => {
    return Array.isArray(children)
}
export const childrenAsItems = (children: MenuItem['children']): MenuItem[] | undefined => {
    return isChildrenMenuItems(children) ? children : undefined
}
export const isChildrenComponent = (children: MenuItem['children']): children is Type<unknown> => {
    return Boolean(children) && !Array.isArray(children)
}
export const childrenAsComponent = (children: MenuItem['children']): Type<unknown> | undefined => {
    return isChildrenComponent(children) ? children : undefined
}

/** Used to apply operators sequentially per iteration, instead of iterating over all menu items for each operator.
 * Though it is unnecessary to use `applyOperators` for only one operator.
 */
export const wrapMenuItems = <T>(items: MenuItem<T>[]): WrappedMenuItems<T> => {
    return Object.assign(items, { applyOperators: getOperatorApplier(items) })
}

/** Used to update items on the fly. The callback is also recursively applied to children. */
export const interceptItem = <T>(callback: (item: MenuItem<T>) => Partial<Omit<MenuItem<T>, 'children'>>) => {
    return (item: MenuItem<T>): MenuItem<T> => {
        if (item.isSeparator) return item
        return {
            ...item,
            ...callback(item),
            // We cannot use optional chaining syntax here, because cypress->webpack complains
            children: isChildrenMenuItems(item.children)
                ? item.children.map(interceptItem(callback))
                : item.children,
        }
    }
}

/** Used to inject parameters into actions.
 *
 * **NOTE:** If there is a parameter given later, that will be used instead. see example below.
 *
 * For example, if your action accepts a parameter like this:
 * ```ts
 * action: (data: { id: string }) => ...
 * ```
 * you can inject parameters like this:
 * ```ts
 * items.map(useDataForAction({ id: 'foo' }))
 * ```
 * But when the action is later called with a parameter like this, that will be used instead.
 * ```ts
 * action({ id: 'bar' }) // will take precedence over injected parameters
 * ```
 */
export const useDataForAction = <T>(data: T) => {
    return interceptItem<T>(({ action, isActive }) => ({
        action: action && ((localData: T) => action(localData || data)),
        isActive: typeof isActive === 'function' ? (localData: T) => isActive(localData || data) : isActive,
    }))
}

/** Used to transform the data when the action is called. */
export const interceptDataForAction = <T>(callback: (data: T) => T) => {
    return interceptItem<T>(({ action, isActive }) => ({
        action: action && ((localData: T) => action(callback(localData))),
        isActive: typeof isActive === 'function' ? (localData: T) => isActive(callback(localData)) : isActive,
    }))
}

/** Use this to inject parameters into routes.
 *
 * For example, if your route is `/route/to/:id`, you can use it like this:
 * ```ts
 * items.map(useParamsForRoute({ id: 'foo' }))
 * ```
 * and the resulting route will look like this `/route/to/foo`
 */
export const useParamsForRoute = <T>(params: Record<string, string | number>) => {
    return interceptItem<T>(({ route }) => ({
        route: route && interpolateParams(route, params),
    }))
}

/** Used to take a tasks status and set the respective status-item as `isActive` */
export const useTaskForActiveStatus = (task: Pick<Task, 'status'>) => {
    return (taskStatusItem: MenuItem): MenuItem => ({
        ...taskStatusItem,
        // @TODO: this will break once the icon is not equl to the status anymore
        isActive: task.status == taskStatusItem.icon,
    })
}
/** Used to take a tasks priority and set the respective priority-item as `isActive` */
export const useTaskForActivePriority = (task: Pick<Task, 'priority'>) => {
    return (taskPriorityItem: MenuItem): MenuItem => ({
        ...taskPriorityItem,
        // @TODO: this will break once the icon is not equl to the status anymore
        isActive: task.priority == taskPriorityItem.icon,
    })
}
/** Used to take a tasks status and priority and set the respective status/priority-items as `isActive` */
export const useTaskForActiveItems = (task: Pick<Task, 'status' | 'priority'>) => {
    return (item: MenuItem): MenuItem => {
        // Define mappers for the children of specific items
        const machine = {
            Status: useTaskForActiveStatus,
            Priority: useTaskForActivePriority,
        }
        const mapper = !item.title ? null : machine[item.title as keyof typeof machine]

        if (!mapper) return item

        return {
            ...item,
            children: isChildrenMenuItems(item.children) ? item.children.map(mapper(task)) : item.children,
        }
    }
}
