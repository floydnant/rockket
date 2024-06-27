import { Injectable } from '@angular/core'
import { Actions, ofType } from '@ngrx/effects'
import { environment } from 'src/environments/environment'
import { EntityType } from '@rockket/commons'
import { entitiesActions } from '../store/entities/entities.actions'
import { StorageItem } from '../utils/storage.helpers'
import { map } from 'rxjs'

class SidebarUiState {
    isDesktopSidebarOpen = true
    isMobileMenuOpen = true
    width?: string

    entityExpandedMap: Map<string, boolean> = new Map()

    appVersion = environment.PACKAGE_VERSION
}

class MainViewUiState {
    isProgressBarSticky = true
    isProgressShownAsPercentage = true

    entityExpandedMap: Map<string, boolean> = new Map()
    taskTreeDescriptionExpandedMap: Map<string, boolean> = new Map()

    appVersion = environment.PACKAGE_VERSION
}

@Injectable({
    providedIn: 'root',
})
export class UiStateService {
    constructor(private actions$: Actions) {}

    private entityDeletedSubscription = this.actions$
        .pipe(ofType(entitiesActions.deleteSuccess))
        .subscribe(({ id, entityType }) => this.deleteUiEntryForEntity(id, entityType))

    private sidebarUiState_ = new StorageItem('rockket-sidebar-ui-state', {
        defaultValue: new SidebarUiState(),
    })
    get sidebarUiState() {
        return this.sidebarUiState_.value as SidebarUiState
    }

    private mainViewUiState_ = new StorageItem('rockket-main-ui-state', {
        defaultValue: new MainViewUiState(),
    })
    get mainViewUiState() {
        return this.mainViewUiState_.value as MainViewUiState
    }
    mainViewUiState$ = this.mainViewUiState_.value$.pipe(
        map(value => {
            if (!value) return new MainViewUiState()

            // return { ...new MainViewUiState(), ...value }
            return value
            return Object.assign({}, new MainViewUiState(), value)
        }),
    )

    toggleSidebarEntity(id: string, isExpanded: boolean) {
        this.sidebarUiState.entityExpandedMap.set(id, isExpanded)
        this.sidebarUiState_.markAsDirty()
    }
    updateSidebarWidth(width: string) {
        this.sidebarUiState.width = width
        this.sidebarUiState_.markAsDirty()
    }
    toggleMobileMenu(isOpen: boolean) {
        this.sidebarUiState.isMobileMenuOpen = isOpen
        this.sidebarUiState_.markAsDirty()
    }

    toggleMainViewEntity(id: string, isExpanded: boolean) {
        this.mainViewUiState.entityExpandedMap.set(id, isExpanded)
        this.mainViewUiState_.markAsDirty()
    }
    toggleTaskDescription(id: string, isExpanded: boolean) {
        this.mainViewUiState.taskTreeDescriptionExpandedMap.set(id, isExpanded)
        this.mainViewUiState_.markAsDirty()
    }
    updateShownAsPercentage(isShownAsPercentage: boolean) {
        this.mainViewUiState.isProgressShownAsPercentage = isShownAsPercentage
        this.mainViewUiState_.markAsDirty()
    }

    deleteUiEntryForEntity(id: string, entityType: EntityType) {
        this.sidebarUiState.entityExpandedMap.delete(id)
        this.mainViewUiState.entityExpandedMap.delete(id)
        if (entityType == EntityType.TASK) this.mainViewUiState.taskTreeDescriptionExpandedMap.delete(id)

        this.sidebarUiState_.markAsDirty()
        this.mainViewUiState_.markAsDirty()
    }
    deleteUiState() {
        this.sidebarUiState_.remove()
        this.mainViewUiState_.remove()
    }
}
