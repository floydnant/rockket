import { EntityPreviewRecursive, EntityType } from 'src/app/models/entities.model'
import { TasklistDetail } from 'src/app/models/list.model'
import { TaskPreview } from 'src/app/models/task.model'

export interface EntitiesState {
    entityTree: EntityPreviewRecursive[] | null
    /** Mapped to their tasklist */
    taskTreeMap: Record<string, TaskPreview[]> | null // @TODO: should be tht recursive version

    [EntityType.TASKLIST]: Record<string, TasklistDetail> | null
    // @TODO: This makes more sense
    // details: {
    //     [EntityType.TASKLIST]: Record<string, TasklistDetail> | null
    // }
}
