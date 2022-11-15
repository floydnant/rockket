import { Component } from '@angular/core'

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
    settingsPages: SettingsPageItem[] = [
        {
            route: 'general',
            iconClass: 'fas fa-cog',
            title: 'General',
        },
        {
            route: 'account',
            iconClass: 'fas fa-user',
            title: 'Accunt',
        },
        {
            route: 'appearance',
            iconClass: 'fas fa-eye',
            title: 'Appearance',
        },
    ]
}
