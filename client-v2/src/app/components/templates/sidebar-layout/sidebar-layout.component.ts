import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core'

@Component({
    selector: 'app-sidebar-layout',
    templateUrl: './sidebar-layout.component.html',
    styleUrls: ['./sidebar-layout.component.css'],
})
export class SidebarLayoutComponent implements AfterViewInit, OnDestroy {
    @Input() prose = true

    isMenuOpen = false

    // @TODO: Make the prose width adjustable with a drag, or have a couple presets
    // @TODO: Persist width in localStorage
    // @TODO: Component (e2e) test the sidebar resizing feature
    // @TODO: Component (e2e) test the sidebar toggle feature (mobile)
    // @TODO: Add a sidebar collapsing feature (desktop)
    // @TODO: Fix the weird fucked up sideoverflow issue when writing long words/text in taskname/listname/description

    @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>

    ngAfterViewInit(): void {
        this.resizeHandle.nativeElement.addEventListener('mousedown', this.onMouseDown)
        document.addEventListener('mouseup', this.onMouseUp)

        this.sidebarScrollSpyObserver.observe(this.sidebarScrollSpy.nativeElement)
        this.mainScrollSpyObserver.observe(this.mainScrollSpy.nativeElement)
    }
    ngOnDestroy(): void {
        this.resizeHandle.nativeElement.removeEventListener('mousedown', this.onMouseDown)
        document.removeEventListener('mouseup', this.onMouseUp)

        this.sidebarScrollSpyObserver.disconnect()
        this.mainScrollSpyObserver.disconnect()
    }

    // in case: https://stackoverflow.com/questions/26233180/resize-a-div-on-border-drag-and-drop-without-adding-extra-markup

    onMouseDown = (() => document.addEventListener('mousemove', this.onResize)).bind(this)
    onMouseUp = (() => document.removeEventListener('mousemove', this.onResize)).bind(this)

    onResize = ((e: MouseEvent) => {
        const sidebar = this.resizeHandle.nativeElement.parentElement as HTMLDivElement
        const currMouseX = e.x
        const newWidth = currMouseX + 'px'
        sidebar.style.width = newWidth
    }).bind(this)

    isSidebarScrolled = false
    @ViewChild('sidebarScrollSpy') sidebarScrollSpy!: ElementRef<HTMLDivElement>
    sidebarScrollSpyObserver = new IntersectionObserver(
        entries => {
            this.isSidebarScrolled = !entries[0].isIntersecting
        },
        { threshold: [1] }
    )

    isMainScrolled = false
    @ViewChild('mainScrollSpy') mainScrollSpy!: ElementRef<HTMLDivElement>
    mainScrollSpyObserver = new IntersectionObserver(
        entries => {
            this.isMainScrolled = !entries[0].isIntersecting
        },
        { threshold: [1] }
    )
}
