import { Content, Editor, EditorEvents, createDocument } from '@tiptap/core'
import { ParseOptions } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import {
    Observable,
    Subject,
    delay,
    distinctUntilKeyChanged,
    filter,
    first,
    fromEvent,
    fromEventPattern,
    map,
    merge,
    share,
    takeUntil,
    withLatestFrom,
} from 'rxjs'
import { debugObserver } from 'src/app/utils/observable.helpers'
import { CustomEditorEventsStorage } from './editor-features/custom-events.feature'
import { EditorFeatureId } from './editor.types'

interface EditorStorage {
    [EditorFeatureId.CustomEvents]?: CustomEditorEventsStorage
    [key: string]: unknown
}

export class AppEditor extends Editor {
    destroy$ = fromEventPattern<EditorEvents['destroy']>(
        handler => this.on('destroy', handler),
        handler => this.off('destroy', handler)
    ).pipe(first(), share({ resetOnRefCountZero: true }))

    private unbindTrigger$ = new Subject<void>()
    unbind$ = merge(this.unbindTrigger$, this.destroy$).pipe(debugObserver('unbind$ and destroy$'))
    /** Cancel input binding */
    unbindInput() {
        this.unbindTrigger$.next()
    }

    override get storage() {
        return super.storage as EditorStorage
    }

    private getEventStream<T extends keyof EditorEvents>(eventName: T): Observable<EditorEvents[T]> {
        return fromEvent(this, eventName, e => e as EditorEvents[T]).pipe(
            takeUntil(this.destroy$),
            share({ resetOnRefCountZero: true })
        )
    }

    update$ = this.getEventStream('update')
    selectionUpdate$ = this.getEventStream('selectionUpdate')
    transaction$ = this.getEventStream('transaction')

    focus$ = this.getEventStream('focus')
    blur$ = this.getEventStream('blur')

    resetState(content: Content, parseOptions?: ParseOptions) {
        const newState = EditorState.create({
            doc: createDocument(content, this.schema, parseOptions),
            schema: this.schema,
            plugins: this.state.plugins,
        })

        this.view.updateState(newState)
    }

    bindInput(input$: Observable<string>) {
        // cancel the previous binding
        this.unbindInput()

        // input$ = from([
        //     '<p>This is content one and</p>',
        //     '<p>This is content one and each</p>',
        //     '<p>This is content one and each</p>',
        //     '<p>This is content one and each time</p>',
        //     '<p>This is content one and each time a little </p>',
        //     '<p>This is content one and each time a little more</p>',
        //     '<p>This is content one. But suddenly</p>',
        //     '<p>Gone</p>',
        // ]).pipe(concatMap(content => of(content).pipe(delay(4000))))

        const updateOnBlur$ = merge(this.blur$, this.unbind$).pipe(
            map(() => (this.isEmpty ? '' : this.getHTML())),
            withLatestFrom(input$),
            filter(([currentState, lastInput]) => currentState != lastInput),
            distinctUntilKeyChanged(0),
            map(([currentState]) => currentState),
            takeUntil(this.unbind$),
            debugObserver('updateOnBlur$'),
            share({ resetOnRefCountZero: true })
        )

        input$
            .pipe(
                takeUntil(this.unbind$),
                map((input, index) => ({
                    input,
                    currentState: this.isEmpty ? '' : this.getHTML(),
                    isFirst: index == 0,
                }))
            )
            .subscribe(({ input, currentState, isFirst }) => {
                if (input == currentState) return

                if (isFirst) this.resetState(input)
                else this.chain().setContent(input, false).setMeta('addToHistory', false).run()
            })

        return {
            unbindInput: this.unbindInput.bind(this),
            unbind$: this.unbind$.pipe(takeUntil(this.unbind$.pipe(delay(0)))),
            update$: this.update$.pipe(takeUntil(this.unbind$)),
            updateOnBlur$,
            selectionUpdate$: this.selectionUpdate$.pipe(takeUntil(this.unbind$)),
            focus$: this.focus$.pipe(takeUntil(this.unbind$)),
            blur$: this.blur$.pipe(takeUntil(this.unbind$)),
        }
    }
    // bindInput_(input$: Observable<string>) {
    //     // cancel the previous binding
    //     this.unbind$.next(null)

    //     // @TODO: test this
    //     const unbind$ = merge(this.unbind$, this.destroy$).pipe(debugObserver('unbind$ and destroy$'))

    //     // @TODO: lets add a bit of throttling here and add an isEmpty
    //     const update$ = this.update$.pipe(
    //         takeUntil(this.destroy$),
    //         takeUntil(unbind$),
    //         // map(({ editor }) => (editor.isEmpty ? '' : editor.getHTML())),
    //         map(({ editor }) => '<NOOP>'),
    //         debugObserver('update$'),
    //         share({ resetOnRefCountZero: true })
    //     )

    //     input$
    //         .pipe(
    //             takeUntil(unbind$),
    //             withLatestFrom(update$.pipe(startWith(null))),
    //             map(([input, lastOutput], index) => ({
    //                 input,
    //                 lastOutput,
    //                 isFirst: index == 0,
    //             }))
    //         )
    //         .subscribe(({ input, lastOutput, isFirst }) => {
    //             if (input === lastOutput) return

    //             if (isFirst) this.resetState(input)
    //             else {
    //                 this.chain().setContent(input, false).setMeta('addToHistory', false).run()
    //             }
    //         })

    //     return {
    //         editor: this,
    //         unbind: () => this.unbind$.next(null),
    //         onUnbind$: unbind$.pipe(takeUntil(unbind$.pipe(delay(0)))),
    //         onUpdate$: update$,
    //         onSelectionUpdate$: this.selectionUpdate$.pipe(takeUntil(unbind$)),
    //         // onFocusChange$: this.isFocused$.pipe(takeUntil(unbind$)),
    //         onFocus$: this.focus$.pipe(takeUntil(unbind$)),
    //         onBlur$: this.blur$.pipe(takeUntil(unbind$)),
    //     }
    // }

    deselect = () => window.getSelection()?.removeAllRanges()
}
