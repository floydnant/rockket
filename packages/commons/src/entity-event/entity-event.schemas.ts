import { EntityEventType as DbEntityEventType } from '@prisma/client'
import { z } from 'zod'
import { taskPriorityBackwardsCompatibleSchema } from '../task/task-priority.schemas'
import { taskStatusBackwardsCompatibleSchema } from '../task/task-status.schemas'
import { ValueOf } from '../utils'

export const EntityEventType = {
    // Any entity
    TitleChanged: 'TITLE_CHANGED',
    //
    // @TODO: Implement these
    // LabelAdded = 'LABEL_ADDED',
    // LabelRemoved = 'LABEL_REMOVED',

    // Tasklist
    ListParentListChanged: 'LIST_PARENT_LIST_CHANGED',

    // Task
    TaskParentListChanged: 'TASK_PARENT_LIST_CHANGED',
    TaskParentTaskChanged: 'TASK_PARENT_TASK_CHANGED',
    //
    TaskStatusChanged: 'TASK_STATUS_CHANGED',
    TaskPriorityChanged: 'TASK_PRIORITY_CHANGED',
    TaskDeadlineChanged: 'TASK_DEADLINE_CHANGED',
    //
    // @TODO: Implement these
    // TaskRelationToAdded = 'TASK_RELATION_TO_ADDED',
    // TaskRelationToUpdated = 'TASK_RELATION_TO_UPDATED',
    // TaskRelationToRemoved = 'TASK_RELATION_TO_REMOVED',
    //
    // TaskRelationFromAdded = 'TASK_RELATION_FROM_ADDED',
    // TaskRelationFromUpdated = 'TASK_RELATION_FROM_UPDATED',
    // TaskRelationFromRemoved = 'TASK_RELATION_FROM_REMOVED',
} as const
export type EntityEventType = ValueOf<typeof EntityEventType>
export const entityEventTypeSchema = z.nativeEnum(EntityEventType)

// This is to ensure that the `EntityEventType` is compatible with the `DbEntityEventType`
const _entityTypeAssertion = {} as Record<EntityEventType, never> satisfies Record<DbEntityEventType, never>

const baseEntityEventSchema = z.object({
    id: z.string(),
    timestamp: z.date({ coerce: true }),
    userId: z.string(),
})

// Tasks & Tasklists
export const titleChangedEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.TitleChanged),
    metaData: z.object({
        prevValue: z.string(),
        newValue: z.string(),
    }),
})

// Tasklists
export const listParentListEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.ListParentListChanged),
    metaData: z.object({
        prevValue: z.string().nullable(),
        newValue: z.string().nullable(),
    }),
})

// Tasks
export const taskParentListEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.TaskParentListChanged),
    metaData: z.object({
        prevValue: z.string(),
        newValue: z.string(),
    }),
})
export const taskParentTaskChangedEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.TaskParentTaskChanged),
    metaData: z.object({
        prevValue: z.string().nullable(),
        newValue: z.string().nullable(),
    }),
})
export const taskPriorityChangedEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.TaskPriorityChanged),
    metaData: z.object({
        prevValue: taskPriorityBackwardsCompatibleSchema,
        newValue: taskPriorityBackwardsCompatibleSchema,
    }),
})
export const taskStatusChangedEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.TaskStatusChanged),
    metaData: z.object({
        prevValue: taskStatusBackwardsCompatibleSchema,
        newValue: taskStatusBackwardsCompatibleSchema,
    }),
})
export const taskDeadlineChangedEventSchema = baseEntityEventSchema.extend({
    type: z.literal(EntityEventType.TaskDeadlineChanged),
    metaData: z.object({
        prevValue: z.date({ coerce: true }).nullable(),
        newValue: z.date({ coerce: true }).nullable(),
    }),
})

export const entityEventSchema = z.discriminatedUnion('type', [
    // Tasks & Tasklists
    titleChangedEventSchema,

    // Tasklists
    listParentListEventSchema,

    // Tasks
    taskParentListEventSchema,
    taskParentTaskChangedEventSchema,
    taskPriorityChangedEventSchema,
    taskStatusChangedEventSchema,
    taskDeadlineChangedEventSchema,
])
export type EntityEvent = z.infer<typeof entityEventSchema>

// This is to ensure that the `EntityEventType` is exhaustively matched in the `entityEventSchema` union
const _entityEventTypeAssertion = {} as Record<EntityEvent['type'], never> satisfies Record<
    EntityEventType,
    never
>

// This is to ensure that every entity event has a `metaData` object
const _entityEventMetaDataAssertion = {} as EntityEvent['metaData'] satisfies object
