import { z } from 'zod'
import { ValuesOf } from '../utils'
import { pickFromObj } from '../utils/object.utils'
import { EntityEventType } from './entity-event.schemas'

export const TasklistEventType = pickFromObj(EntityEventType, ['TitleChanged', 'ListParentListChanged'])
export type TasklistEventType = ValuesOf<typeof TasklistEventType>
export const tasklistEventTypeSchema = z.nativeEnum(TasklistEventType)
