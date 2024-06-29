import { TemplatePortal } from '@angular/cdk/portal'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { UiStateService } from 'src/app/services/ui-state.service'
import { uiDefaults } from 'src/app/shared/defaults'
import { SidePanelPortalContext } from './sidepanel-portal.directive'

@Injectable({
    providedIn: 'root',
})
export class MainPaneLayoutService {
    constructor(private uiStateService: UiStateService) {}

    sidePanelPortal$ = new BehaviorSubject<TemplatePortal<SidePanelPortalContext> | null>(null)
    sidePanelWidth$ = new BehaviorSubject<number>(
        this.uiStateService.mainViewUiState.sidePanelWidth || uiDefaults.mainView.SIDE_PANEL_WIDTH,
    )
}
