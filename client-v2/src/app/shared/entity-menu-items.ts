import { Store } from '@ngrx/store'
import { MenuItem, MenuItemVariant } from '../components/molecules/drop-down/drop-down.component'
import { EntityType } from '../fullstack-shared-models/entities.model'
import { TaskStatus } from '../fullstack-shared-models/task.model'
import { EntityCrudDto } from '../services/entities.service'
import { AppState } from '../store'
import { entitiesActions, listActions, taskActions } from '../store/entities/entities.actions'

export type EntityMenuItemsMap = Record<EntityType, MenuItem[]>

export const getGeneralMenuItems = (store: Store<AppState>): MenuItem[] => [
    {
        title: `Rename`,
        action: (dto: EntityCrudDto) => store.dispatch(entitiesActions.openRenameDialog(dto)),
    },
]
export const getDangerMenuItems = (store: Store<AppState>): MenuItem[] => [
    { isSeperator: true },
    {
        title: `Delete`,
        variant: MenuItemVariant.DANGER,
        action: (dto: EntityCrudDto) => store.dispatch(entitiesActions.openDeleteDialog(dto)),
    },
]

export const getTaskStatusMenuItems = (store: Store<AppState>) =>
    Object.values(TaskStatus).map<MenuItem>(status => ({
        title: status.replace(/_/g, ' '),
        icon: status,
        action: (dto: { id: string }) => {
            store.dispatch(taskActions.updateStatus({ id: dto.id, status }))
        },
    }))

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
    return (item: MenuItem): MenuItem => {
        const callbackResult = callback(item)
        return {
            ...callbackResult,
            children: item.children?.map(interceptItem(callback)),
        }
    }
}

export const getEntityMenuItemsMap = (store: Store<AppState>): EntityMenuItemsMap => ({
    [EntityType.TASKLIST]: [
        ...getGeneralMenuItems(store),
        {
            title: 'New inside',
            children: [
                {
                    title: 'Tasklist',
                    action: (dto: EntityCrudDto) =>
                        store.dispatch(listActions.createTaskList({ parentListId: dto.id })),
                },
            ],
        },
        {
            title: 'Duplicate',
            action: (dto: EntityCrudDto) => store.dispatch(listActions.duplicateList(dto)),
        },
        {
            title: `Export`,
            action: (dto: EntityCrudDto) => store.dispatch(listActions.exportList(dto)),
        },
        ...getDangerMenuItems(store),
    ],
    [EntityType.TASK]: [
        ...getGeneralMenuItems(store),
        {
            title: 'New Subtask',
            action: (dto: EntityCrudDto) => store.dispatch(taskActions.create({ parentTaskId: dto.id })),
        },
        {
            title: 'Open',
            // @TODO: this is really fuckin hacky, lets think of a better way
            route: '/home/:id',
        },
        {
            title: 'Status',
            children: getTaskStatusMenuItems(store),
        },
        // {
        //     title: 'Duplicate',
        //     action: (dto: EntityCrudDto) => store.dispatch(listActions.duplicateList(dto)),
        // },
        // {
        //     title: `Export`,
        //     action: (dto: EntityCrudDto) => store.dispatch(listActions.exportList(dto)),
        // },
        ...getDangerMenuItems(store),
    ],
})
