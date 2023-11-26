import { Store } from '@ngrx/store'
import { MenuItem, MenuItemVariant } from '../dropdown/drop-down/drop-down.component'
import { EntityType } from '../fullstack-shared-models/entities.model'
import { TaskPriority, TaskStatus } from '../fullstack-shared-models/task.model'
import { EntityCrudDto } from '../services/entities.service'
import { AppState } from '../store'
import { entitiesActions } from '../store/entities/entities.actions'
import { listActions } from '../store/entities/list/list.actions'
import { taskActions } from '../store/entities/task/task.actions'
import { wrapMenuItems, WrappedMenuItems } from '../utils/menu-item.helpers'

export const getGeneralMenuItems = (store: Store<AppState>): MenuItem[] => [
    {
        title: `Rename`,
        icon: 'edit',
        action: (dto: EntityCrudDto) => store.dispatch(entitiesActions.openRenameDialog(dto)),
    },
]
export const getDangerMenuItems = (store: Store<AppState>): MenuItem[] => [
    { isSeparator: true },
    {
        title: `Delete`,
        icon: 'trash',
        variant: MenuItemVariant.DANGER,
        action: (dto: EntityCrudDto) => store.dispatch(entitiesActions.openDeleteDialog(dto)),
    },
]

export const getTaskStatusMenuItems = (store: Store<AppState>) =>
    Object.values(TaskStatus).map<MenuItem<TaskMenuItemData>>(status => ({
        title: status.replace(/_/g, ' '),
        icon: status,
        isActive: data => data.status !== status,
        action: (dto: { id: string }) => {
            store.dispatch(taskActions.updateStatus({ id: dto.id, status }))
        },
    }))
export const getTaskPriorityMenuItems = (store: Store<AppState>) =>
    Object.values(TaskPriority).map<MenuItem<TaskMenuItemData>>(priority => ({
        title: priority.replace(/_/g, ' '),
        icon: priority,
        isActive: data => data.priority !== priority,
        action: (dto: { id: string }) => {
            store.dispatch(taskActions.updatePriority({ id: dto.id, priority }))
        },
    }))

export type EntityMenuItemData = EntityCrudDto
export type TaskMenuItemData = EntityMenuItemData & {
    entityType: EntityType.TASK
    status: TaskStatus
    priority: TaskPriority
}

// @TODO: how do we make this exhaustive?
export type EntityMenuItemsMap = {
    [EntityType.TASK]: WrappedMenuItems<TaskMenuItemData>
    [EntityType.TASKLIST]: WrappedMenuItems<EntityMenuItemData>
}

export const getEntityMenuItemsMap = (store: Store<AppState>): EntityMenuItemsMap => ({
    [EntityType.TASKLIST]: wrapMenuItems<EntityMenuItemData>([
        ...getGeneralMenuItems(store),
        {
            title: 'New Inside',
            icon: 'plus',
            children: [
                {
                    title: 'Tasklist',
                    icon: EntityType.TASKLIST,
                    action: dto => store.dispatch(listActions.createTaskList({ parentListId: dto.id })),
                },
                {
                    title: 'Task',
                    icon: EntityType.TASK,
                    action: dto => store.dispatch(taskActions.create({ listId: dto.id })),
                },
            ],
        },
        {
            title: 'Duplicate',
            icon: 'clone',
            action: dto => store.dispatch(listActions.duplicateList(dto)),
        },
        {
            title: `Export`,
            icon: 'export',
            action: dto => store.dispatch(listActions.exportList(dto)),
        },
        ...getDangerMenuItems(store),
    ]),
    [EntityType.TASK]: wrapMenuItems<TaskMenuItemData>([
        {
            title: 'New Subtask',
            icon: 'plus',
            action: dto => store.dispatch(taskActions.create({ parentTaskId: dto.id })),
        },
        ...getGeneralMenuItems(store),
        {
            title: 'Open as Page',
            icon: 'expand',
            route: '/home/:id',
        },
        { isSeparator: true },
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
    ]),
})
