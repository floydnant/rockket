import { Document } from '@tiptap/extension-document'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { Text } from '@tiptap/extension-text'
import { EditorFeature, EditorFeatureId } from '../editor.types'

export const baseFeature: EditorFeature = {
    featureId: EditorFeatureId.Base,
    extensions: [Document, Text, Dropcursor, Gapcursor],
}
