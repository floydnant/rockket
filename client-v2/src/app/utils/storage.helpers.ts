import { replacer, reviver } from './serialization.helpers'

interface StorageInterfaceOptions<T> {
    defaultValue?: T
    /** Will use `localStorage` by default. */
    storage?: 'localStorage' | 'sessionStorage'
    /** A key used in previous versions of the app to migrate from. */
    oldKey?: string
}

export class StorageItem<T> {
    constructor(private key: string, private options: StorageInterfaceOptions<T> = {}) {}

    private storage = window[this.options.storage || 'localStorage']

    private value_: T | null = null
    get value() {
        if (this.value_ === null) this.value_ = this.getParsedValue()

        return this.value_
    }
    set value(value: T | null) {
        this.value_ = value
        this.updateStorage()
    }

    /** Use this to manually update the storage item, when the `setter` cannot be triggered (e.g. when updating objects). */
    updateStorage() {
        if (this.value_ === null || this.value_ === undefined) {
            this.remove()
            return
        }

        this.storage.setItem(this.key, JSON.stringify(this.value_, replacer))
    }

    /** Remove the item from storage. */
    remove() {
        this.storage.removeItem(this.key)
    }

    private getParsedValue() {
        const raw = this.getRawValue()
        if (!raw) return this.options.defaultValue ?? null

        try {
            return JSON.parse(raw, reviver) as T
        } catch {
            return this.options.defaultValue ?? null
        }
    }

    private getRawValue() {
        if (!this.options.oldKey) return this.storage.getItem(this.key)

        const value = this.storage.getItem(this.options.oldKey)
        if (!value) return this.storage.getItem(this.key)

        this.storage.removeItem(this.options.oldKey)
        this.storage.setItem(this.key, value)
        return value
    }
}
