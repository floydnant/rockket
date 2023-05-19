import { interpolateParams } from '.'
import { MenuItem } from '../dropdown/drop-down/drop-down.component'
import { TaskPreview } from '../fullstack-shared-models/task.model'

export interface WrappedMenuItems extends Array<MenuItem> {
    applyOperators(...operator: ((item: MenuItem) => MenuItem)[]): WrappedMenuItems
}
const getOperatorApplier = (items: MenuItem[]) => {
    return (...operators: ((item: MenuItem) => MenuItem)[]): WrappedMenuItems => {
        const result = items.map(item => {
            return operators.reduce((prevMapperResult, operator) => operator(prevMapperResult), item)
        })
        return wrapMenuItems(result)
    }
}

/** Used to apply operators sequentially per iteration, instead of iterating over all menu items for each operator.
 * Though it is unnecessary to use `applyOperators` for only one operator.
 */
export const wrapMenuItems = (items: MenuItem[]): WrappedMenuItems => {
    return Object.assign(items, { applyOperators: getOperatorApplier(items) })
}

/** Used to update items on the fly. The callback is also recursively applied to children. */
export const interceptItem = (callback: (item: MenuItem) => Partial<Omit<MenuItem, 'children'>>) => {
    return (item: MenuItem): MenuItem => {
        if (item.isSeperator) return item
        return {
            ...item,
            ...callback(item),
            // we cannot use optional chaining syntax here, because cypress->webpack complains
            children: item.children && item.children.map(interceptItem(callback)),
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
export const useDataForAction = (data: unknown) => {
    return interceptItem(({ action }) => ({
        action: action && ((localData: unknown) => action(localData || data)),
    }))
}

/** Used to transform the data when the action is called. */
export const interceptDataForAction = (callback: (data: unknown) => unknown) => {
    return interceptItem(({ action }) => ({
        action: action && ((localData: unknown) => action(callback(localData))),
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
export const useParamsForRoute = (params: Record<string, string | number>) => {
    return interceptItem(({ route }) => ({
        route: route && interpolateParams(route, params),
    }))
}

/** Used to take a tasks status and set the respective status-item as `isActive` */
export const useTaskForActiveStatus = (task: Pick<TaskPreview, 'status'>) => {
    return (taskStatusItem: MenuItem): MenuItem => ({
        ...taskStatusItem,
        // @TODO: this will break once the icon is not equl to the status anymore
        isActive: task.status == taskStatusItem.icon,
    })
}
/** Used to take a tasks priority and set the respective priority-item as `isActive` */
export const useTaskForActivePriority = (task: Pick<TaskPreview, 'priority'>) => {
    return (taskPriorityItem: MenuItem): MenuItem => ({
        ...taskPriorityItem,
        // @TODO: this will break once the icon is not equl to the status anymore
        isActive: task.priority == taskPriorityItem.icon,
    })
}
/** Used to take a tasks status and priority and set the respective status/priority-items as `isActive` */
export const useTaskForActiveItems = (task: Pick<TaskPreview, 'status' | 'priority'>) => {
    return (item: MenuItem): MenuItem => {
        // define mappers for the children of specific items
        const machine = {
            Status: useTaskForActiveStatus,
            Priority: useTaskForActivePriority,
        }
        const mapper = !item.title ? null : machine[item.title as keyof typeof machine]

        if (!mapper) return item

        return {
            ...item,
            children: item.children && item.children.map(mapper(task)),
        }
    }
}
