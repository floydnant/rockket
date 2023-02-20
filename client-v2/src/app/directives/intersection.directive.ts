import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core'

@Directive({
    selector: '[appIntersection], [intersectionChange], [intersectionEntry]',
})
export class IntersectionDirective implements AfterViewInit, OnDestroy {
    constructor(private elemRef: ElementRef<HTMLElement>) {}

    @Input() intersectionThreshold = 1
    @Output() intersectionChange = new EventEmitter<boolean>()
    @Output() intersectionEntry = new EventEmitter<IntersectionObserverEntry>()

    observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                this.intersectionChange.emit(entry.isIntersecting)
                this.intersectionEntry.emit(entry)
            })
        },
        { threshold: [this.intersectionThreshold] }
    )

    ngAfterViewInit(): void {
        this.observer.observe(this.elemRef.nativeElement)
    }
    ngOnDestroy(): void {
        this.observer.disconnect()
    }
}
