import { Markdown } from 'tiptap-markdown'
import { EditorFeature, EditorControlId, EditorFeatureId } from '../editor.types'

export const markdownFeature: EditorFeature = {
    featureId: EditorFeatureId.Markdown,
    extensions: [
        Markdown.extend({
            addCommands() {
                // Remove the commands as their causing some trouble and don't seem to work anyways
                // -> overridden insertContentAt() command throws when inserting a `\t` character in codeBlocks
                return {}
            },
        }).configure({
            linkify: true,
            html: true, // Allow HTML input/output
            breaks: true, // New lines (\n) in markdown input are converted to <br>
        }),
    ],
    controls: [
        {
            controlId: EditorControlId.CopyAsMarkdown,
            title: 'Copy as Markdown',
            icon: 'markdown',
            action: ({ editor, toast }) => {
                const untouched = editor.storage['markdown'].getMarkdown() as string
                const markdown = untouched.replace(/\n\n(\s|\t)*- /g, match => {
                    return match.replace(/\n\n/g, '\n')
                })

                navigator.clipboard
                    .writeText(markdown)
                    .then(() => toast.success('Copied as Markdown'))
                    .catch(e => {
                        toast.error('Could not copy to clipboard')
                        console.error('Could not copy to clipboard', e)
                    })

                return true
            },
        },
    ],
}
