import { Observable, filter, first, map, of, switchMap, tap } from 'rxjs'
import { TapObserver } from 'rxjs/internal/operators/tap'

/** Wraps the `filter()` operator to enable predicates with Observable results. */
export const filterWith = <T>(predicate: (value: T) => boolean | Observable<boolean>) => {
    return (source: Observable<T>) =>
        source.pipe(
            switchMap(value => {
                const predicateResult = predicate(value)
                const shouldPass$ =
                    typeof predicateResult == 'boolean' ? of(predicateResult) : predicateResult

                return shouldPass$.pipe(
                    first(),
                    filter(shouldPass => shouldPass),
                    map(() => value),
                )
            }),
        )
}

export const debugObserver = <T>(
    name: string,
    {
        subscribe = true,
        unsubscribe = true,
        next = true,
        error = true,
        complete = true,
        finalize = false,
    }: Partial<Record<keyof TapObserver<unknown>, boolean>> = {} as never,
) =>
    tap<T>({
        subscribe: !subscribe
            ? undefined
            : () => console.log(`🧩 %csubscribed to %c${name}`, 'color:gray', ''),
        unsubscribe: !unsubscribe
            ? undefined
            : () => console.log(`👋 %cunsubscribed from %c${name}`, 'color:gray', ''),
        next: !next ? undefined : value => console.log(`🚀 %cnext %c${name}`, 'color:gray', '', { value }),
        error: !error ? undefined : error => console.log(`🚨 %cerror %c${name}`, 'color:gray', '', { error }),
        complete: !complete ? undefined : () => console.log(`✅ %ccomplete %c${name}`, 'color:gray', ''),
        finalize: !finalize ? undefined : () => console.log(`🏁 %cfinalize %c${name}`, 'color:gray', ''),
    })
