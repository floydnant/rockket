import { BreakpointObserver } from '@angular/cdk/layout'
import { Injectable } from '@angular/core'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import {
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    merge,
    share,
    shareReplay,
    startWith,
    throttleTime,
    timer,
} from 'rxjs'

export const mediaQueries = {
    mobileScreen: '(max-width: 768px)',
    mediumScreen: '(min-width: 930px)',
    touchPrimary: '(pointer: coarse)',
    canHover: '(hover:hover)',
}

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    constructor(private mediaObserver: BreakpointObserver) {}

    private queryChanges$ = this.mediaObserver.observe(Object.values(mediaQueries)).pipe(
        map(({ breakpoints }) => breakpoints),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    screenWidth$ = fromEvent(window, 'resize').pipe(
        coalesceWith(timer(100)),
        map(() => window.innerWidth),
        startWith(window.innerWidth),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    isMobileScreen$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.mobileScreen]),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    isMediumScreen$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.mediumScreen]),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    isTouchPrimary$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.touchPrimary]),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    canHover$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.canHover]),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    isOnline$ = merge(fromEvent(window, 'online'), fromEvent(window, 'offline')).pipe(
        map(() => navigator.onLine),
        startWith(navigator.onLine),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    isAppVisible$ = fromEvent(document, 'visibilitychange').pipe(
        map(() => document.visibilityState),
        startWith(document.visibilityState),
        map(visibilityState => visibilityState == 'visible'),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    shouldFetch$ = merge(this.isOnline$, this.isAppVisible$).pipe(
        distinctUntilChanged(),
        startWith(true),
        throttleTime(15000),
        filter(event => event == true),
        map((_, index) => index),
        share({ resetOnRefCountZero: true }),
    )
}
