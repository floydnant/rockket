import { inject } from '@angular/core'
import { Routes } from '@angular/router'
import { Store } from '@ngrx/store'
import { AuthGuard } from './guards/auth.guard'
import { AuthComponent } from './pages/auth/auth.component'
import { LoginLoadingComponent } from './pages/auth/login-loading/login-loading.component'
import { LoginComponent } from './pages/auth/login/login.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { DashboardComponent } from './pages/home/dashboard/dashboard.component'
import { EntityPageComponent } from './pages/home/entity-page/entity-page.component'
import { HomeComponent } from './pages/home/home.component'
import { LandingPageComponent } from './pages/landing-page/landing-page.component'
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component'
import { SettingsAccountComponent } from './pages/settings/account/account.component'
import { SettingsAppearanceComponent } from './pages/settings/appearance/appearance.component'
import { SettingsGeneralComponent } from './pages/settings/general/general.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { AppState } from './store'
import { getEntityById } from './store/entities/utils'
import { SearchComponent } from './pages/home/search/search.component'
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component'
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component'
import { ContactComponent } from './pages/contact/contact.component'
import { environment } from 'src/environments/environment'

const ENVIRONMENT_HINT = `[${environment.REVIEW_ID ? environment.REVIEW_ID + '-' : ''}${environment.CONTEXT}]`
const APP_TITLE = `Rockket ${environment.CONTEXT == 'Production' ? '' : ENVIRONMENT_HINT}`
const APP_TITLE_SUFFIX = `- ${APP_TITLE}`

export const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        pathMatch: 'full',
        title: APP_TITLE,
    },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
                title: `Login ${APP_TITLE_SUFFIX}`,
            },
            {
                path: 'signup',
                component: SignupComponent,
                title: `Signup ${APP_TITLE_SUFFIX}`,
            },
            {
                path: 'login-loading',
                component: LoginLoadingComponent,
                title: `Confirming Login... ${APP_TITLE_SUFFIX}`,
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
            { path: 'search', component: SearchComponent, title: `Search ${APP_TITLE_SUFFIX}` },
            {
                path: ':id',
                component: EntityPageComponent,
                title: route =>
                    inject(Store).select((state: AppState) => {
                        const activeEntityId = route.paramMap.get('id') as string
                        const activeEntity = getEntityById(state.entities.entityTree || [], activeEntityId)
                        return activeEntity ? `${activeEntity.title} ${APP_TITLE_SUFFIX}` : APP_TITLE
                    }),
            },
            { path: '', component: DashboardComponent, title: `Dashboard ${APP_TITLE_SUFFIX}` },
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
                title: `General Settings ${APP_TITLE_SUFFIX}`,
            },
            {
                path: 'account',
                component: SettingsAccountComponent,
                title: `Account Settings ${APP_TITLE_SUFFIX}`,
            },
            {
                path: 'appearance',
                component: SettingsAppearanceComponent,
                title: `Appearance Settings ${APP_TITLE_SUFFIX}`,
            },
        ],
    },
    {
        path: 'terms-of-service',
        component: TermsOfServiceComponent,
        title: `Terms of Service ${APP_TITLE_SUFFIX}`,
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
        title: `Privacy Policy ${APP_TITLE_SUFFIX}`,
    },
    {
        path: 'contact',
        component: ContactComponent,
        title: `Contact ${APP_TITLE_SUFFIX}`,
    },
    {
        path: 'playground',
        component: ComponentPlaygroundComponent,
        title: `Component Playground ${APP_TITLE_SUFFIX}`,
    },
    {
        path: '**',
        component: NotFoundPageComponent,
        title: `404 Not Found ${APP_TITLE_SUFFIX}`,
    },
]
