import { SearchAndReplace } from './extensions/search-and-replace.extension'
import { EditorFeatureId } from '../editor.types'
import { createEditorFeature } from '../editor.helpers'

export const searchAndReplaceFeature = createEditorFeature({
    featureId: EditorFeatureId.SearchAndReplace,
    extensions: [SearchAndReplace.configure({ searchResultClass: 'highlight' })],
})
