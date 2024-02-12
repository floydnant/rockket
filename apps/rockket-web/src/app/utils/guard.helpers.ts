import { Router } from '@angular/router'

/** Check if the currently active route is using the specified guard.
 *
 * **Note:** Only works with root level routes, not with child routes */
export const isActiveRouteUsingGuard = (
    router: Router,
    // eslint-disable-next-line @typescript-eslint/ban-types
    /** The RouteGuard to check for */ guard: Function,
) => {
    const currentRoutePath = router.url.match(/^\/\w+/)?.[0].replace(/\//, '')
    const currentRouteConfig = router.config.find(route => route.path == currentRoutePath)

    const usesAuthGuard =
        currentRouteConfig?.canActivate?.some(routeGuard => routeGuard instanceof guard) || false

    return usesAuthGuard
}
