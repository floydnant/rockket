import { isTruthy, jsonStringSchema } from '@rockket/commons'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    animationFrames,
    debounce,
    distinctUntilKeyChanged,
    filter,
    fromEvent,
    map,
    merge,
    share,
    startWith,
    Subject,
    Subscription,
    switchMap,
    tap,
    timer,
} from 'rxjs'
import { z } from 'zod'
import { colors } from '../shared/colors'
import { idleCallback$ } from './observable.helpers'
import { replacer, reviver } from './serialization.helpers'

type StorageItemOptions<TSchema extends z.Schema> = {
    schema: TSchema
    /** @default localStorage */
    storage?: Storage
    /** A key used in previous versions of the app to migrate from. */
    oldKey?: string

    /**
     * A function that is called when the storage item is updated from another window to apply changes to our local value.
     */
    applyChanges?: (currentValue: z.infer<TSchema>, newValueFromStore: z.infer<TSchema>) => z.infer<TSchema>

    /**
     * Whether to automatically update the value when the storage was updated from another window.
     * @default true
     */
    autoUpdateOnStorageChange?: boolean

    /** @default 500ms */
    persistenceDebounceDuration?: number

    debugLogs?: boolean
}

export class StorageItem<TSchema extends z.Schema> {
    constructor(private key: string, private options: StorageItemOptions<TSchema>) {}

    private storage = this.options.storage || localStorage

    private value_: z.infer<TSchema> | null = null
    get value(): z.infer<TSchema> {
        if (this.value_ === null) this.value_ = this.parseValue(this.getRawValue() || '')

        return this.value_
    }
    set value(value: z.infer<TSchema>) {
        this.value_ = value
        this.markAsDirty()
    }

    private subscription = new Subscription()
    /** Unsubscribe from internal observables */
    destroy() {
        this.subscription.unsubscribe()
    }

    /**
     * Use this to schedule persisting of the storage item.
     *
     * A short delay (default: 500ms), followed by an idle callback is used to debounce multiple calls.
     */
    markAsDirty(notifySelf = false) {
        this.debugLog('marked as dirty', colors.secondary[400])
        this.isDirty = true
        this.onMarkedAsDirty$.next({ notifySelf })
    }
    /** Use this to cancel previously scheduled persistence by `markAsDirty()`. */
    markAsClean() {
        this.isDirty = false
    }
    private isDirty = false
    private onMarkedAsDirty$ = new Subject<{ notifySelf: boolean }>()

    private _onPersist_ = this.subscription.add(
        this.onMarkedAsDirty$
            .pipe(
                debounce(() =>
                    timer(this.options.persistenceDebounceDuration ?? 500).pipe(
                        switchMap(() => idleCallback$),
                    ),
                ),
                filter(() => this.isDirty),
            )
            .subscribe(() => {
                this.persist()
            }),
    )

    /**
     * - Fires when the storage is modified from another window.
     * - Does not fire if the change was made from the same window.
     */
    storageChangedNotifier$ = fromEvent<StorageEvent>(window, 'storage').pipe(
        filter(event => event.key == this.key),
        distinctUntilKeyChanged('newValue'),
        map(event => isTruthy(event.newValue) && this.parseValue(event.newValue)),
        filter(isTruthy),
        tap(() => {
            this.debugLog('storage changed', colors.primary[300])
        }),
        share({ resetOnRefCountZero: true }),
    )
    private _onStoreChanged_ =
        this.options.autoUpdateOnStorageChange !== false &&
        this.subscription.add(
            this.storageChangedNotifier$.subscribe(value => {
                if (this.options.applyChanges) {
                    this.value_ = this.options.applyChanges(this.value, value)
                } else {
                    this.value_ = value
                }
            }),
        )

    value$ = merge(
        this.storageChangedNotifier$,
        this.onMarkedAsDirty$.pipe(
            filter(({ notifySelf }) => notifySelf),
            map(() => this.value),
        ),
    ).pipe(
        coalesceWith(animationFrames()), // @TODO: Not sure about this one
        startWith(this.value),
    )

    /**
     * Use this to force persist the storage item.
     *
     * You usually shouldn't call this method directly, as the storage item will be
     * persisted after a short delay when it's marked as dirty to avoid unnecessary writes.
     *
     * It's useful when you need to skip the throttling and want changes persisted sooner.
     * (e.g. when the app is closing)
     */
    persist() {
        this.debugLog('persisting', colors.submit[400])
        this.storage.setItem(this.key, JSON.stringify(this.value_, replacer))
        this.markAsClean()
    }
    persistIfDirty() {
        if (this.isDirty) this.persist()
        else this.debugLog("not persisting because item isn't dirty", colors.submit[400])
    }

    /** Remove the item from storage. */
    remove() {
        this.storage.removeItem(this.key)
    }

    private parseValue(raw: string) {
        const result = jsonStringSchema(reviver).catch(undefined).pipe(this.options.schema).safeParse(raw)
        if (result.success) return result.data

        console.error(`Failed to parse storage item: ${this.key}`)
        return null
    }

    private getRawValue() {
        this.debugLog('getting value', colors.primary[300])
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
