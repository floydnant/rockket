import { jsonStringSchema } from '@rockket/commons'
import { z } from 'zod'
import { replacer, reviver } from './serialization.helpers'

interface StorageInterfaceOptions<TSchema extends z.Schema> {
    defaultValue?: z.infer<TSchema>
    /** Will use `localStorage` by default. */
    storage?: Storage
    /** A key used in previous versions of the app to migrate from. */
    oldKey?: string
    schema?: TSchema
}

export class StorageItem<TSchema extends z.Schema> {
    constructor(private key: string, private options: StorageInterfaceOptions<TSchema> = {}) {}

    private storage = this.options.storage || localStorage

    private value_: z.infer<TSchema> | null = null
    get value(): z.infer<TSchema> {
        if (this.value_ === null) this.value_ = this.getParsedValue()

        return this.value_
    }
    set value(value: z.infer<TSchema> | null) {
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
        const raw = this.getRawValue() || ''

        let schema: z.Schema = this.options.schema || z.unknown()
        if (this.options.defaultValue)
            schema = schema?.default(this.options.defaultValue).catch(this.options.defaultValue)

        try {
            return jsonStringSchema(reviver).pipe(schema).parse(raw) as z.infer<TSchema>
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
