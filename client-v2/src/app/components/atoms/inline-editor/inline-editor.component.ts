import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    first,
    map,
    merge,
    shareReplay,
    switchMap,
    tap,
    throttleTime,
} from 'rxjs'

export const INLINE_EDITOR_DELAY_TIME = 600

@UntilDestroy()
@Component({
    selector: 'app-inline-editor',
    templateUrl: './inline-editor.component.html',
    styleUrls: ['./inline-editor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineEditorComponent {
    @ViewChild('inlineEditor') inlineEditor!: ElementRef<HTMLSpanElement>

    textInput$ = new BehaviorSubject('')
    @Input() set textInput(value: string) {
        this.textInput$.next(value)
    }

    @Input() placeholder?: string
    @Input() placeholderColor?: string
    @Input() editorClass?: string | Record<string, boolean>
    @Input() enableDebouncedUpdates = true

    @Output() update = new EventEmitter<string | null>()

    text$ = this.textInput$.pipe(
        filter(textInput => textInput != this.lastEmittedUpdate),
        tap(() => (this.lastEmittedUpdate = null)),

        map(textInput => {
            if (!textInput) return null
            // @TODO: this should be the responsibility of the parent component (placeholder should not be part of the text stream)
            if (textInput == this.placeholder) return ''

            return textInput
        }),

        distinctUntilChanged((prevText, currText) => {
            if (prevText === '' && currText === '') return false

            return prevText == currText
        }),

        switchMap(text => {
            return this.textChanges$.pipe(
                first(),
                filter(latestTextUpdate => {
                    if (!latestTextUpdate) return true

                    return text != latestTextUpdate
                }),
                map(() => text)
            )
        }),
        tap(text => {
            /*  This is necessary in case of updating the entity title from empty to also empty.
                Because apparently, angular does not do the update, which is bad when the entity title was edited before,
                meaning, the edited entity title won't be overwritten. So we have to do that manually.

                We could narrow this down even further with comparing to the previous entity title (`pairwise()` operator),
                and only update if both are empty, but this should suffice for now. */
            if (text === '' && this.inlineEditor?.nativeElement) {
                this.inlineEditor.nativeElement.innerText = ''
            }
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    isFocused = false // needed for access from outside the component

    keydownEvents$ = new BehaviorSubject<KeyboardEvent | null>(null)
    blurEvents$ = new BehaviorSubject<FocusEvent | null>(null)
    textChanges$ = new BehaviorSubject<string | null>(null)

    textDomState$ = merge(
        this.textChanges$,
        this.text$.pipe(
            tap(() => {
                if (this.textChanges$.value !== null) this.textChanges$.next(null)
            })
        )
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }))

    textUpdateEvents$ = merge(
        this.keydownEvents$.pipe(
            filter(event => {
                if (event?.code == 'Enter') {
                    event.preventDefault()
                    return true
                }
                return false
            }),
            throttleTime(INLINE_EDITOR_DELAY_TIME),
            switchMap(() => this.textChanges$.pipe(first()))
        ),
        this.blurEvents$.pipe(
            filter(e => !!e),
            throttleTime(INLINE_EDITOR_DELAY_TIME),
            switchMap(() => this.textChanges$.pipe(first()))
        ),
        this.textChanges$.pipe(
            filter(() => this.enableDebouncedUpdates),
            debounceTime(INLINE_EDITOR_DELAY_TIME)
        )
    ).pipe(
        map(newText => {
            if (newText === null) return null

            return newText || this.placeholder || '' // @TODO: same here with placeholder
        }),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    textUpdatesSubscription = this.textUpdateEvents$
        .pipe(
            tap(text => {
                if (!text) return

                this.lastEmittedUpdate = text
                this.update.emit(text)
            }),
            untilDestroyed(this)
        )
        .subscribe()

    lastEmittedUpdate: string | null = null
}
