import { isTruthy } from '@rockket/commons'
import {
    Subject,
    animationFrames,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    merge,
    mergeWith,
    of,
    share,
    skip,
    startWith,
    switchMap,
    tap,
    timer,
} from 'rxjs'
import { replacer, reviver } from './serialization.helpers'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import { debugObserver, idleCallback$ } from './observable.helpers'
import { colors } from '../shared/colors'

type BaseStorageRepositoryOptions = {
    /** Will use `localStorage` by default. */
    storage?: 'localStorage' | 'sessionStorage'
    /** A key used in previous versions of the app to migrate from. */
    oldKey?: string

    replacer?: typeof replacer
    reviver?: typeof reviver

    debugLogs?: boolean
}

type StorageInterfaceOptions<T> = BaseStorageRepositoryOptions & { defaultValue?: T }

// {viewId}.{entityContextId}.{entityId}.{entryId}
const workbenchStorage = {
    workbench: {
        '<entityContextId>': {
            '<entityId>': {
                isDescriptionExpanded: true,
                isSubtasksExpanded: true,
                descriptionHeight: 40, // if resizing the description is going to be supported
            },
        },
    },
    wb_: new Map<
        `${string}.${string}`,
        {
            isDescriptionExpanded: true
            isSubtasksExpanded: true
            descriptionHeight: 40 // if resizing the description is going to be supported
        }
    >(),

    isProgressBarSticky: true,
    isProgressShownAsPercentage: true,

    entityExpandedMap: new Map<string, boolean>(),
    taskTreeDescriptionExpandedMap: new Map<string, boolean>(),
    sidePanelWidth: 300,
}

export class MapStorageRepository<T, TKeyBuilderArgs extends unknown[]> {
    constructor(
        key: string,
        private makeKey: (...args: TKeyBuilderArgs) => string,
        private defaultValue: T,
        options?: BaseStorageRepositoryOptions,
    ) {
        this.storageItem = new StorageItem(key, {
            ...options,
            defaultValue: new Map(),
        })
    }

    private storageItem: StorageItem<Map<string, T>>

    get(...args: TKeyBuilderArgs) {
        const key = this.makeKey(...args)
        return this.storageItem.value?.get(key) ?? this.defaultValue
    }

    set(value: T, ...args: TKeyBuilderArgs) {
        const key = this.makeKey(...args)
        this.storageItem.value ??= new Map()
        this.storageItem.value.set(key, value)
        this.storageItem.markAsDirty()
    }

    observe(...args: TKeyBuilderArgs) {
        const key = this.makeKey(...args)
        return this.storageItem.value$.pipe(
            map(value => value?.get(key) ?? this.defaultValue),
            distinctUntilChanged(),
        )
    }
}

export class StorageItem<T> {
    constructor(private key: string, private options: StorageInterfaceOptions<T> = {}) {}

    private storage = window[this.options.storage || 'localStorage']

    private value_: T | null = null
    get value() {
        if (this.value_ === null) this.value_ = this.getValue()

        return this.value_
    }
    set value(value: T | null) {
        this.value_ = value
        this.markAsDirty()
    }

    /**
     * - Fires when the storage is modified from another window.
     * - Does not fire if the change was made from the same window.
     */
    onStorageChanges$ = fromEvent<StorageEvent>(window, 'storage').pipe(
        filter(event => event.key == this.key),
        map(event => event.newValue),
        distinctUntilChanged(),
        filter(isTruthy),
        tap(() => {
            this.debugLog('storage changed', colors.primary[300])
        }),
        map(newValue => this.parseValue(newValue)),
        share({ resetOnRefCountZero: true }),
    )

    /** Use this to manually update the storage item, when the `setter` cannot be triggered (e.g. when updating objects). */
    markAsDirty() {
        this.debugLog('marked as dirty', colors.secondary[400])
        this.onMarkedAsDirty$.next()
    }
    private onMarkedAsDirty$ = new Subject<void>()
    private coalescedDirt$ = this.onMarkedAsDirty$.pipe(coalesceWith(timer(1000)))

    /**
     * Use this to force flush the storage item.
     *
     * You usually don't need to call this method, as the storage item will be
     * flushed automatically after a short delay when it's marked as dirty.
     * This is useful when you need to skip the throttling and have the changes flushed sooner.
     */
    flush() {
        this.onForceFlush$.next()
    }
    private onForceFlush$ = new Subject<void>()

    private _onFlushSubscription_ = this.onForceFlush$
        .pipe(
            startWith(null),
            switchMap(() => merge(of(null), this.coalescedDirt$)),
            skip(1),
            coalesceWith(timer(0).pipe(switchMap(() => idleCallback$))),
        )
        .subscribe(() => {
            if (this.value_ === null || this.value_ === undefined) {
                this.debugLog('removing key', colors.danger[400])
                this.remove()

                return
            }

            this.debugLog('flushing', colors.submit[400])
            this.storage.setItem(this.key, this.stringifyValue(this.value_))
        })

    value$ = merge(this.onStorageChanges$, this.onMarkedAsDirty$.pipe(map(() => this.value))).pipe(
        coalesceWith(animationFrames()),
        startWith(this.value),
    )

    /** Remove the item from storage. */
    remove() {
        this.storage.removeItem(this.key)
    }

    private stringifyValue(value: T): string {
        return JSON.stringify(value, this.options.replacer || replacer)
    }
    private parseValue(value: string) {
        try {
            return JSON.parse(value, this.options.reviver || reviver) as T
        } catch {
            return this.options.defaultValue ?? null
        }
    }
    private getValue() {
        const raw = this.getRawValue()
        if (!raw) return this.options.defaultValue ?? null

        return this.parseValue(raw)
    }

    private getRawValue() {
        if (!this.options.oldKey) return this.storage.getItem(this.key)

        const value = this.storage.getItem(this.options.oldKey)
        if (!value) return this.storage.getItem(this.key)

        this.storage.removeItem(this.options.oldKey)
        this.storage.setItem(this.key, value)
        return value
    }

    private debugLog(message: string, color?: string) {
        if (!this.options.debugLogs) return

        console.log(
            `%cstorage: %c${this.key} %c${message}`,
            'color:' + colors.tinted[400],
            '',
            color ? 'color:' + color : '',
        )
    }
}

// const myStorage = new StorageItem('myStorage', {
//     storage: 'sessionStorage',
//     defaultValue: new Map<
//         `${string}.${string}`,
//         {
//             isDescriptionExpanded: boolean
//             isSubtasksExpanded: boolean
//             descriptionHeight: number // if resizing the description is going to be supported
//         }
//     >(),
// })
const workbenchTaskEntityUiStateRepo = new MapStorageRepository(
    'myStorage',
    (entityContextId: string | null | undefined, entityId: string) => {
        return `${entityContextId || '<root>'}.${entityId}`
    },
    {
        isSubtasksExpanded: true,
        isDescriptionExpanded: true,
        descriptionHeight: 40,
    },
    { storage: 'sessionStorage' },
)

// const value = workbenchTaskEntityUiStateRepo.get('entityContextId', 'entityId')
// const value$ = workbenchTaskEntityUiStateRepo.observe('entityContextId', 'entityId')
// workbenchTaskEntityUiStateRepo.set(value, 'entityContextId', 'entityId')
