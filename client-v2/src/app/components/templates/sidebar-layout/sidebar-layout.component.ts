import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core'
import { DeviceService } from 'src/app/services/device.service'
import { MenuService } from './menu.service'

@Component({
    selector: 'app-sidebar-layout',
    templateUrl: './sidebar-layout.component.html',
    styleUrls: ['./sidebar-layout.component.css'],
})
export class SidebarLayoutComponent implements AfterViewInit, OnDestroy {
    constructor(private menuService: MenuService, private deviceService: DeviceService) {}

    @Input() enableResize = true

    isMobileScreen$ = this.deviceService.isMobileScreen$

    isMenuOpen$ = this.menuService.isMenuOpen$
    isBottomNavBorderVisible$ = this.menuService.isBottomNavBorderVisible$

    isSidebarScrolled = false
    setScrollSpyIntersecting(isIntersecting: boolean) {
        this.isSidebarScrolled = !isIntersecting
    }

    @ViewChild('resizeHandle') resizeHandle!: ElementRef<HTMLDivElement>

    ngAfterViewInit(): void {
        if (this.enableResize) {
            this.resizeHandle.nativeElement.addEventListener('mousedown', this.onMouseDown)
            document.addEventListener('mouseup', this.onMouseUp)
        }
    }
    ngOnDestroy(): void {
        if (this.enableResize) {
            this.resizeHandle.nativeElement.removeEventListener('mousedown', this.onMouseDown)
            document.removeEventListener('mouseup', this.onMouseUp)
        }
    }

    // in case: https://stackoverflow.com/questions/26233180/resize-a-div-on-border-drag-and-drop-without-adding-extra-markup

    onMouseDown = (() => document.addEventListener('mousemove', this.onResize)).bind(this)
    onMouseUp = (() => document.removeEventListener('mousemove', this.onResize)).bind(this)

    onResize = ((e: MouseEvent) => {
        const sidebar = this.resizeHandle.nativeElement.parentElement as HTMLDivElement
        const currMouseX = e.clientX
        const newWidth = currMouseX + 'px'
        sidebar.style.width = newWidth
    }).bind(this)
}
