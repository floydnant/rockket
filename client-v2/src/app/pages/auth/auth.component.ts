import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { LoginLoadingComponent } from './login-loading/login-loading.component'
import { LoginComponent } from './login/login.component'
import { SignupComponent } from './signup/signup.component'

@Component({
    template: '<router-outlet (activate)="onActivate($event)"></router-outlet>',
    styles: [],
})
export class AuthComponent {
    constructor(private router: Router) {
        const defaultRouteAfterLogin = '/home'
        this.callbackUrl = this.router.parseUrl(this.router.url).queryParams['callback'] || defaultRouteAfterLogin
    }
    callbackUrl: string

    onActivate(component: LoginComponent | SignupComponent | LoginLoadingComponent) {
        component.callbackUrl = this.callbackUrl
    }
}
