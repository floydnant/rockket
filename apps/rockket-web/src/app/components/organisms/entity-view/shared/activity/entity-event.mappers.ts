import { EntityEvent, EntityEventType } from '@rockket/commons'
import { TaskPriorityEventComponent } from './event-views/task-priority-event.component'
import { TaskStatusEventComponent } from './event-views/task-status-event.component'
import { TimelineEntry } from '../../../../molecules/timeline/timeline.component'
import { TaskDeadlineEventComponent } from './event-views/task-deadline-event.component'
import { TitleChangedEventComponent } from './event-views/title-changed-event.component'

export const entityEventToTimelineEntryMapperMap = {
    [EntityEventType.TitleChanged]: event => ({
        title: `Title changed`,
        icon: 'editor.text',
        timestamp: event.timestamp,
        component: TitleChangedEventComponent,
        viewData: event,
    }),
    [EntityEventType.ListParentListChanged]: event => ({
        title: `Parent list changed`,
        description: `${event.metaData.prevValue || 'None'} → ${event.metaData.newValue || 'None'}`,
        timestamp: event.timestamp,
        icon: 'DISCARDED',
    }),
    [EntityEventType.TaskParentListChanged]: event => ({
        title: `Parent list changed`,
        // @TODO: Add proper visual representation
        timestamp: event.timestamp,
        description: `${event.metaData.prevValue} → ${event.metaData.newValue}`,
        // @TODO: Add proper icon, how bout `fa-project-diagram`, `fa-sitemap`, `fa-folder-tree` or `fa-network-wired`?
        icon: 'DISCARDED',
    }),
    [EntityEventType.TaskParentTaskChanged]: event => ({
        title: `Parent task changed`,
        // @TODO: Add proper visual representation
        timestamp: event.timestamp,
        description: `${event.metaData.prevValue || 'None'} → ${event.metaData.newValue || 'None'}`,
        // @TODO: Add proper icon
        icon: 'DISCARDED',
    }),
    [EntityEventType.TaskPriorityChanged]: event => ({
        title: `Priority changed`,
        icon: 'priority',
        timestamp: event.timestamp,
        component: TaskPriorityEventComponent,
        viewData: event,
    }),
    [EntityEventType.TaskStatusChanged]: event => ({
        title: `Status changed`,
        icon: 'status',
        timestamp: event.timestamp,
        component: TaskStatusEventComponent,
        viewData: event,
    }),
    [EntityEventType.TaskDeadlineChanged]: event => ({
        title: `Deadline changed`,
        icon: 'deadline',
        timestamp: event.timestamp,
        component: TaskDeadlineEventComponent,
        viewData: event,
    }),
} satisfies {
    [K in EntityEvent as K['type']]: (event: K) => TimelineEntry
} as Record<EntityEventType, (event: EntityEvent) => TimelineEntry>
