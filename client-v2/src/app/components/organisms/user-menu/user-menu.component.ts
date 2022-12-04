import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { AppState } from 'src/app/store'
import { authActions } from 'src/app/store/user/user.actions'
import { userFeature } from 'src/app/store/user/user.selectors'
import { MenuItem, MenuItemVariant } from '../../molecules/drop-down/drop-down.component'

@Component({
    selector: 'user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent {
    constructor(private store: Store<AppState>) {}

    userState = this.store.select(userFeature)

    menuItems: MenuItem[] = [
        {
            title: 'Workspace',
            route: '/home',
        },
        {
            title: 'Settings',
            route: '/settings',
            children: [
                { title: 'General', route: '/settings/general' },
                { title: 'Account', route: '/settings/account' },
                { title: 'Appearance', route: '/settings/appearance' },
            ],
        },
        { isSeperator: true },
        { title: 'Logout', action: () => this.store.dispatch(authActions.logout()), variant: MenuItemVariant.DANGER },
    ]
}
