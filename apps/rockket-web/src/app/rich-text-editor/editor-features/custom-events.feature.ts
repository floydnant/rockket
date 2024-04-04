import { Extension } from '@tiptap/core'
import { createEditorFeature } from '../editor.helpers'
import { EditorFeatureId } from '../editor.types'
import { Observable, Subject } from 'rxjs'

export type CustomEditorEventsStorage = {
    shouldFocusToolbar$: Observable<void>
}

export const customEventsFeature = createEditorFeature({
    featureId: EditorFeatureId.CustomEvents,
    extensions: [
        Extension.create({
            name: EditorFeatureId.CustomEvents,
            addStorage() {
                return {
                    shouldFocusToolbar$: new Subject(),
                }
            },
            addKeyboardShortcuts() {
                return {
                    'Mod-e': () => {
                        const events = this.editor.storage[
                            EditorFeatureId.CustomEvents
                        ] as CustomEditorEventsStorage
                        ;(events?.shouldFocusToolbar$ as Subject<void>).next()

                        return true
                    },
                }
            },
        }),
    ],
})
