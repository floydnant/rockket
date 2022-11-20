import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DemoComponent } from './components/demo/demo.component'
import { TaskComponent } from './components/organisms/task/task.component'
import { StatusIconComponent } from './components/atoms/icons/status-icon/status-icon.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { IconComponent } from './components/atoms/icons/icon/icon.component'
import { FocusableDirective } from './directives/focusable.directive'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { DoubleEllipsisIconComponent } from './components/atoms/icons/double-ellipsis-icon/double-ellipsis-icon.component'
import { PriorityIconComponent } from './components/atoms/icons/priority-icon/priority-icon.component'
import { InputComponent } from './components/atoms/input/input.component'
import { FormComponent } from './components/molecules/form/form.component'
import { LoadingSpinnerComponent } from './components/atoms/icons/loading-spinner/loading-spinner.component'
import { LoginComponent } from './pages/auth/login/login.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { HttpModule } from './http/http.module'
import { HotToastModule } from '@ngneat/hot-toast'
import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { reducers, metaReducers, effects } from './store'
import { EffectsModule } from '@ngrx/effects'
import { environment } from 'src/environments/environment'
import { UserMenuComponent } from './components/organisms/user-menu/user-menu.component'
import { SidebarLayoutComponent } from './components/templates/sidebar-layout/sidebar-layout.component'
import { HomeComponent } from './pages/home/home.component'
import { CenteredLayoutComponent } from './components/templates/centered-layout/centered-layout.component'
import { LandingPageComponent } from './pages/landing-page/landing-page.component'
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component'
import { TasksDemoComponent } from './pages/component-playground/tasks-demo/tasks-demo.component'
import { PageEntityIconComponent } from './components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { SettingsGeneralComponent } from './pages/settings/general/general.component'
import { SettingsAppearanceComponent } from './pages/settings/appearance/appearance.component'
import { SettingsAccountComponent } from './pages/settings/account/account.component'
import { AuthComponent } from './pages/auth/auth.component'
import { LoginLoadingComponent } from './pages/auth/login-loading/login-loading.component'

@NgModule({
    declarations: [
        AppComponent,
        DemoComponent,
        TaskComponent,
        StatusIconComponent,
        ComponentPlaygroundComponent,
        IconComponent,
        FocusableDirective,
        DoubleEllipsisIconComponent,
        PriorityIconComponent,
        InputComponent,
        FormComponent,
        LoadingSpinnerComponent,
        LoginComponent,
        SignupComponent,
        UserMenuComponent,
        SidebarLayoutComponent,
        HomeComponent,
        CenteredLayoutComponent,
        LandingPageComponent,
        NotFoundPageComponent,
        TasksDemoComponent,
        PageEntityIconComponent,
        SettingsComponent,
        SettingsGeneralComponent,
        SettingsAppearanceComponent,
        SettingsAccountComponent,
        AuthComponent,
        LoginLoadingComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpModule,
        HotToastModule.forRoot({
            success: {
                iconTheme: { primary: 'var(--submit-400)', secondary: 'var(--tinted-900)' },
            },
            loading: {
                iconTheme: { primary: 'var(--tinted-400)', secondary: 'transparent' },
            },
            error: {
                iconTheme: { primary: 'var(--danger-400)', secondary: 'var(--tinted-900)' },
            },
            style: {
                background: 'var(--tinted-800)',
                color: 'var(--tinted-100)',
                borderRadius: '10px',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 10px rgba(0, 0, 0, 0.25)',
            },
        }),
        StoreModule.forRoot(reducers, {
            metaReducers,
        }),
        EffectsModule.forRoot(effects),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
