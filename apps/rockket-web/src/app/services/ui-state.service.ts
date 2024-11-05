import { Injectable } from '@angular/core'
import { Actions, ofType } from '@ngrx/effects'
import { environment } from 'src/environments/environment'
import { EntityType } from '@rockket/commons'
import { entitiesActions } from '../store/entities/entities.actions'
import { StorageItem } from '../utils/storage.helpers'
import { uiDefaults } from '../shared/defaults'
import { z } from 'zod'
import {
    DEFAULT_TASK_SORTING_STRATEGY_KEY,
    TaskSortingStrategyKey,
    taskSortingStrategyKeySchema,
} from '../components/organisms/entity-view/shared/view-settings/task-sorting-strategies'
import {
    DEFAULT_TASK_GROUPING_STRATEGY_KEY,
    TaskGroupingStrategyKey,
    taskGroupingStrategyKeySchema,
} from '../components/organisms/entity-view/shared/view-settings/task-grouping-strategies'

const sidebarUiStateSchema = z.object({
    isDesktopSidebarOpen: z.boolean().catch(true),
    isMobileMenuOpen: z.boolean().catch(true),
    width: z.string().catch(uiDefaults.sidebar.WIDTH + 'px'),
    entityExpandedMap: z.map(z.string(), z.boolean()).catch(new Map()),
    appVersion: z.string().catch(environment.PACKAGE_VERSION),
})
const defaultSidebarUiState = sidebarUiStateSchema.parse({})

const viewSettingsSchema = z.object({
    sorting: taskSortingStrategyKeySchema.catch(DEFAULT_TASK_SORTING_STRATEGY_KEY),
    grouping: taskGroupingStrategyKeySchema.catch(DEFAULT_TASK_GROUPING_STRATEGY_KEY),
    groupRecursive: z.boolean().catch(true),
})
export type ViewSettings = z.infer<typeof viewSettingsSchema>
export const defaultViewSettings = viewSettingsSchema.parse({})

const mainViewUiStateSchema = z.object({
    isProgressBarSticky: z.boolean().catch(true),
    isProgressShownAsPercentage: z.boolean().catch(true),
    entityExpandedMap: z.map(z.string(), z.boolean()).catch(new Map()),
    taskTreeDescriptionExpandedMap: z.map(z.string(), z.boolean()).catch(new Map()),
    sidePanelWidth: z.number().catch(uiDefaults.mainView.SIDE_PANEL_WIDTH),
    // @TODO: what do we call this? viewSettings? settings? preferences?
    // It stores sorting and grouping settings for a list of tasks
    viewSettings: viewSettingsSchema.catch(defaultViewSettings),
    appVersion: z.string().catch(environment.PACKAGE_VERSION),
})
const defaultMainViewUIState = mainViewUiStateSchema.parse({})

@Injectable({
    providedIn: 'root',
})
export class UiStateService {
    constructor(private actions$: Actions) {}

    private entityDeletedSubscription = this.actions$
        .pipe(ofType(entitiesActions.deleteSuccess))
        .subscribe(({ id, entityType }) => this.deleteUiEntryForEntity(id, entityType))

    private sidebarUiState_ = new StorageItem('rockket-sidebar-ui-state', {
        schema: sidebarUiStateSchema.catch(defaultSidebarUiState),
    })
    get sidebarUiState() {
        if (!this.sidebarUiState_.value) return defaultSidebarUiState
        return this.sidebarUiState_.value
    }

    private mainViewUiState_ = new StorageItem('rockket-main-ui-state', {
        schema: mainViewUiStateSchema.catch(defaultMainViewUIState),
    })
    get mainViewUiState() {
        if (!this.mainViewUiState_.value) return defaultMainViewUIState
        return this.mainViewUiState_.value
    }
    updateMainViewStorage() {
        this.mainViewUiState_.updateStorage()
    }

    toggleSidebarEntity(id: string, isExpanded: boolean) {
        this.sidebarUiState.entityExpandedMap.set(id, isExpanded)
        this.sidebarUiState_.updateStorage()
    }
    updateSidebarWidth(width: string) {
        this.sidebarUiState.width = width
        this.sidebarUiState_.updateStorage()
    }
    toggleMobileMenu(isOpen: boolean) {
        this.sidebarUiState.isMobileMenuOpen = isOpen
        this.sidebarUiState_.updateStorage()
    }

    updateMainViewSidePanel(width: number) {
        this.mainViewUiState.sidePanelWidth = width
        this.mainViewUiState_.updateStorage()
    }
    toggleMainViewEntity(id: string, isExpanded: boolean) {
        this.mainViewUiState.entityExpandedMap.set(id, isExpanded)
        this.mainViewUiState_.updateStorage()
    }
    toggleTaskDescription(id: string, isExpanded: boolean) {
        this.mainViewUiState.taskTreeDescriptionExpandedMap.set(id, isExpanded)
        this.mainViewUiState_.updateStorage()
    }
    updateShownAsPercentage(isShownAsPercentage: boolean) {
        this.mainViewUiState.isProgressShownAsPercentage = isShownAsPercentage
        this.mainViewUiState_.updateStorage()
    }

    setViewSettings(settings: ViewSettings) {
        this.mainViewUiState.viewSettings = settings
        this.mainViewUiState_.updateStorage()
    }

    deleteUiEntryForEntity(id: string, entityType: EntityType) {
        this.sidebarUiState.entityExpandedMap.delete(id)
        this.mainViewUiState.entityExpandedMap.delete(id)
        if (entityType == EntityType.Task) this.mainViewUiState.taskTreeDescriptionExpandedMap.delete(id)

        this.sidebarUiState_.updateStorage()
        this.mainViewUiState_.updateStorage()
    }
    deleteUiState() {
        this.sidebarUiState_.remove()
        this.mainViewUiState_.remove()
    }
}
