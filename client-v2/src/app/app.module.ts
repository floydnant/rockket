import { ErrorHandler, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './pages/app.component'
import { DemoComponent } from './components/demo/demo.component'
import { TaskComponent } from './components/organisms/task/task.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { FocusableDirective } from './directives/focusable.directive'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { InputComponent } from './components/atoms/input/input.component'
import { FormComponent } from './components/molecules/form/form.component'
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
import { SettingsComponent } from './pages/settings/settings.component'
import { SettingsGeneralComponent } from './pages/settings/general/general.component'
import { SettingsAppearanceComponent } from './pages/settings/appearance/appearance.component'
import { SettingsAccountComponent } from './pages/settings/account/account.component'
import { AuthComponent } from './pages/auth/auth.component'
import { LoginLoadingComponent } from './pages/auth/login-loading/login-loading.component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { ModalModule } from './modal/modal.module'
import { IconsModule } from './components/atoms/icons/icons.module'
import { OverlayModule } from '@angular/cdk/overlay'
import { CdkTreeModule } from '@angular/cdk/tree'
import { EntityPageLabelComponent } from './components/atoms/entity-page-label/entity-page-label.component'
import { EntityPageComponent } from './pages/home/entity-page/entity-page.component'
import { BreadcrumbsComponent } from './components/molecules/breadcrumbs/breadcrumbs.component'
import { MainPaneComponent } from './components/templates/main-pane/main-pane.component'
import { MutationDirective } from './directives/mutation.directive'
import { MenuToggleComponent } from './components/templates/sidebar-layout/menu-toggle/menu-toggle.component'
import { DashboardComponent } from './pages/home/dashboard/dashboard.component'
import { EntityViewComponent } from './components/organisms/entity-view/entity-view.component'
import { TasklistViewComponent } from './components/organisms/entity-view/views/tasklist-view/tasklist-view.component'
import { EditableEntityTitleComponent } from './components/molecules/editable-entity-heading/editable-entity-title.component'
import { TaskTreeComponent } from './components/organisms/task-tree/task-tree.component'
import { TaskViewComponent } from './components/organisms/entity-view/views/task-view/task-view.component'
import { InlineEditorComponent } from './components/atoms/inline-editor/inline-editor.component'
import { PageProgressBarComponent } from './components/molecules/page-progress-bar/page-progress-bar.component'
import { LayoutModule } from '@angular/cdk/layout'
import { IntersectionDirective } from './directives/intersection.directive'
import { EntityDescriptionComponent } from './components/molecules/entity-description/entity-description.component'
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js'
import { SearchComponent } from './pages/home/search/search.component'
import { HighlightPipe } from './pipes/highlight.pipe'
import { TaskNestingDemoComponent } from './pages/landing-page/demos/task-nesting-demo.component'
import { TaskPriorityDemoComponent } from './pages/landing-page/demos/task-priority-demo.component'
import { TaskStatusDemoComponent } from './pages/landing-page/demos/task-status-demo.component'
import { TaskDescriptionDemoComponent } from './pages/landing-page/demos/task-description-demo.component'
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component'
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component'
import { ContactComponent } from './pages/contact/contact.component'
import { RxModule } from './rx/rx.module'
import { TooltipModule } from './tooltip/tooltip.module'
import { DropdownModule } from './dropdown/dropdown.module'
import { KeyboardModule } from './keyboard/keyboard.module'

@NgModule({
    declarations: [
        AppComponent,
        DemoComponent,
        TaskComponent,
        ComponentPlaygroundComponent,
        FocusableDirective,
        InputComponent,
        FormComponent,
        LoginComponent,
        SignupComponent,
        UserMenuComponent,
        SidebarLayoutComponent,
        HomeComponent,
        CenteredLayoutComponent,
        LandingPageComponent,
        NotFoundPageComponent,
        TasksDemoComponent,
        SettingsComponent,
        SettingsGeneralComponent,
        SettingsAppearanceComponent,
        SettingsAccountComponent,
        AuthComponent,
        LoginLoadingComponent,
        EntityPageLabelComponent,
        EntityPageComponent,
        BreadcrumbsComponent,
        MainPaneComponent,
        MutationDirective,
        MenuToggleComponent,
        DashboardComponent,
        EntityViewComponent,
        TasklistViewComponent,
        EditableEntityTitleComponent,
        TaskTreeComponent,
        TaskViewComponent,
        InlineEditorComponent,
        PageProgressBarComponent,
        IntersectionDirective,
        EntityDescriptionComponent,
        SearchComponent,
        HighlightPipe,
        TaskNestingDemoComponent,
        TaskPriorityDemoComponent,
        TaskStatusDemoComponent,
        TaskDescriptionDemoComponent,
        TermsOfServiceComponent,
        PrivacyPolicyComponent,
        ContactComponent,
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
            warning: {
                iconTheme: { primary: 'var(--secondary-400)', secondary: 'var(--tinted-900)' },
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
        CdkMenuModule,
        IconsModule,
        ModalModule,
        OverlayModule,
        CdkTreeModule,
        LayoutModule,
        RxModule,
        TooltipModule,
        DropdownModule,
        KeyboardModule,
    ],
    providers: [
        {
            provide: ErrorHandler,
            useClass: ApplicationinsightsAngularpluginErrorService,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
