import { z } from 'zod'
import { pickFromObj, ValuesOf } from '../utils'
import { EntityEventType } from './entity-event.schemas'

export const TaskEventType = pickFromObj(EntityEventType, [
    'TitleChanged',

    'TaskParentListChanged',
    'TaskParentTaskChanged',

    'TaskStatusChanged',
    'TaskPriorityChanged',
    'TaskDeadlineChanged',
])
export type TaskEventType = ValuesOf<typeof TaskEventType>
export const taskEventTypeSchema = z.nativeEnum(TaskEventType)
