import { OverlayRef, Overlay, PositionStrategy, ConnectedPosition } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import {
    Directive,
    ElementRef,
    HostListener,
    Injector,
    Input,
    OnDestroy,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core'
import { first } from 'rxjs'
import { TooltipComponent, TOOLTIP_DATA } from './tooltip/tooltip.component'
import { DeviceService } from '../services/device.service'

const positions = {
    top: {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        panelClass: 'top',
    } as ConnectedPosition,
    bottom: {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        panelClass: 'bottom',
    } as ConnectedPosition,
    right: {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        panelClass: 'right',
    } as ConnectedPosition,
    left: {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        panelClass: 'left',
    } as ConnectedPosition,
}

@Directive({
    selector: '[appTooltip]',
    exportAs: 'appTooltip',
})
export class TooltipDirective implements OnDestroy {
    constructor(
        private element: ElementRef<HTMLElement>,
        private overlay: Overlay,
        private viewContainer: ViewContainerRef,
        private deviceService: DeviceService,
    ) {}

    private overlayRef: OverlayRef | null = null

    @Input() appTooltip!: string | TemplateRef<void>
    @Input() tooltipOptions?: {
        preferredPosition?: keyof typeof positions
        closeOnHostClick?: boolean
        avoidPositions?: (keyof typeof positions)[]
        enableOnTouchDevice?: boolean
    }

    @HostListener('mouseenter')
    @HostListener('focus')
    showTooltip(): void {
        if (this.overlayRef?.hasAttached()) return

        this.deviceService.isTouchPrimary$.pipe(first()).subscribe(isTouchPrimary => {
            if (isTouchPrimary && !this.tooltipOptions?.enableOnTouchDevice) return

            this.attachTooltip()
        })
    }

    @HostListener('mouseleave')
    @HostListener('blur')
    hideTooltip(): void {
        if (this.overlayRef?.hasAttached()) this.overlayRef?.detach()
    }

    @HostListener('click')
    onHostClick() {
        if (
            this.tooltipOptions?.closeOnHostClick === undefined ||
            this.tooltipOptions?.closeOnHostClick === true
        )
            this.hideTooltip()
    }

    ngOnDestroy(): void {
        this.overlayRef?.dispose()
    }

    private attachTooltip(): void {
        if (this.overlayRef === null) {
            this.overlayRef = this.overlay.create({
                positionStrategy: this.getPositionStrategy(),
                scrollStrategy: this.overlay.scrollStrategies.close(),
            })
        }

        const injector = Injector.create({
            providers: [
                {
                    provide: TOOLTIP_DATA,
                    useValue: this.appTooltip,
                },
            ],
        })
        const component = new ComponentPortal(TooltipComponent, this.viewContainer, injector)
        this.overlayRef.attach(component)
    }

    private getPositionStrategy(): PositionStrategy {
        return this.overlay
            .position()
            .flexibleConnectedTo(this.element)
            .withFlexibleDimensions(true)
            .withPositions([
                ...(this.tooltipOptions?.preferredPosition
                    ? [positions[this.tooltipOptions.preferredPosition]]
                    : []),
                ...Object.entries(positions)
                    .filter(
                        ([name]) =>
                            !this.tooltipOptions?.avoidPositions?.includes(name as keyof typeof positions),
                    )
                    .map(([, position]) => position),
            ])
            .withTransformOriginOn('app-tooltip')
            .withViewportMargin(15)
            .withPush(true)
    }
}
