import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LoginComponent } from './pages/auth/login/login.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { HomeComponent } from './pages/home/home.component'

const routes: Routes = [
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
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
