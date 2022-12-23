import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { map, switchMap } from 'rxjs'

interface SettingsPageItem {
    route: string
    iconClass: string
    title: string
}

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: [],
})
export class SettingsComponent {
    constructor(private route: ActivatedRoute) {}

    settingsPages: SettingsPageItem[] = [
        {
            route: 'general',
            iconClass: 'fas fa-cog',
            title: 'General',
        },
        {
            route: 'account',
            iconClass: 'fas fa-user',
            title: 'Account',
        },
        {
            route: 'appearance',
            iconClass: 'fas fa-eye',
            title: 'Appearance',
        },
    ]

    pathBreadcrumbMap = {
        general: { title: 'General', route: '/settings/general', icon: 'fas fa-cog' },
        account: { title: 'Account', route: '/settings/account', icon: 'fas fa-user' },
        appearance: { title: 'Appearance', route: '/settings/appearance', icon: 'fas fa-eye' },
    }

    breadcrumbs$ = this.route.url.pipe(
        switchMap(() => {
            const routes = this.route.pathFromRoot
            const lastChild = routes[routes.length - 1].children[0]

            return lastChild.url
        }),
        map(segments => {
            const path = segments[segments.length - 1].path as keyof typeof this.pathBreadcrumbMap
            const breadcrumb = this.pathBreadcrumbMap[path]

            return [{ title: 'Settings', route: '/settings', icon: 'fas fa-cog' }, breadcrumb]
        })
    )
}
