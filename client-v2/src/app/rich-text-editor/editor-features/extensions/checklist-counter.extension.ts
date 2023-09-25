import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { mediaQueries } from 'src/app/services/device.service'
import { colors } from 'src/app/shared/colors'
import { ChecklistCount, countChecklistItems } from '../../helpers'
import { EditorState } from 'prosemirror-state'

const getCircumferenceOffset = (radius: number, progress: number) => {
    const circumference = radius * 2 * Math.PI
    return circumference - (progress / 100) * circumference
}

const createCircularProgressSvg = (props: {
    progress: number
    diameter?: number
    strokeWidth?: number
    color?: string
    bgColor?: string
    transitionDuration?: string
}) => {
    const diameter = props.diameter || 22
    const position = diameter / 2
    const strokeWidth = props.strokeWidth || 2.5
    const radius = diameter / 2 - strokeWidth * 2
    const circumference = radius * 2 * Math.PI
    const offset = getCircumferenceOffset(radius, props.progress)

    return `
        <svg
            height="${diameter}"
            width="${diameter}"
        >
            <style>
                .progress-ring {
                    transition: stroke-dashoffset ${props.transitionDuration || '0.4s'};
                    transform: rotate(-90deg);
                    transform-origin: 50% 50%;
                    stroke-linecap: round;
                }
                /* @TODO: we need to update the background color when inside a hovered task */
            </style>
            <circle
                class="progress-bg"
                stroke-width="${strokeWidth}"
                stroke="${props.bgColor || colors.tinted[600]}"
                fill="transparent"
                r="${radius}"
                cx="${position}"
                cy="${position}"
            />
            <circle
                class="progress-ring"
                stroke-width="${strokeWidth}"
                stroke="${props.color || colors.submit[400]}"
                stroke-dasharray="${circumference} ${circumference}"
                stroke-dashoffset="${offset}"
                fill="transparent"
                r="${radius}"
                cx="${position}"
                cy="${position}"
            />
        </svg>
    `
}

const getFractionTemplate = (checklistCount: ChecklistCount) => `
    ${checklistCount.checkedItems}
    <span class="fraction-line opacity-60">/</span>
    ${checklistCount.totalItems}
`

export interface CounterWidgetProps {
    widgetId: string
    checklistCount: ChecklistCount
    /** Wether to apply styles for making the container sticky */
    sticky?: boolean
    style?: Partial<HTMLDivElement['style']> | false
    overrideStyles?: boolean
}
export interface CounterWidgetCreateProps extends CounterWidgetProps {
    withLabel?: boolean
}

const COUNTER_COMPLETE_CLASS = 'counter-complete'

export const createCounterWidget = ({
    widgetId,
    checklistCount,
    sticky = true,
    style = {},
    overrideStyles = false,
    withLabel = true,
}: CounterWidgetCreateProps) => {
    const container = document.createElement('div')
    container.classList.add('checklist-counter')
    container.id = widgetId
    if (checklistCount.progress == 100) container.classList.add(COUNTER_COMPLETE_CLASS)

    if (sticky) {
        container.style.zIndex = '10'
        container.style.top = '.5rem'
        container.style.position = 'sticky'
    }

    if (style && !overrideStyles) {
        container.classList.add('app-toolbar')
        container.style.marginBottom = '.5rem'
        container.style.width = 'fit-content'
        container.style.paddingLeft = '.5rem'
        container.style.paddingRight = '.5rem'

        if (checklistCount.progress == 100) {
            container.style.backgroundColor = colors.submit[800]
            container.style.borderColor = colors.submit[700]
            container.style.color = colors.submit[500]
        }
    }
    if (typeof style == 'object') Object.assign(container.style, style)

    // @TODO: Accessibility: update semantics and roles here
    container.innerHTML = `
        ${!withLabel ? '' : '<span class="label | opacity-80">Checklist:</span>'}
        <span class="count">${getFractionTemplate(checklistCount)}</span>
        <div class="progress | ml-px -mr-[.2rem] ${checklistCount.progress ? '' : 'hidden'}">
            ${createCircularProgressSvg(checklistCount)}
        </div>
    `
    return container
}

export const updateCounterWidget = ({
    widgetId,
    checklistCount,
    sticky = true,
    style = {},
    overrideStyles = false,
}: CounterWidgetProps) => {
    const container = document.getElementById(widgetId)
    if (!container) return

    if (checklistCount.progress == 100) container.classList.add(COUNTER_COMPLETE_CLASS)
    else container.classList.remove(COUNTER_COMPLETE_CLASS)

    if (sticky) {
        container.style.zIndex = '10'
        container.style.top = '.5rem'
        container.style.position = 'sticky'
    } else {
        container.style.zIndex = ''
        container.style.top = ''
        container.style.position = ''
    }

    if (style && !overrideStyles) {
        if (checklistCount.progress == 100) {
            container.style.backgroundColor = colors.submit[800]
            container.style.borderColor = colors.submit[700]
            container.style.color = colors.submit[500]
        } else {
            container.style.backgroundColor = ''
            container.style.borderColor = ''
            container.style.color = ''
        }
    }
    if (typeof style == 'object') Object.assign(container.style, style)

    const countElem = container.querySelector('.count')
    if (!countElem) return
    countElem.innerHTML = getFractionTemplate(checklistCount)

    const progressElem = container.querySelector('.progress') as HTMLDivElement | null
    if (!progressElem) return
    if (!checklistCount.progress) progressElem.classList.add('hidden')
    else progressElem.classList.remove('hidden')

    const progressRing = container.querySelector('circle.progress-ring') as SVGCircleElement | null
    if (!progressRing) return
    const radius = progressRing.r.baseVal.value
    progressRing.style.strokeDashoffset = getCircumferenceOffset(radius, checklistCount.progress).toString()
}

const createCounterDecoration = (doc: EditorState['doc'], props: CounterWidgetCreateProps) => {
    if (!props.checklistCount.totalItems) return null

    return DecorationSet.create(doc, [Decoration.widget(0, () => createCounterWidget(props))])
}

export const ChecklistCounterExtension = Extension.create<Pick<CounterWidgetProps, 'sticky' | 'style'>>({
    name: 'checklistCounter',

    addProseMirrorPlugins() {
        type PluginState = {
            decorationSet: DecorationSet | null
            widgetId: string
        }
        const pluginKey = new PluginKey<PluginState>('checklistCounter')

        return [
            new Plugin<PluginState>({
                key: pluginKey,
                props: {
                    decorations: state => pluginKey.getState(state)?.decorationSet,
                },
                state: {
                    init: (_stateConfig, state) => {
                        const widgetId =
                            'checklistProgressDecoration' + (Math.random() * 100).toString().replace('.', '')
                        return {
                            widgetId,
                            decorationSet: createCounterDecoration(state.doc, {
                                widgetId,
                                checklistCount: countChecklistItems(state.doc),
                                sticky: !matchMedia(mediaQueries.mobileScreen).matches,
                                ...this.options,
                            }),
                        }
                    },
                    apply: (tr, prevPluginState, _prevState, newState) => {
                        if (!tr.docChanged) return prevPluginState

                        const checklistCount = countChecklistItems(newState.doc)
                        if (prevPluginState.decorationSet && !checklistCount.totalItems)
                            return {
                                widgetId: prevPluginState.widgetId,
                                decorationSet: null,
                            }

                        const props: CounterWidgetProps = {
                            widgetId: prevPluginState.widgetId,
                            checklistCount,
                            sticky: !matchMedia(mediaQueries.mobileScreen).matches,
                            ...this.options,
                        }

                        if (!prevPluginState.decorationSet && checklistCount.totalItems)
                            return {
                                widgetId: prevPluginState.widgetId,
                                decorationSet: createCounterDecoration(newState.doc, props),
                            }

                        updateCounterWidget(props)

                        return prevPluginState
                    },
                },
            }),
        ]
    },
})
