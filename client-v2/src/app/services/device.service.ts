import { BreakpointObserver } from '@angular/cdk/layout'
import { Injectable } from '@angular/core'
import { map, shareReplay } from 'rxjs'

const mediaQueries = {
    mobileScreen: '(max-width: 768px)',
    touchPrimary: '(pointer: coarse)',
    canHover: '(hover:hover)',
}

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    constructor(private mediaObserver: BreakpointObserver) {}

    queryChanges$ = this.mediaObserver.observe(Object.values(mediaQueries)).pipe(
        map(({ breakpoints }) => breakpoints),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    isMobileScreen$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.mobileScreen]),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    isTouchPrimary$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.touchPrimary]),
        shareReplay({ bufferSize: 1, refCount: true })
    )
    canHover$ = this.queryChanges$.pipe(
        map(queryMap => queryMap[mediaQueries.canHover]),
        shareReplay({ bufferSize: 1, refCount: true })
    )
}
