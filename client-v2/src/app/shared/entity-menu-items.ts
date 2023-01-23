import { Store } from '@ngrx/store'
import { MenuItem, MenuItemVariant } from '../components/molecules/drop-down/drop-down.component'
import { EntityType } from '../fullstack-shared-models/entities.model'
import { EntityCrudDto } from '../services/entities.service'
import { AppState } from '../store'
import { entitiesActions, listActions } from '../store/entities/entities.actions'

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
        // {
        //     title: 'New Subtask',
        //     action: (dto: EntityCrudDto) => store.dispatch(taskActions.create({ })),
        // },
        {
            title: 'Open',
            // @TODO: this is really fuckin hacky, lets think of a better way
            route: '/home/:id',
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
