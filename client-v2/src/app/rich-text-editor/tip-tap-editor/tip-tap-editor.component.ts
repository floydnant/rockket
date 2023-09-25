import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation,
} from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    Observable,
    Subject,
    delay,
    distinctUntilKeyChanged,
    filter,
    map,
    merge,
    mergeWith,
    share,
    shareReplay,
    skip,
    startWith,
    switchMap,
    takeUntil,
    tap,
    timer,
    withLatestFrom,
} from 'rxjs'
import { debugObserver } from 'src/app/utils/observable.helpers'
import { AppEditor } from '../app-editor'
import { EditorFeature } from '../editor.types'
import { EDITOR_FEATURES_TOKEN } from '../features'
import { isTaskItem } from '../helpers'

@UntilDestroy()
@Component({
    selector: 'app-tt-editor',
    templateUrl: './tip-tap-editor.component.html',
    styleUrls: ['./tip-tap-editor.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'block',
    },
})
export class TipTapEditorComponent implements OnDestroy {
    constructor(@Inject(EDITOR_FEATURES_TOKEN) public features: EditorFeature[]) {}

    ngOnDestroy(): void {
        this.editor?.destroy()
    }

    @Input() set editable(editable: boolean) {
        this.editor?.setEditable(editable)
    }
    get editable() {
        return this.editor?.isEditable ?? true
    }

    private searchTerm: string | null = null
    @Input('searchTerm') set searchTerm_(searchTerm: string | null) {
        this.searchTerm = searchTerm
        if (searchTerm) this.editor?.commands.setSearchTerm(searchTerm)
    }

    editor = new AppEditor({
        editable: this.editable,
        extensions: this.features.flatMap(feature => feature.extensions),

        onDestroy: () => this.unbind$.next(null),
    })

    private focusStateInput$ = new Subject<boolean>()
    updateFocusState(isFocused: boolean) {
        this.focusStateInput$.next(isFocused)
    }

    @Output() focus$ = this.editor.focus$.pipe(map(({ event }) => event))
    @Output('blur') blur$ = this.editor.blur$.pipe(
        filter(({ event }) => {
            const clickedElem = event.relatedTarget as HTMLElement | undefined

            // check if a control from the toolbar was clicked
            const isControlClicked =
                clickedElem?.className?.includes('format-control-item') ||
                clickedElem?.className?.includes('format-controls-container') ||
                clickedElem?.className?.includes('keep-editor-focus') ||
                clickedElem?.parentElement?.className?.includes('format-controls-container') ||
                clickedElem?.parentElement?.className?.includes('keep-editor-focus')
            if (isControlClicked) return false

            // check if a task item was clicked (only inside the current editor)
            if (isTaskItem(clickedElem) && this.editor.view.dom.contains(clickedElem as Node)) return false

            // -> Its good to explicitly allow elems as instead of blindly ignoring everything from inside the editor

            return true
        }),
        tap(() => this.editor.deselect()),
        map(({ event }) => event),
        mergeWith(this.focusStateInput$.pipe(filter((isFocused): isFocused is false => !isFocused))),
        share({ resetOnRefCountZero: true })
    )

    @Output() unbind$ = new EventEmitter<null>()

    @Output('isActive') isActive$ = merge(this.focus$, this.blur$, this.unbind$).pipe(
        map(() => this.editor.isFocused),
        coalesceWith(timer(70)),
        mergeWith(this.unbind$.pipe(map(() => false))), // because we blur the editor when (un)binding
        startWith(false),
        untilDestroyed(this),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    @Output('update') update$ = this.editor.update$.pipe(
        untilDestroyed(this),
        skip(1), // emits first state when editor is empty for some reason
        // @TODO: here would go the throttler
        map(({ editor }) => (editor.isEmpty ? '' : editor.getHTML())),
        share({ resetOnRefCountZero: true })
    )

    private bindConfig$ = new Subject<{ input$: Observable<string>; context: unknown }>()
    @Input() set bind(bound: { input$: Observable<string>; context: unknown }) {
        this.bindConfig$.next(bound)
    }
    private bound$ = this.bindConfig$.pipe(
        untilDestroyed(this),
        map(({ input$, context }) => this.bindEditor(input$, context)),
        share({ resetOnRefCountZero: true })
    )
    @Output('updateOnBlur') updateOnBlur$ = this.bound$.pipe(
        switchMap(({ updateOnBlur$ }) => updateOnBlur$),
        share({ resetOnRefCountZero: true })
    )

    bindEditor<TContext>(input$: Observable<string>, context: TContext) {
        // cancel the previous binding
        this.unbind$.next(null)
        this.editor.commands.blur()

        input$
            .pipe(
                debugObserver('input$'),
                untilDestroyed(this),
                takeUntil(this.unbind$),
                withLatestFrom(this.update$.pipe(startWith(null))),
                map(([input, currentState], index) => ({
                    input,
                    currentState,
                    isFirst: index == 0,
                }))
            )
            .subscribe(({ input, currentState, isFirst }) => {
                if (input == currentState) return

                if (isFirst) {
                    this.editor.resetState(input)
                    if (this.searchTerm) {
                        console.log('setting search term', this.searchTerm)
                        this.editor.commands.setSearchTerm(this.searchTerm)
                    }
                } else {
                    this.editor.chain().setContent(input, false).setMeta('addToHistory', false).run()
                }
            })

        const updateOnBlur$ = merge(this.blur$, this.unbind$).pipe(
            withLatestFrom(this.update$, input$.pipe(startWith(null))),
            map(([, content, lastInput]) => ({ content, lastInput, context })),
            filter(({ content, lastInput }) => content != lastInput),
            distinctUntilKeyChanged('content'),
            untilDestroyed(this),
            takeUntil(this.unbind$.pipe(delay(0))),
            share({ resetOnRefCountZero: true })
        )

        return {
            unbind: () => this.unbind$.next(null),
            unbind$: this.unbind$.pipe(untilDestroyed(this), takeUntil(this.unbind$.pipe(delay(0)))),
            update$: this.update$,
            updateOnBlur$,
            selectionUpdate$: this.editor.selectionUpdate$.pipe(untilDestroyed(this), takeUntil(this.unbind$)),
            isActive$: this.isActive$.pipe(untilDestroyed(this), takeUntil(this.unbind$)),
            focus$: this.focus$.pipe(untilDestroyed(this), takeUntil(this.unbind$)),
            blur$: this.blur$.pipe(untilDestroyed(this), takeUntil(this.unbind$)),
        }
    }
}
