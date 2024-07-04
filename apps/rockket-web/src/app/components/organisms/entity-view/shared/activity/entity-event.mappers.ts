import { EntityEvent, EntityEventType, EntityType } from '@rockket/commons'
import { TaskPriorityEventComponent } from './event-views/task-priority-event.component'
import { TaskStatusEventComponent } from './event-views/task-status-event.component'
import { TimelineEntry } from '../../../../molecules/timeline/timeline.component'
import { TaskDeadlineEventComponent } from './event-views/task-deadline-event.component'
import { TitleChangedEventComponent } from './event-views/title-changed-event.component'
import { TaskParentTaskChangedEventComponent } from './event-views/task-parent-task-changed-event.component'
import { ParentListChangedEventComponent } from './event-views/parent-list-changed-event.component'

export const entityEventToTimelineEntryMapperMap = {
    [EntityEventType.TitleChanged]: event => ({
        title: `Title changed`,
        icon: 'editor.text',
        timestamp: event.timestamp,
        component: TitleChangedEventComponent,
        viewData: event,
    }),
    [EntityEventType.ListParentListChanged]: event => ({
        // @TODO: should these be dynamic at all? Or might a static string be better?
        title:
            event.metaData.prevValue && event.metaData.newValue
                ? `Moved to another parent list`
                : event.metaData.newValue
                ? 'Added to a parent list'
                : 'Removed from the parent list',
        component: ParentListChangedEventComponent,
        viewData: event,
        timestamp: event.timestamp,
        icon: 'parent',
    }),
    [EntityEventType.TaskParentListChanged]: event => ({
        title: `Moved to another list`,
        timestamp: event.timestamp,
        component: ParentListChangedEventComponent,
        viewData: event,
        icon: EntityType.TASKLIST,
    }),
    [EntityEventType.TaskParentTaskChanged]: event => ({
        // @TODO: should these be dynamic at all? Or might a static string be better?
        title:
            event.metaData.prevValue && event.metaData.newValue
                ? `Moved to another parent task`
                : event.metaData.newValue
                ? 'Added to a parent task'
                : 'Removed from the parent task',
        timestamp: event.timestamp,
        component: TaskParentTaskChangedEventComponent,
        viewData: event,
        icon: 'parent',
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
