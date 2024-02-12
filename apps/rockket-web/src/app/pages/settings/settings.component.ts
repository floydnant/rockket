import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { map, Observable, switchMap } from 'rxjs'
import { Breadcrumb } from 'src/app/components/molecules/breadcrumbs/breadcrumbs.component'

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: [],
})
export class SettingsComponent {
    constructor(private route: ActivatedRoute) {}

    pathBreadcrumbMap: Record<string, Breadcrumb> = {
        general: { title: 'General', route: '/settings/general', icon: 'settings' },
        account: { title: 'Account', route: '/settings/account', icon: 'user' },
        appearance: { title: 'Appearance', route: '/settings/appearance', icon: 'eye' },
    }
    settingsPages = Object.values(this.pathBreadcrumbMap)

    breadcrumbs$: Observable<Breadcrumb[]> = this.route.url.pipe(
        switchMap(() => {
            const routes = this.route.pathFromRoot
            const lastChild = routes[routes.length - 1].children[0]

            return lastChild.url
        }),
        map(segments => {
            const path = segments[segments.length - 1].path as keyof typeof this.pathBreadcrumbMap
            const breadcrumb = this.pathBreadcrumbMap[path]

            return [{ title: 'Settings', route: '/settings', icon: 'settings' }, breadcrumb]
        }),
    )
}
