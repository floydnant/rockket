import { createEditorFeature } from '../editor.helpers'
import { EditorControlId, EditorFeatureId } from '../editor.types'

export const copyAsHtmlFeature = createEditorFeature({
    featureId: EditorFeatureId.CopyAsHtml,
    extensions: [],
    controls: [
        {
            controlId: EditorControlId.CopyAsHtml,
            title: 'Copy as HTML',
            icon: 'editor.code',
            action: ({ editor, toast }) => {
                const html = editor.getHTML()
                navigator.clipboard
                    .writeText(html)
                    .then(() => toast.success('Copied as HTML'))
                    .catch(e => {
                        toast.error('Could not copy to clipboard')
                        console.error('Could not copy to clipboard', e)
                    })

                return true
            },
        },
    ],
})
