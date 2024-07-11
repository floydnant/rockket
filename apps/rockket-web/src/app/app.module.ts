import { LayoutModule } from '@angular/cdk/layout'
import { CdkMenuModule } from '@angular/cdk/menu'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CdkTreeModule } from '@angular/cdk/tree'
import { ErrorHandler, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js'
import { provideHotToastConfig } from '@ngneat/hot-toast'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { environment } from 'src/environments/environment'
import { routes } from './app.routes'
import { CommandPalletteModule } from './command-pallette/command-pallette.module'
import { EntityPageLabelComponent } from './components/atoms/entity-page-label/entity-page-label.component'
import { IconsModule } from './components/atoms/icons/icons.module'
import { InlineEditorComponent } from './components/atoms/inline-editor/inline-editor.component'
import { InputComponent } from './components/atoms/input/input.component'
import { DemoComponent } from './components/demo/demo.component'
import { BreadcrumbsComponent } from './components/molecules/breadcrumbs/breadcrumbs.component'
import { EditableEntityTitleComponent } from './components/molecules/editable-entity-heading/editable-entity-title.component'
import { EntityDescriptionComponent } from './components/molecules/entity-description/entity-description.component'
import { FormComponent } from './components/molecules/form/form.component'
import { PageProgressBarComponent } from './components/molecules/page-progress-bar/page-progress-bar.component'
import { TabBarComponent } from './components/molecules/tab-bar/tab-bar.component'
import { TimelineComponent } from './components/molecules/timeline/timeline.component'
import { ToolbarComponent } from './components/molecules/toolbar/toolbar.component'
import { EntityParentSelectorComponent } from './components/organisms/entity-parent-selector/entity-parent-selector.component'
import { EntityViewComponent } from './components/organisms/entity-view/entity-view.component'
import { ActivityComponent } from './components/organisms/entity-view/shared/activity/activity.component'
import { ParentListChangedEventComponent } from './components/organisms/entity-view/shared/activity/event-views/parent-list-changed-event.component'
import { TaskDeadlineEventComponent } from './components/organisms/entity-view/shared/activity/event-views/task-deadline-event.component'
import { TaskParentTaskChangedEventComponent } from './components/organisms/entity-view/shared/activity/event-views/task-parent-task-changed-event.component'
import { TaskPriorityEventComponent } from './components/organisms/entity-view/shared/activity/event-views/task-priority-event.component'
import { TaskStatusEventComponent } from './components/organisms/entity-view/shared/activity/event-views/task-status-event.component'
import { TitleChangedEventComponent } from './components/organisms/entity-view/shared/activity/event-views/title-changed-event.component'
import { TaskViewComponent } from './components/organisms/entity-view/views/task-view/task-view.component'
import { TasklistViewComponent } from './components/organisms/entity-view/views/tasklist-view/tasklist-view.component'
import { TaskTreeComponent } from './components/organisms/task-tree/task-tree.component'
import { ElemContainerComponent, TaskComponent } from './components/organisms/task/task.component'
import { UserMenuComponent } from './components/organisms/user-menu/user-menu.component'
import { CenteredLayoutComponent } from './components/templates/centered-layout/centered-layout.component'
import { MainPaneComponent } from './components/templates/main-pane/main-pane.component'
import { SidepanelPortalDirective } from './components/templates/main-pane/sidepanel-portal.directive'
import { MenuToggleComponent } from './components/templates/sidebar-layout/menu-toggle/menu-toggle.component'
import { SidebarLayoutComponent } from './components/templates/sidebar-layout/sidebar-layout.component'
import { DiffModule } from './diff/diff.module'
import { IntersectionDirective } from './directives/intersection.directive'
import { MutationDirective } from './directives/mutation.directive'
import { DropdownModule } from './dropdown/dropdown.module'
import { FocusableModule } from './focusable/focusable.module'
import { HttpModule } from './http/http.module'
import { KeyboardModule } from './keyboard/keyboard.module'
import { ModalModule } from './modal/modal.module'
import { AppComponent } from './pages/app.component'
import { AuthComponent } from './pages/auth/auth.component'
import { LoginLoadingComponent } from './pages/auth/login-loading/login-loading.component'
import { LoginComponent } from './pages/auth/login/login.component'
import { SignupComponent } from './pages/auth/signup/signup.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { TasksDemoComponent } from './pages/component-playground/tasks-demo/tasks-demo.component'
import { ContactComponent } from './pages/contact/contact.component'
import { DashboardComponent } from './pages/home/dashboard/dashboard.component'
import { EntityPageComponent } from './pages/home/entity-page/entity-page.component'
import { HomeComponent } from './pages/home/home.component'
import { SearchComponent } from './pages/home/search/search.component'
import { TaskDescriptionDemoComponent } from './pages/landing-page/demos/task-description-demo.component'
import { TaskNestingDemoComponent } from './pages/landing-page/demos/task-nesting-demo.component'
import { TaskPriorityDemoComponent } from './pages/landing-page/demos/task-priority-demo.component'
import { TaskStatusDemoComponent } from './pages/landing-page/demos/task-status-demo.component'
import { LandingPageComponent } from './pages/landing-page/landing-page.component'
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component'
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component'
import { SettingsAccountComponent } from './pages/settings/account/account.component'
import { SettingsAppearanceComponent } from './pages/settings/appearance/appearance.component'
import { SettingsGeneralComponent } from './pages/settings/general/general.component'
import { SettingsComponent } from './pages/settings/settings.component'
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component'
import { HighlightPipe } from './pipes/highlight.pipe'
import { ResizeModule } from './resize/resize.module'
import { RichTextEditorModule } from './rich-text-editor/rich-text-editor.module'
import { RxModule } from './rx/rx.module'
import { effects, metaReducers, reducers } from './store'
import { TooltipModule } from './tooltip/tooltip.module'

@NgModule({
    declarations: [
        AppComponent,
        DemoComponent,
        TaskComponent,
        ComponentPlaygroundComponent,
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
        ToolbarComponent,
        ElemContainerComponent,
        TimelineComponent,
        TaskStatusEventComponent,
        TaskPriorityEventComponent,
        TaskDeadlineEventComponent,
        SidepanelPortalDirective,
        TitleChangedEventComponent,
        TabBarComponent,
        ActivityComponent,
        EntityParentSelectorComponent,
        TaskParentTaskChangedEventComponent,
        ParentListChangedEventComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(routes),
        HttpModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        EffectsModule.forRoot(effects),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.isProduction }),
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
        RichTextEditorModule,
        PortalModule,
        DiffModule,
        ResizeModule,
        CommandPalletteModule,
        FocusableModule,
    ],
    providers: [
        {
            provide: ErrorHandler,
            useClass: ApplicationinsightsAngularpluginErrorService,
        },
        provideHotToastConfig({
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
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
