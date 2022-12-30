import { Store } from '@ngrx/store'
import { MenuItem, MenuItemVariant } from '../components/molecules/drop-down/drop-down.component'
import { EntityType } from '../models/entities.model'
import { AppState } from '../store'
import { entitiesActions, listActions } from '../store/entities/entities.actions'

export type EntityMenuItemsMap = Record<EntityType, MenuItem[]>

export const getGeneralMenuItems = (store: Store<AppState>): MenuItem[] => [
    {
        title: `Rename`,
        action: (id: string) => store.dispatch(entitiesActions.openRenameDialog({ id })),
    },
]
export const getDangerMenuItems = (store: Store<AppState>): MenuItem[] => [
    { isSeperator: true },
    {
        title: `Delete`,
        variant: MenuItemVariant.DANGER,
        action: (id: string) => store.dispatch(entitiesActions.openDeleteDialog({ id })),
    },
]

export const getEntityMenuItemsMap = (store: Store<AppState>): EntityMenuItemsMap => ({
    [EntityType.TASKLIST]: [
        ...getGeneralMenuItems(store),
        {
            title: 'New inside',
            children: [
                {
                    title: 'Tasklist',
                    action: (id: string) => store.dispatch(listActions.createTaskList({ parentListId: id })),
                },
            ],
        },
        {
            title: 'Duplicate',
            action: (id: string) => store.dispatch(listActions.duplicateList({ id })),
        },
        {
            title: `Export`,
            action: (id: string) => store.dispatch(listActions.exportList({ id })),
        },
        ...getDangerMenuItems(store),
    ],
})
