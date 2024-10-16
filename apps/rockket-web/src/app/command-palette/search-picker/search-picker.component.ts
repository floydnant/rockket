import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    Output,
    ViewChild,
} from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { assertUnreachable, isTruthy } from '@rockket/commons'
import {
    distinctUntilChanged,
    filter,
    first,
    fromEvent,
    map,
    merge,
    Observable,
    ReplaySubject,
    scan,
    share,
    shareReplay,
    startWith,
    Subject,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { isNotNullish } from 'src/app/utils'

/** `number` means an item was explicitly pointed at w/ the mouse. */
type SelectionMove = 'up' | 'down' | 'first' | 'last' | number

@UntilDestroy()
@Component({
    selector: 'app-search-picker',
    templateUrl: './search-picker.component.html',
    styles: [
        `
            /* ul:not(:has(.selected)) button {
                color: red !important;
            } */
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPickerComponent<T extends { title: string; icon?: IconKey; breadcrumbs?: string[] }> {
    private elemRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>)

    @Input({ required: true, alias: 'keydownEvents$' }) set keydownEvents$Setter(
        events$: Observable<KeyboardEvent>,
    ) {
        this.keydownEvents$$.next(events$)
    }
    keydownEvents$$ = new ReplaySubject<Observable<KeyboardEvent>>(1)
    keydownEvents$ = this.keydownEvents$$.pipe(
        switchMap(keydownEvents$ => keydownEvents$),
        share({ resetOnRefCountZero: true }),
        untilDestroyed(this),
    )

    @Input({ required: true }) set results(results: T[] | null | undefined) {
        if (results) this.results$.next(results)
    }
    results$ = new ReplaySubject<T[]>(1)

    @Input() maxBreadcrumbWidth = '13ch'
    @Input() maxHeight: number | null | undefined

    onClick$ = new Subject<number>()
    onMouseEnter$ = new ReplaySubject<number>(1)

    onMoveSelection$ = this.keydownEvents$.pipe(
        map((event): SelectionMove | null => {
            if (event.ctrlKey || event.metaKey || event.altKey) return null

            if (event.key == 'ArrowDown') {
                event.preventDefault()
                if (event.shiftKey) return 'last'
                return 'down'
            }
            if (event.key == 'ArrowUp') {
                event.preventDefault()
                if (event.shiftKey) return 'first'
                return 'up'
            }
            return null
        }),
        filter(isTruthy),
    )
    onEnter$ = this.keydownEvents$.pipe(
        filter(event => event.key == 'Enter'),
        tap(event => event.preventDefault()),
        map(() => undefined as void),
    )

    @ViewChild('list') resultsList?: ElementRef<HTMLUListElement>
    listPaddingTop = 0
    listPaddingBottom = 0

    // @TODO: This could use some improvement:
    // The implicit selection state is currently not properly propagated to the dom and is handled by some nasty CSS instead:
    // nasty CSS: Apply selection styles for first item if there is no item selected
    @Input() keepFirstItemSelected = true
    @Input() allowWrappingSelection = false

    selectedIndex$ = this.results$.pipe(
        switchMap((results, emissionIndex) => {
            const resultsCount = results?.length || 0
            const initialSelectedIndex = this.keepFirstItemSelected ? 0 : null

            return merge(
                this.onMoveSelection$,
                fromEvent(this.elemRef.nativeElement, 'mousemove').pipe(
                    withLatestFrom(this.onMouseEnter$),
                    map(([_, index]) => index),
                ),
            ).pipe(
                scan<SelectionMove, { emissionIndex: number; index: number | null; shouldScroll: boolean }>(
                    ({ index: prevSelectedIndex }, selectionMove) => {
                        const nextSelection = {
                            emissionIndex,
                            index: null as number | null,
                            shouldScroll: true,
                        }

                        if (resultsCount == 0) {
                            nextSelection.index = null
                            nextSelection.shouldScroll = false
                            return nextSelection
                        }

                        // Explicit pointing at an item with the mouse
                        if (typeof selectionMove == 'number') {
                            nextSelection.index = selectionMove
                            nextSelection.shouldScroll = false
                            return nextSelection
                        }

                        switch (selectionMove) {
                            case 'down':
                                // Select first item
                                if (prevSelectedIndex === null) {
                                    nextSelection.index = 0
                                    return nextSelection
                                }
                                if (this.allowWrappingSelection && prevSelectedIndex == resultsCount - 1) {
                                    nextSelection.index = 0
                                    return nextSelection
                                }

                                // Select next item
                                nextSelection.index = Math.min(prevSelectedIndex + 1, resultsCount - 1)
                                return nextSelection

                            case 'up':
                                // Select last item
                                if (prevSelectedIndex === null) {
                                    nextSelection.index = resultsCount - 1
                                    return nextSelection
                                }
                                if (this.allowWrappingSelection && prevSelectedIndex == 0) {
                                    nextSelection.index = resultsCount - 1
                                    return nextSelection
                                }

                                // Select previous item
                                nextSelection.index = Math.max(prevSelectedIndex - 1, 0)
                                return nextSelection

                            case 'first':
                                // Select last item
                                nextSelection.index = 0
                                return nextSelection

                            case 'last':
                                // Select last item
                                nextSelection.index = resultsCount - 1
                                return nextSelection

                            // prettier-ignore
                            default: return assertUnreachable(selectionMove)
                        }
                    },
                    { emissionIndex, index: initialSelectedIndex, shouldScroll: false },
                ),
                startWith({ emissionIndex, index: initialSelectedIndex, shouldScroll: false }),
            )
        }),
        distinctUntilChanged(
            ({ index: prevIndex, emissionIndex: prevEmissionIndex }, { index, emissionIndex }) =>
                prevIndex == index && prevEmissionIndex == emissionIndex,
        ),
        tap(({ index: selectedIndex, shouldScroll: shouldScrollIntoView }) => {
            this.updateDomAndScroll(selectedIndex, shouldScrollIntoView)
            // @TODO: lets try and get rid of this
            // This ensures the list selection is updated after angulars rendering
            setTimeout(() => {
                this.updateDomAndScroll(selectedIndex, shouldScrollIntoView)
            })
        }),
        map(({ index: selectedIndex }) => selectedIndex),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
        untilDestroyed(this),
    )
    private selectionSubscription = this.selectedIndex$.subscribe()

    @Output() commitSelection = merge(
        this.onClick$,
        this.onEnter$.pipe(
            switchMap(() => this.selectedIndex$.pipe(first())),
            filter(isNotNullish),
        ),
    ).pipe(
        switchMap(index => {
            return this.results$.pipe(
                first(),
                map(results => results[index]),
            )
        }),
        untilDestroyed(this),
    )

    /**
     * - Updates the DOM to reflect the current selection state
     * - Scrolls to the selected item if necessary
     */
    updateDomAndScroll(selectedIndex: number | null, shouldScrollIntoView: boolean) {
        const listElem = this.resultsList?.nativeElement
        if (selectedIndex === null || !listElem) return

        const selectedElem = listElem.children[selectedIndex]
        if (!selectedElem) return
        selectedElem.classList.add('selected')

        // @TODO: this could be made more efficient
        for (let i = 0; i < listElem.children.length; i++) {
            const elem = listElem.children[i]
            if (i != selectedIndex) elem.classList.remove('selected')
        }

        if (!shouldScrollIntoView) return

        const listRect = listElem.getBoundingClientRect()
        const rect = selectedElem.getBoundingClientRect()

        // If the element is not visible in the current scrolled view of the `listElem` we need to scroll it into view
        if (rect.top < listRect.top + this.listPaddingTop) selectedElem?.scrollIntoView({ block: 'start' })
        if (rect.bottom > listRect.bottom - this.listPaddingBottom)
            selectedElem?.scrollIntoView({ block: 'end' })
    }
}
