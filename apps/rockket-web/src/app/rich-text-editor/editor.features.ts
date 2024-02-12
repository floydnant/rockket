import { InjectionToken, inject } from '@angular/core'
import { baseFeature } from './editor-features/base.feature'
import { blocksFeature } from './editor-features/blocks.feature'
import { blurFeature } from './editor-features/blur.feature'
import { checklistCounterFeature } from './editor-features/checklist-counter.feature'
import { customEventsFeature } from './editor-features/custom-events.feature'
import { historyFeature } from './editor-features/history.feature'
import { indentationFeature } from './editor-features/indentation.feature'
import { inlineFeature } from './editor-features/inline.feature'
import { linkFeature } from './editor-features/link.feature'
import { markdownFeature } from './editor-features/markdown.feature'
import { placeholderFeature } from './editor-features/placeholder.feature'
import { typographyFeature } from './editor-features/typography.feature'
import { EditorControlId, EditorFeature, EditorFeatureId, EditorLayoutItem, separator } from './editor.types'
import { createEditorFeature } from './editor.helpers'
import { searchAndReplaceFeature } from './editor-features/search-and-replace.feature'

const moreMenuFeature = createEditorFeature({
    featureId: EditorFeatureId.MoreMenu,
    extensions: [],
    controls: [
        {
            controlId: EditorControlId.More,
            title: 'More',
            icon: 'ellipsisHorizontal',
            fixedWith: '2.75rem',
        },
    ],
})

export const defaultFeatureMap = {
    baseFeature,
    historyFeature,
    inlineFeature,
    linkFeature,
    blocksFeature,
    placeholderFeature: placeholderFeature('Description'),
    typographyFeature,
    blurFeature,
    indentationFeature,
    markdownFeature,
    moreMenuFeature,
    customEventsFeature,
    checklistCounterFeature: checklistCounterFeature(),
    searchAndReplaceFeature,
} satisfies Record<string, EditorFeature>
const defaultFeatureMask = Object.fromEntries(Object.keys(defaultFeatureMap).map(key => [key, true]))

// @TODO: can be made more generic -> `getEditorFeatureGroup(featureMap)(featureMask) => EditorFeature[]`
export const getDefaultEditorFeatures = (
    featureMask: Partial<Record<keyof typeof defaultFeatureMap, boolean>> = {},
): EditorFeature[] => {
    return Object.entries({ ...defaultFeatureMask, ...featureMask })
        .map<EditorFeature | undefined>(([key, enabled]) => {
            if (!enabled) return
            return defaultFeatureMap[key as keyof typeof defaultFeatureMap]
        })
        .filter(Boolean) as EditorFeature[]
}

export const defaultDesktopEditorLayout: EditorLayoutItem[] = [
    ...blocksFeature.layout,
    separator,
    ...inlineFeature.layout,
    EditorControlId.Link,
    separator,
    {
        controlId: EditorControlId.More,
        dropdown: [
            EditorControlId.Undo,
            EditorControlId.Redo,
            separator,
            EditorControlId.Indent,
            EditorControlId.Outdent,
            separator,
            EditorControlId.CopyAsMarkdown,
        ],
    },
    blurFeature.layout[0],
]
export const defaultMobileEditorLayout: EditorLayoutItem[] = [
    ...blocksFeature.layout,
    separator,
    ...inlineFeature.layout,
    EditorControlId.Link,
    separator,
    EditorControlId.Undo,
    EditorControlId.Redo,
    separator,
    EditorControlId.Indent,
    EditorControlId.Outdent,
    separator,
    {
        controlId: EditorControlId.More,
        dropdown: [EditorControlId.CopyAsMarkdown],
    },
]

export const getDefaultEditorLayout = (isTouchPrimary: boolean) => {
    return isTouchPrimary ? defaultMobileEditorLayout : defaultDesktopEditorLayout
}

export const EDITOR_FEATURES_TOKEN = new InjectionToken<EditorFeature[]>('Editor Features Injector')
export const provideEditorFeatures = (features: EditorFeature[]) => ({
    provide: EDITOR_FEATURES_TOKEN,
    useValue: features,
})
export const injectEditorFeatures = () => inject(EDITOR_FEATURES_TOKEN)
