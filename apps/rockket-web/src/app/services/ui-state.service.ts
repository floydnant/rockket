import { Injectable } from '@angular/core'
import { EMPTY, filter, map, mergeWith, Observable, of, shareReplay, Subject, take } from 'rxjs'
import { environment } from 'src/environments/environment'
import { z } from 'zod'
import {
    DEFAULT_TASK_GROUPING_STRATEGY_KEY,
    taskGroupingStrategyKeySchema,
} from '../components/organisms/entity-view/shared/view-settings/task-grouping-strategies'
import {
    DEFAULT_TASK_SORTING_STRATEGY_KEY,
    taskSortingStrategyKeySchema,
} from '../components/organisms/entity-view/shared/view-settings/task-sorting-strategies'
import { uiDefaults } from '../shared/defaults'
import { StorageItem } from '../utils/storage.helpers'

const objectWithEmptyCatch = <TShape extends z.ZodRawShape>(shape: TShape) => {
    return z.object({}).passthrough().catch({}).pipe(z.object(shape))
}

const sidebarUiStateSchema = objectWithEmptyCatch({
    isDesktopSidebarOpen: z.boolean().catch(true),
    isMobileMenuOpen: z.boolean().catch(true),
    width: z.string().catch(uiDefaults.sidebar.WIDTH + 'px'),
    entityExpandedMap: z.map(z.string(), z.boolean()).catch(new Map()),
    appVersion: z.string().catch(environment.PACKAGE_VERSION),
})
const defaultSidebarUiState = sidebarUiStateSchema.parse({})

const viewSettingsSchema = objectWithEmptyCatch({
    sorting: taskSortingStrategyKeySchema.catch(DEFAULT_TASK_SORTING_STRATEGY_KEY),
    grouping: taskGroupingStrategyKeySchema.catch(DEFAULT_TASK_GROUPING_STRATEGY_KEY),
    groupRecursive: z.boolean().catch(true),
})
export type ViewSettings = z.infer<typeof viewSettingsSchema>
export const defaultViewSettings = viewSettingsSchema.parse({})

const mainViewUiStateSchema = objectWithEmptyCatch({
    isProgressBarSticky: z.boolean().catch(true),
    isProgressShownAsPercentage: z.boolean().catch(true),
    sidePanelWidth: z.number().catch(uiDefaults.mainView.SIDE_PANEL_WIDTH),
    appVersion: z.string().catch(environment.PACKAGE_VERSION),
})
const defaultMainViewUIState = mainViewUiStateSchema.parse({})

/**
 * Parses the entity ID from the UI entry ID.
 *
 * e.g. `<uuid>.group-123` => `<uuid>`
 */
const parseEntityIdFromUiEntryId = (id: string) => id.replace(/\..+$/, '')

@Injectable({
    providedIn: 'root',
})
export class UiStateService {
    // @TODO: migrate to new reactive store proxy
    private sidebarUiState_ = new StorageItem('rockket-sidebar-ui-state', {
        schema: sidebarUiStateSchema.catch(defaultSidebarUiState),
    })
    get sidebarUiState() {
        if (!this.sidebarUiState_.value) return defaultSidebarUiState
        return this.sidebarUiState_.value
    }

    // @TODO: migrate to new reactive store proxy
    private mainViewUiState_ = new StorageItem('rockket-main-ui-state', {
        schema: mainViewUiStateSchema.catch(defaultMainViewUIState),
    })
    get mainViewUiState() {
        if (!this.mainViewUiState_.value) return defaultMainViewUIState
        return this.mainViewUiState_.value
    }
    updateMainViewStorage() {
        this.mainViewUiState_.markAsDirty()
    }

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

    updateMainViewSidePanel(width: number) {
        this.mainViewUiState.sidePanelWidth = width
        this.mainViewUiState_.markAsDirty()
    }
    updateShownAsPercentage(isShownAsPercentage: boolean) {
        this.mainViewUiState.isProgressShownAsPercentage = isShownAsPercentage
        this.mainViewUiState_.markAsDirty()
    }

    scheduleGarbageCollection(getIds: () => Observable<Set<string>>) {
        ;('requestIdleCallback' in globalThis ? requestIdleCallback : setTimeout)(() => {
            const now = new Date()
            const lastGarbageCollectedAt = this.treeUiState.value.lastGarbageCollectedAt
            if (lastGarbageCollectedAt) {
                const timeSinceLastGarbageCollectionInMs = now.getTime() - lastGarbageCollectedAt.getTime()
                const oneWeekInMs = 1000 * 60 * 60 * 24 * 7
                if (timeSinceLastGarbageCollectionInMs < oneWeekInMs) return
            }

            console.log('Running store garbage collection...')

            getIds()
                .pipe(take(1))
                .subscribe(ids => {
                    this.treeUiState.value.treeNodeCollapsedByIdSet.forEach(id => {
                        if (!ids.has(parseEntityIdFromUiEntryId(id))) {
                            this.treeUiState.value.treeNodeCollapsedByIdSet.delete(id)
                        }
                    })

                    this.treeUiState.value.treeNodeDescriptionCollapsedByIdSet.forEach(id => {
                        if (!ids.has(parseEntityIdFromUiEntryId(id))) {
                            this.treeUiState.value.treeNodeDescriptionCollapsedByIdSet.delete(id)
                        }
                    })

                    this.sidebarUiState.entityExpandedMap.forEach((_, id) => {
                        if (!ids.has(parseEntityIdFromUiEntryId(id))) {
                            this.sidebarUiState.entityExpandedMap.delete(id)
                        }
                    })

                    this.treeUiState.value.lastGarbageCollectedAt = now

                    this.treeUiState.markAsDirty()
                    this.sidebarUiState_.markAsDirty()
                    this.mainViewUiState_.markAsDirty()
                })
        })
    }

    treeUiState = new StorageItem('rockket-tree-ui-state', {
        schema: objectWithEmptyCatch({
            treeNodeCollapsedByIdSet: z.set(z.string()).catch(() => new Set<string>()),
            treeNodeDescriptionCollapsedByIdSet: z.set(z.string()).catch(() => new Set<string>()),
            viewSettings: viewSettingsSchema,
            lastGarbageCollectedAt: z.date({ coerce: true }).optional().catch(undefined),
        }),
        applyChanges(currentValue, newValueFromStore) {
            assignSet(currentValue.treeNodeCollapsedByIdSet, newValueFromStore.treeNodeCollapsedByIdSet)
            Object.assign(currentValue.viewSettings, newValueFromStore.viewSettings)

            return currentValue
        },
    })
    treeNodeExpandedStore = new ReactiveStoreProxy<string, boolean>({
        get: key => !this.treeUiState.value.treeNodeCollapsedByIdSet.has(key),
        set: (key, isExpanded) => {
            if (isExpanded) {
                this.treeUiState.value.treeNodeCollapsedByIdSet.delete(key)
            } else {
                this.treeUiState.value.treeNodeCollapsedByIdSet.add(key)
            }
            this.treeUiState.markAsDirty()
        },
        inputUpdatedNotifier$: this.treeUiState.storageChangedNotifier$.pipe(map(() => null)),
    })
    viewSettingsStore = new ReactiveStoreProxy<void, ViewSettings>({
        get: () => this.treeUiState.value.viewSettings,
        set: (_, value) => {
            this.treeUiState.value.viewSettings = value
            this.treeUiState.markAsDirty()
        },
        inputUpdatedNotifier$: this.treeUiState.storageChangedNotifier$.pipe(map(() => null)),
    })
    treeNodeDescriptionExpandedStore = new ReactiveStoreProxy<string, boolean>({
        get: key => this.treeUiState.value.treeNodeDescriptionCollapsedByIdSet.has(key),
        set: (key, isExpanded) => {
            if (isExpanded) {
                this.treeUiState.value.treeNodeDescriptionCollapsedByIdSet.add(key)
            } else {
                this.treeUiState.value.treeNodeDescriptionCollapsedByIdSet.delete(key)
            }
            this.treeUiState.markAsDirty()
        },
        inputUpdatedNotifier$: this.treeUiState.storageChangedNotifier$.pipe(map(() => null)),
    })
}

interface ReactiveStoreAdapter<TKey extends string | number | void, TValue> {
    get(key: TKey): TValue
    set(key: TKey, value: TValue): void
    inputUpdatedNotifier$: Observable<TKey | null>
}

/**
 * A reactive proxy for a key-value store that allows for listening to changes on specific keys or all keys.
 */
export class ReactiveStoreProxy<TKey extends string | number | void, TValue> {
    constructor(private adapter: ReactiveStoreAdapter<TKey, TValue>, private cacheObservables = true) {}

    get(key: TKey): TValue {
        return this.adapter.get(key)
    }

    set(key: TKey, value: TValue, notifySelf = true) {
        this.adapter.set(key, value)

        if (notifySelf) {
            this.selfNotifier$.next(key)
        }
    }

    /**
     * Listen to changes on a specific key in the store
     * @param key The key to listen to for changes
     */
    listen(key: TKey) {
        return this.createObservable(key)
    }

    /**
     * Listen to all changes in the store
     */
    listenAll(): Observable<void> {
        return this.createObservable(undefined, true)
    }

    private selfNotifier$ = new Subject<TKey>()
    private observables = new Map<TKey | symbol, Observable<TValue | void>>()
    private listenAllSymbol = Symbol('LISTEN ALL')

    private createObservable(key: TKey): Observable<TValue>
    private createObservable(key: void, listenToAll: true): Observable<void>
    private createObservable(key: TKey | void, listenToAll = false) {
        const observableKey = key ?? this.listenAllSymbol
        const cachedObservable = this.cacheObservables && this.observables.get(observableKey)
        if (cachedObservable) return cachedObservable

        const value$ = of(key).pipe(
            mergeWith(this.selfNotifier$),
            mergeWith(this.adapter.inputUpdatedNotifier$),
            filter(updatedId => {
                // If they updated with null, we should always return true
                // since we don't know what they did
                if (updatedId === null) return true

                // If the key is undefined, that means we want to listen to all updates
                if (!key) return true

                return updatedId == key
            }),
            map(() => {
                if (listenToAll) return undefined

                return this.get(key as TKey)
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
        )
        if (this.cacheObservables) this.observables.set(observableKey, value$)

        return value$
    }
}

/**
 * Creates a self-contained store without backend, i.e. no side-effects.
 *
 * **Key:** `void` (no key, only one value)
 *
 * Useful for mock scenarios, or when you only temporarily need a store and don't want to persist it.
 */
export const createLocalSingleValueStoreProxy = <TValue>(value: TValue) => {
    return new ReactiveStoreProxy<void, TValue>({
        get: () => value,
        set: (_, value_) => {
            value = value_
        },
        inputUpdatedNotifier$: EMPTY,
    })
}

/**
 * Creates a self-contained store without backend, i.e. no side-effects.
 *
 * **Key:** `string`
 *
 * Useful for mock scenarios, or when you only temporarily need a store and don't want to persist it.
 */
export const createLocalBooleanMapStoreProxy = (defaultValue = true) => {
    const expandedTasks = new Set<string>()
    return new ReactiveStoreProxy<string, boolean>({
        get: key => {
            return expandedTasks.has(key) ? !defaultValue : defaultValue
        },
        set: (key, value) => {
            if (value) {
                if (defaultValue) {
                    expandedTasks.delete(key)
                } else {
                    expandedTasks.add(key)
                }
            } else {
                if (!defaultValue) {
                    expandedTasks.delete(key)
                } else {
                    expandedTasks.add(key)
                }
            }
        },
        inputUpdatedNotifier$: EMPTY,
    })
}

/**
 * Assigns the values of the given set to the target set.
 *
 * I.e. works like `Object.assign()` but for sets, except that it also removes values that are not present in the source set.
 */
const assignSet = <T>(targetSet: Set<T>, sourceSet: Set<T>, deleteItemsNotPresentInSource = true) => {
    if (deleteItemsNotPresentInSource) {
        targetSet.forEach(value => {
            if (!sourceSet.has(value)) {
                targetSet.delete(value)
            }
        })
    }

    sourceSet.forEach(value => {
        targetSet.add(value)
    })
}
