import { z } from 'zod'
import { pickFromObj, ValueOf } from '../utils'
import { EntityEventType } from './entity-event.schemas'

export const TaskEventType = pickFromObj(EntityEventType, [
    'TitleChanged',

    'TaskParentListChanged',
    'TaskParentTaskChanged',

    'TaskStatusChanged',
    'TaskPriorityChanged',
    'TaskDeadlineChanged',
])
export type TaskEventType = ValueOf<typeof TaskEventType>
export const taskEventTypeSchema = z.nativeEnum(TaskEventType)
