import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LoginComponent } from './pages/auth/login/login.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { HomeComponent } from './pages/home/home.component'
import { LandingPageComponent } from './pages/landing-page/landing-page.component'
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component'

const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        pathMatch: 'full',
    },
    {
        path: 'auth/login',
        component: LoginComponent,
    },
    {
        path: 'auth/signup',
        component: SignupComponent,
    },
    {
        path: 'auth',
        pathMatch: 'full',
        redirectTo: 'auth/login',
    },
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'playground',
        component: ComponentPlaygroundComponent,
    },
    {
        path: '**',
        component: NotFoundPageComponent,
    },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
