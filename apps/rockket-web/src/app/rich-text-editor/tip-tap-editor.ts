import { Content, Editor, EditorEvents, createDocument } from '@tiptap/core'
import { ParseOptions } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import {
    Observable,
    Subject,
    delay,
    first,
    fromEvent,
    fromEventPattern,
    map,
    merge,
    share,
    skipUntil,
    startWith,
    takeUntil,
    withLatestFrom,
} from 'rxjs'
import { CustomEditorEventsStorage } from './editor-features/custom-events.feature'
import { EditorFeatureId } from './editor.types'

interface EditorStorage {
    [EditorFeatureId.CustomEvents]?: CustomEditorEventsStorage
    [key: string]: unknown
}

export class TipTapEditor extends Editor {
    destroy$ = fromEventPattern<EditorEvents['destroy']>(
        handler => this.on('destroy', handler),
        handler => this.off('destroy', handler),
    ).pipe(first(), share({ resetOnRefCountZero: true }))

    override get storage() {
        return super.storage as EditorStorage
    }

    private getEventStream<T extends keyof EditorEvents>(eventName: T): Observable<EditorEvents[T]> {
        return fromEvent(this, eventName, e => e as EditorEvents[T]).pipe(
            takeUntil(this.destroy$),
            share({ resetOnRefCountZero: true }),
        )
    }

    // @TODO: investigate why this is emitting upon editor initialisation only in the
    // task description, and not in the full page description editors
    private updateRaw$ = this.getEventStream('update')
    selectionUpdate$ = this.getEventStream('selectionUpdate')
    transaction$ = this.getEventStream('transaction')

    focus$ = this.getEventStream('focus')
    blur$ = this.getEventStream('blur')

    private update$ = this.updateRaw$.pipe(
        map(({ editor }) => {
            const isEmpty = editor.isEmpty
            return {
                plainText: isEmpty ? '' : editor.getText().trim(),
                html: isEmpty ? '' : editor.getHTML(),
            }
        }),
        share({ resetOnRefCountZero: true }),
    )

    resetState(content: Content, parseOptions?: ParseOptions) {
        const newState = EditorState.create({
            doc: createDocument(content, this.schema, parseOptions),
            schema: this.schema,
            plugins: this.state.plugins,
        })

        this.view.updateState(newState)
    }

    bindEditor(input$: Observable<string>, searchTerm$?: Observable<string>) {
        // Cancel the previous binding
        this.unbind()
        this.commands.blur()

        input$
            .pipe(
                takeUntil(this.unbind$),
                withLatestFrom(this.update$.pipe(startWith(null))),
                map(([input, currentState], index) => ({
                    input,
                    currentState,
                    isFirst: index == 0,
                })),
            )
            .subscribe(({ input, currentState, isFirst }) => {
                if (input == currentState?.html || input == currentState?.plainText) return

                if (isFirst) {
                    this.resetState(input)
                } else {
                    this.chain().setContent(input, false).setMeta('addToHistory', false).run()
                }
            })

        searchTerm$?.pipe(takeUntil(this.unbind$)).subscribe({
            next: searchTerm => this.commands.setSearchTerm(searchTerm),
            complete: () => this.commands.setSearchTerm(''),
        })

        return {
            unbind: () => this.unbind(),
            unbind$: this.unbind$.pipe(takeUntil(this.unbind$.pipe(delay(0)))),
            update$: this.update$.pipe(
                // Skip all updates until we have populated the editor with the initial input.
                // This is needed because the editor will emit an update event when it is created
                // in some cases. (only happend in the task description editor so far, not in the full page description editor)
                skipUntil(input$),
                takeUntil(this.unbind$),
            ),
            selectionUpdate$: this.selectionUpdate$.pipe(takeUntil(this.unbind$)),
            focus$: this.focus$.pipe(takeUntil(this.unbind$)),
            blur$: this.blur$.pipe(takeUntil(this.unbind$)),
        }
    }

    private unbindTrigger$ = new Subject<void>()
    unbind$ = merge(this.unbindTrigger$, this.destroy$)
    /** Cancel input binding */
    unbind() {
        this.unbindTrigger$.next()
    }

    deselect = () => window.getSelection()?.removeAllRanges()
}
