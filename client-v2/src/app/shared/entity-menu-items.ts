import { Store } from '@ngrx/store'
import { MenuItem, MenuItemVariant } from '../components/molecules/drop-down/drop-down.component'
import { EntityType } from '../fullstack-shared-models/entities.model'
import { TaskPriority, TaskStatus } from '../fullstack-shared-models/task.model'
import { EntityCrudDto } from '../services/entities.service'
import { AppState } from '../store'
import { entitiesActions } from '../store/entities/entities.actions'
import { listActions } from '../store/entities/list/list.actions'
import { taskActions } from '../store/entities/task/task.actions'

export const getGeneralMenuItems = (store: Store<AppState>): MenuItem[] => [
    {
        title: `Rename`,
        icon: 'edit',
        action: (dto: EntityCrudDto) => store.dispatch(entitiesActions.openRenameDialog(dto)),
    },
]
export const getDangerMenuItems = (store: Store<AppState>): MenuItem[] => [
    { isSeperator: true },
    {
        title: `Delete`,
        icon: 'trash',
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
export const getTaskPriorityMenuItems = (store: Store<AppState>) =>
    Object.values(TaskPriority).map<MenuItem>(priority => ({
        title: priority.replace(/_/g, ' '),
        icon: priority,
        action: (dto: { id: string }) => {
            store.dispatch(taskActions.updatePriority({ id: dto.id, priority }))
        },
    }))

export type EntityMenuItemsMap = Record<EntityType, MenuItem[]>

export const getEntityMenuItemsMap = (store: Store<AppState>): EntityMenuItemsMap => ({
    [EntityType.TASKLIST]: [
        ...getGeneralMenuItems(store),
        {
            title: 'New inside',
            icon: 'plus',
            children: [
                {
                    title: 'Tasklist',
                    icon: EntityType.TASKLIST,
                    action: (dto: EntityCrudDto) =>
                        store.dispatch(listActions.createTaskList({ parentListId: dto.id })),
                },
            ],
        },
        {
            title: 'Duplicate',
            icon: 'clone',
            action: (dto: EntityCrudDto) => store.dispatch(listActions.duplicateList(dto)),
        },
        {
            title: `Export`,
            icon: 'export',
            action: (dto: EntityCrudDto) => store.dispatch(listActions.exportList(dto)),
        },
        ...getDangerMenuItems(store),
    ],
    [EntityType.TASK]: [
        {
            title: 'New Subtask',
            icon: 'plus',
            action: (dto: EntityCrudDto) => store.dispatch(taskActions.create({ parentTaskId: dto.id })),
        },
        ...getGeneralMenuItems(store),
        {
            title: 'Open as page',
            icon: 'expand',
            route: '/home/:id',
        },
        {
            title: 'Status',
            icon: 'status',
            children: getTaskStatusMenuItems(store),
        },
        {
            title: 'Priority',
            icon: 'priority',
            children: getTaskPriorityMenuItems(store),
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
