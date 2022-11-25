import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { AppState } from 'src/app/store'
import { userFeature } from 'src/app/store/user/user.selectors'

@Component({
    selector: 'user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent {
    constructor(private store: Store<AppState>) {}

    userState = this.store.select(userFeature)
}
