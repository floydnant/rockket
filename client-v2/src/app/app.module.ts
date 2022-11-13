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
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        HttpModule,
        HotToastModule.forRoot(),
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
