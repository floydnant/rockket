import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core'

@Component({
    selector: 'app-main-pane',
    templateUrl: './main-pane.component.html',
    styles: [
        `
            :host {
                @apply contents;
            }

            .main-header {
                @apply z-30 shadow-header;
            }
            @media (max-width: 768px) {
                .main-header--mobile.hide {
                    @apply -translate-y-full;
                }
            }
        `,
    ],
})
export class MainPaneComponent implements AfterViewInit, OnDestroy {
    // @TODO: Make the prose width adjustable with a drag, or have a couple presets
    @Input() prose = true

    isScrolled = false
    @ViewChild('scrollSpy') scrollSpy!: ElementRef<HTMLDivElement>

    observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.target == this.scrollSpy.nativeElement) this.isScrolled = !entry.isIntersecting
            })
        },
        { threshold: [1] }
    )
    ngAfterViewInit(): void {
        this.observer.observe(this.scrollSpy.nativeElement)
    }
    ngOnDestroy(): void {
        this.observer.disconnect()
    }
}
