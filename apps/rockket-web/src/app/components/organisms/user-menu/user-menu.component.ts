import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { AppState } from 'src/app/store'
import { authActions } from 'src/app/store/user/user.actions'
import { userFeature } from 'src/app/store/user/user.selectors'
import { MenuItem, MenuItemVariant } from '../../../dropdown/drop-down/drop-down.component'

@Component({
    selector: 'app-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent {
    constructor(private store: Store<AppState>) {}

    userState$ = this.store.select(userFeature)

    menuItems: MenuItem[] = [
        {
            title: 'Workspace',
            icon: 'workspace',
            route: '/home',
        },
        {
            title: 'Settings',
            icon: 'settings',
            route: '/settings',
            children: [
                { title: 'General', route: '/settings/general', icon: 'settings' },
                { title: 'Account', route: '/settings/account', icon: 'user' },
                { title: 'Appearance', route: '/settings/appearance', icon: 'eye' },
            ],
        },
        // {
        //     title: 'Import',
        //     icon: 'fas fa-file-import' as IconKey,
        // },
        // {
        //     title: 'Garbage',
        //     icon: 'fas fa-trash' as IconKey,
        // },
        { isSeparator: true },
        {
            title: 'Logout',
            icon: 'logout',
            action: () => this.store.dispatch(authActions.logout()),
            variant: MenuItemVariant.DANGER,
        },
    ]
}
