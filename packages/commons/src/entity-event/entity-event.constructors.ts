import { Tasklist } from '../list/list.schema'
import { Task } from '../task'
import { newUuid } from '../utils'
import { EntityEvent, EntityEventType } from './entity-event.schemas'

export const newEntityEvent = <TEventType extends EntityEventType>(
    type: TEventType,
    metaData: Extract<EntityEvent, { type: TEventType }>['metaData'],
    userId: string,
): Extract<EntityEvent, { type: TEventType }> => {
    return {
        id: newUuid(),
        timestamp: new Date(),
        type,
        metaData,
        userId,
    } as Extract<EntityEvent, { type: TEventType }>
}

export const tryParseTitleChangedEvent = (
    existingEntity: { title: string },
    dto: { title?: string },
    userId: string,
) => {
    if (dto.title === undefined) return null
    if (dto.title == existingEntity.title) return null

    return newEntityEvent(
        EntityEventType.TitleChanged,
        {
            prevValue: existingEntity.title,
            newValue: dto.title,
        },
        userId,
    )
}
export const tryParseParentListChangedEvent = (
    existingEntity: Pick<Task, 'listId'> | Pick<Tasklist, 'parentListId'>,
    dto: Partial<Pick<Task, 'listId'>> | Partial<Pick<Tasklist, 'parentListId'>>,
    userId: string,
) => {
    // For tasklists
    if ('parentListId' in existingEntity && 'parentListId' in dto) {
        if (dto.parentListId === undefined) return null
        if (dto.parentListId == existingEntity.parentListId) return null

        return newEntityEvent(
            EntityEventType.ListParentListChanged,
            {
                prevValue: existingEntity.parentListId,
                newValue: dto.parentListId,
            },
            userId,
        )
    }

    // For tasks
    if ('listId' in existingEntity && 'listId' in dto) {
        if (dto.listId === undefined) return null
        if (dto.listId == existingEntity.listId) return null

        return newEntityEvent(
            EntityEventType.TaskParentListChanged,
            {
                prevValue: existingEntity.listId,
                newValue: dto.listId,
            },
            userId,
        )
    }

    return null
}

export const createEntityEventsBuilder = <TEventType extends EntityEventType, TArgs extends unknown[]>(
    tryParseEventsMap: Record<TEventType, (...args: TArgs) => EntityEvent | EntityEvent[] | null>,
) => {
    return (...args: TArgs): EntityEvent[] => {
        const events = [] as EntityEvent[]

        for (const eventType in tryParseEventsMap) {
            const tryParseEvents = tryParseEventsMap[eventType]
            const eventOrEvents = tryParseEvents(...args)
            if (!eventOrEvents) continue

            if (Array.isArray(eventOrEvents)) events.push(...eventOrEvents)
            else events.push(eventOrEvents)
        }

        return events
    }
}
