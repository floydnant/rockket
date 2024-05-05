import { z } from 'zod'
import { ValueOf } from '../utils'
import { pickFromObj } from '../utils/object.utils'
import { EntityEventType } from './entity-event.schemas'

export const TasklistEventType = pickFromObj(EntityEventType, ['TitleChanged', 'ListParentListChanged'])
export type TasklistEventType = ValueOf<typeof TasklistEventType>
export const tasklistEventTypeSchema = z.nativeEnum(TasklistEventType)
