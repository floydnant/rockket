import { TemplatePortal } from '@angular/cdk/portal'
import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    BehaviorSubject,
    Subject,
    animationFrames,
    combineLatest,
    distinctUntilChanged,
    first,
    map,
    merge,
    of,
    switchMap,
} from 'rxjs'
import { DeviceService } from 'src/app/services/device.service'
import { MenuService } from '../sidebar-layout/menu.service'
import { MainPaneLayoutService } from './main-pane-layout.service'

export class SidePanelPortalContext {
    /** `isTeleported` */
    $implicit = false
    isTeleported = false
}

@UntilDestroy()
@Directive({
    selector: '[appSidepanelPortal]',
    exportAs: 'appSidepanelPortal',
})
export class SidepanelPortalDirective implements OnInit {
    constructor(
        private templateRef: TemplateRef<SidePanelPortalContext>,
        private viewContainerRef: ViewContainerRef,
        private mainPaneLayoutService: MainPaneLayoutService,
        private deviceService: DeviceService,
        private menuService: MenuService,
    ) {}

    @Input('appSidepanelPortalAllowTeleport')
    set allowTeleport(allow: boolean) {
        this.allowTeleport$.next(allow)
    }
    allowTeleport$ = new BehaviorSubject(true)

    @Input('appSidepanelPortalIsTeleportedCallback')
    isTeleportedCallback$?: Subject<boolean>

    private hasLocalView = false

    /** @internal */
    static ngTemplateContextGuard(
        dir: SidepanelPortalDirective,
        ctx: unknown | null | undefined,
    ): ctx is SidePanelPortalContext {
        return true
    }

    private portal?: TemplatePortal<SidePanelPortalContext>

    private onInit$ = new Subject()
    ngOnInit() {
        this.onInit$.next(null)
    }

    private availableWidth$ = combineLatest([
        this.deviceService.screenWidth$,
        this.menuService.sidebarWidth$,
        this.deviceService.isMobileScreen$,
        this.mainPaneLayoutService.sidePanelWidth$,
    ]).pipe(
        coalesceWith(animationFrames()),
        map(([screenWidth, sidebarWidth, isMobileScreen, sidePanelWidth]) => {
            return isMobileScreen ? screenWidth : screenWidth - sidebarWidth - sidePanelWidth
        }),
    )

    private shouldTeleport$ = this.allowTeleport$.pipe(
        switchMap(allowTeleport => {
            if (!allowTeleport) return of(false)

            return merge(
                this.deviceService.isMediumScreen$.pipe(first()),
                this.availableWidth$.pipe(map(availableWidth => availableWidth > 400)),
            )
        }),
        distinctUntilChanged(),
    )

    private _sidePanelPortalSubscription = this.onInit$
        .pipe(
            switchMap(() => this.shouldTeleport$),
            untilDestroyed(this),
        )
        .subscribe({
            next: shouldTeleport => {
                if (shouldTeleport) {
                    // Remove local view
                    if (this.hasLocalView) {
                        this.viewContainerRef.clear()
                        this.hasLocalView = false
                    }

                    // Teleport to remote view
                    // @TODO: do we need to detach and recreate or can we just keep things as is?
                    // if (this.portal.isAttached) this.portal.detach()
                    // this.mainPaneLayoutService.sidePanelPortal$.next(this.portal)

                    // this.portal?.viewContainerRef.
                    this.portal = new TemplatePortal(this.templateRef, this.viewContainerRef, {
                        $implicit: true,
                        isTeleported: true,
                    })
                    this.mainPaneLayoutService.sidePanelPortal$.next(this.portal)
                    this.isTeleportedCallback$?.next(true)
                } else {
                    // Remove remote view
                    if (this.portal?.isAttached) this.portal.detach()
                    this.mainPaneLayoutService.sidePanelPortal$.next(null)

                    // Create local view
                    if (!this.hasLocalView) {
                        const view = this.viewContainerRef.createEmbeddedView(this.templateRef, {
                            $implicit: false,
                            isTeleported: false,
                        })
                        view.markForCheck() // @TODO: find out and document why this is needed
                        this.hasLocalView = true
                    }
                    this.isTeleportedCallback$?.next(false)
                }
            },

            // This only happens when the component is destroyed, no need to create a local view here
            complete: () => {
                if (this.portal?.isAttached) this.portal.detach()
                this.mainPaneLayoutService.sidePanelPortal$.next(null)
            },
        })
}
