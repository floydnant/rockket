import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    Subject,
    animationFrames,
    debounceTime,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    merge,
    startWith,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs'
import { isNotNullish } from '../utils'

export type ResizeStrategy = 'left' | 'right'
export type ResizerFn = (
    event: MouseEvent,
    offset: { offsetX: number; offsetY: number },
    elem: HTMLElement,
    minMax: { minSize: number; maxSize: number },
) => number

const resizeStrategyMap: Record<ResizeStrategy, ResizerFn> = {
    left: (event: MouseEvent, { offsetX }, elem: HTMLElement, { minSize, maxSize }) => {
        const rect = elem.getBoundingClientRect()
        const rectLeftX = rect.x
        const diff = rectLeftX - event.clientX + offsetX
        const newWidth = rect.width + diff
        const clampedWidth = Math.min(Math.max(newWidth, minSize), maxSize)

        elem.style.width = clampedWidth + 'px'
        return clampedWidth
    },
    right: (event: MouseEvent, { offsetX }, elem: HTMLElement, { minSize, maxSize }) => {
        const rect = elem.getBoundingClientRect()
        const rectRightX = rect.x + rect.width
        const diff = event.clientX - rectRightX - offsetX
        const newWidth = rect.width + diff
        const clampedWidth = Math.min(Math.max(newWidth, minSize), maxSize)

        elem.style.width = clampedWidth + 'px'
        return clampedWidth
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
    @Input() minSize?: number
    @Input() maxSize?: number

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

            return fromEvent<MouseEvent>(document, 'mousemove').pipe(
                coalesceWith(animationFrames()),
                takeUntil(fromEvent(document, 'mouseup', { once: true })),
                map(mouseMoveEvent => [mouseMoveEvent, offset] as const),
            )
        }),
        map(([event, offset]) => {
            if (!this.resizeElem) return null

            const calcAndApplyNewSize = this.customResizer || resizeStrategyMap[this.resizeStrategy]
            const newSize = calcAndApplyNewSize(event, offset, this.resizeElem, {
                minSize: this.minSize || 0,
                maxSize: this.maxSize || Infinity,
            })

            return newSize
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
