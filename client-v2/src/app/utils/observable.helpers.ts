import { EventEmitter } from '@angular/core'
import { Observable, switchMap, of, first, filter, map, tap, takeUntil } from 'rxjs'

/** Wraps the `filter()` operator to enable predicates with Observable results. */
export const filterWith = <T>(predicate: (value: T) => boolean | Observable<boolean>) => {
    return (source: Observable<T>) =>
        source.pipe(
            switchMap(value => {
                const predicateResult = predicate(value)
                const shouldPass$ = typeof predicateResult == 'boolean' ? of(predicateResult) : predicateResult

                return shouldPass$.pipe(
                    first(),
                    filter(shouldPass => shouldPass),
                    map(() => value)
                )
            })
        )
}

export const createEventEmitter = <T>(
    value$: Observable<T>,
    options?: {
        until$?: Observable<unknown>
        isAsync?: boolean
    }
): EventEmitter<T> => {
    const emitter = new EventEmitter<T>(options?.isAsync === true)

    value$.pipe(options?.until$ ? takeUntil(options.until$) : tap()).subscribe(value => emitter.emit(value))

    return emitter
}
