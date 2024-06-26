import { inject } from '@angular/core'
import { Routes } from '@angular/router'
import { Store } from '@ngrx/store'
import { environment } from 'src/environments/environment'
import { AuthGuard } from './guards/auth.guard'
import { AuthComponent } from './pages/auth/auth.component'
import { LoginLoadingComponent } from './pages/auth/login-loading/login-loading.component'
import { LoginComponent } from './pages/auth/login/login.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { ContactComponent } from './pages/contact/contact.component'
import { DashboardComponent } from './pages/home/dashboard/dashboard.component'
import { EntityPageComponent } from './pages/home/entity-page/entity-page.component'
import { HomeComponent } from './pages/home/home.component'
import { SearchComponent } from './pages/home/search/search.component'
import { LandingPageComponent } from './pages/landing-page/landing-page.component'
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component'
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component'
import { SettingsAccountComponent } from './pages/settings/account/account.component'
import { SettingsAppearanceComponent } from './pages/settings/appearance/appearance.component'
import { SettingsGeneralComponent } from './pages/settings/general/general.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component'
import { AppState } from './store'
import { getEntityById } from './store/entities/utils'

const environmentHint = `[${environment.REVIEW_ID ? environment.REVIEW_ID + '-' : ''}${environment.CONTEXT}]`
const appTitle = 'Rockket' + environment.isProduction ? '' : ' ' + environmentHint
const appTitleSuffix = `- ${appTitle}`

export const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        pathMatch: 'full',
        title: appTitle,
    },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
                title: `Login ${appTitleSuffix}`,
            },
            {
                path: 'signup',
                component: SignupComponent,
                title: `Signup ${appTitleSuffix}`,
            },
            {
                path: 'login-loading',
                component: LoginLoadingComponent,
                title: `Confirming Login... ${appTitleSuffix}`,
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'login',
            },
        ],
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'search', component: SearchComponent, title: `Search ${appTitleSuffix}` },
            {
                path: ':id',
                component: EntityPageComponent,
                title: route =>
                    inject(Store).select((state: AppState) => {
                        const activeEntityId = route.paramMap.get('id') as string
                        const activeEntity = getEntityById(state.entities.entityTree || [], activeEntityId)
                        return activeEntity ? `${activeEntity.title} ${appTitleSuffix}` : appTitle
                    }),
            },
            { path: '', component: DashboardComponent, title: `Dashboard ${appTitleSuffix}` },
        ],
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'general',
            },
            {
                path: 'general',
                component: SettingsGeneralComponent,
                title: `General Settings ${appTitleSuffix}`,
            },
            {
                path: 'account',
                component: SettingsAccountComponent,
                title: `Account Settings ${appTitleSuffix}`,
            },
            {
                path: 'appearance',
                component: SettingsAppearanceComponent,
                title: `Appearance Settings ${appTitleSuffix}`,
            },
        ],
    },
    {
        path: 'terms-of-service',
        component: TermsOfServiceComponent,
        title: `Terms of Service ${appTitleSuffix}`,
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        title: `Privacy Policy ${appTitleSuffix}`,
    },
    {
        path: 'contact',
        component: ContactComponent,
        title: `Contact ${appTitleSuffix}`,
    },
    {
        path: 'playground',
        component: ComponentPlaygroundComponent,
        title: `Component Playground ${appTitleSuffix}`,
    },
    {
        path: '**',
        component: NotFoundPageComponent,
        title: `404 Not Found ${appTitleSuffix}`,
    },
]
