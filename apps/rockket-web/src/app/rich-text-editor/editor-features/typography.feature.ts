import Typography from '@tiptap/extension-typography'
import { EditorFeature, EditorFeatureId } from '../editor.types'

export const typographyFeature: EditorFeature = {
    featureId: EditorFeatureId.Typography,
    extensions: [
        Typography.configure({
            emDash: false,
            // ellipsis ??
            openDoubleQuote: false,
            closeDoubleQuote: false,
            openSingleQuote: false,
            closeSingleQuote: false,
            notEqual: false,
        }),
    ],
}
