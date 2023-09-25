import { EditorFeatureId } from '../editor.types'
import { ChecklistCounterExtension } from './extensions/checklist-counter.extension'

export const checklistCounterFeature = (options?: Parameters<typeof ChecklistCounterExtension.configure>[0]) => ({
    featureId: EditorFeatureId.ChecklistCounter,
    extensions: [ChecklistCounterExtension.configure(options)],
})
