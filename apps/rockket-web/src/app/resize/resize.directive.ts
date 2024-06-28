import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    NEVER,
    Subject,
    animationFrames,
    debounceTime,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    merge,
    of,
    race,
    startWith,
    switchMap,
    takeUntil,
    tap,
    timer,
} from 'rxjs'
import { isNotNullish } from '../utils'

export type ResizeStrategy = 'left' | 'right'
export type ResizerFn = (
    event: MouseEvent,
    offset: { offsetX: number; offsetY: number },
    elem: HTMLElement,
    minMax: { minSize: number; maxSize: number },
) => number
export type SizeResetterFn = (elem: HTMLElement, defaultSize: number) => void

const resizerMap: Record<ResizeStrategy, ResizerFn> = {
    left: (event, { offsetX }, elem, { minSize, maxSize }) => {
        const rect = elem.getBoundingClientRect()
        const rectLeftX = rect.x
        const diff = rectLeftX - event.clientX + offsetX
        const newWidth = rect.width + diff
        const clampedWidth = Math.min(Math.max(newWidth, minSize), maxSize)

        elem.style.width = clampedWidth + 'px'
        return clampedWidth
    },
    right: (event, { offsetX }, elem, { minSize, maxSize }) => {
        const rect = elem.getBoundingClientRect()
        const rectRightX = rect.x + rect.width
        const diff = event.clientX - rectRightX - offsetX
        const newWidth = rect.width + diff
        const clampedWidth = Math.min(Math.max(newWidth, minSize), maxSize)

        elem.style.width = clampedWidth + 'px'
        return clampedWidth
    },
}

const sizeResetterMap: Record<ResizeStrategy, SizeResetterFn> = {
    left: (elem, defaultSize) => {
        elem.style.width = defaultSize + 'px'
    },
    right: (elem, defaultSize) => {
        elem.style.width = defaultSize + 'px'
    },
}

@UntilDestroy()
@Directive({
    selector: '[appResize]',
    exportAs: 'appResize',
    host: {
        class: 'resize-handle',
        '(mousedown)': 'mouseDown$.next($event)',
    },
})
export class ResizeDirective {
    constructor(private resizeHandleRef: ElementRef<HTMLElement>) {}

    @Input({ alias: 'appResize', required: true }) resizeElem?: HTMLElement
    @Input() resizeStrategy: ResizeStrategy = 'left'
    @Input() customResizer?: ResizerFn
    @Input() customSizeResetter?: SizeResetterFn
    @Input() minSize?: number
    @Input() maxSize?: number
    @Input() defaultSize?: number

    @Output() resizing = new EventEmitter<number>()
    @Output() resizeEnd = new EventEmitter<number>()

    mouseDown$ = new Subject<MouseEvent>()

    isResizing$ = merge(
        this.mouseDown$.pipe(map(() => true)),
        this.mouseDown$.pipe(
            switchMap(() => fromEvent(document, 'mouseup', { once: true }).pipe(map(() => false))),
        ),
    ).pipe(startWith(false))

    isResizingSubscription = this.isResizing$.pipe(untilDestroyed(this)).subscribe(isResizing => {
        // @TODO: force the cursor to be the resize one (col-resize or row-resize, depending on the strategy)
        if (isResizing) {
            this.resizeHandleRef.nativeElement.classList.add('isResizing')
            this.resizeElem?.classList.add('isResizing')
        } else {
            this.resizeHandleRef.nativeElement.classList.remove('isResizing')
            this.resizeElem?.classList.remove('isResizing')
        }
    })

    resize$ = this.mouseDown$.pipe(
        switchMap(mouseDownEvent => {
            const resizeHandleRect = this.resizeHandleRef.nativeElement.getBoundingClientRect()
            const offset = {
                /** Offset between the mouse x and the resize handle center */
                offsetX: mouseDownEvent.clientX - resizeHandleRect.x - resizeHandleRect.width / 2,
                /** Offset between the mouse y and the resize handle center */
                offsetY: mouseDownEvent.clientY - resizeHandleRect.y - resizeHandleRect.height / 2,
            }
            const minMax = {
                minSize: this.minSize || 0,
                maxSize: this.maxSize || Infinity,
            }

            const onResize$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
                coalesceWith(animationFrames()),
                map(mouseMoveEvent => {
                    if (!this.resizeElem) return

                    const resize = this.customResizer || resizerMap[this.resizeStrategy]
                    const newSize = resize(mouseMoveEvent, offset, this.resizeElem, minMax)

                    return newSize
                }),
                takeUntil(fromEvent(document, 'mouseup', { once: true })),
            )
            const onResetSize$ = fromEvent(document, 'mouseup', { once: true }).pipe(
                map(() => {
                    if (!this.resizeElem) return
                    if (!this.defaultSize) return

                    const resetSize = this.customSizeResetter || sizeResetterMap[this.resizeStrategy]
                    resetSize(this.resizeElem, this.defaultSize)

                    return this.defaultSize
                }),
            )
            const onResetSizeWithTimeout$ = race(onResetSize$, timer(500).pipe(map(() => null))).pipe(
                switchMap(v => {
                    // When the timeout kicked in, we want to ignore any 'reset size' emissions,
                    // but leave the 'resize' event stream in tact
                    if (v === null) return NEVER

                    return of(v)
                }),
            )

            // The 'reset size' event stream must be first, so its value is emitted before
            // the 'mouseup' event completes the 'resize' event stream
            return race(onResetSizeWithTimeout$, onResize$)
        }),
        filter(isNotNullish),
        distinctUntilChanged(),
        tap(size => this.resizing.emit(size)),
    )
    resizeEnd$ = this.resize$.pipe(
        debounceTime(600),
        tap(size => this.resizeEnd.emit(size)),
    )

    resizeSubscription = this.resizeEnd$.pipe(untilDestroyed(this)).subscribe()
}
