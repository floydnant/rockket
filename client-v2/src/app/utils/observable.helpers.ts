import { Observable, switchMap, of, first, filter, map } from 'rxjs'

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
