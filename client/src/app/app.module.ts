import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { ServiceWorkerModule } from '@angular/service-worker';

import { reducers, metaReducers } from './reducers';

import { AppComponent } from './app.component';
import { SidebarComponent } from './components/organisms/sidebar/sidebar.component';
import { EditMenuComponent } from './components/organisms/edit-menu/edit-menu.component';
import { TaskComponent } from './components/molecules/task/task.component';
import { ModalComponent } from './components/molecules/modal/modal.component';
import { CustomDialogComponent } from './components/organisms/custom-dialog/custom-dialog.component';
import { environment } from '../environments/environment';
import { AppDataEffects } from './reducers/appData/appData.effects';
import { ThemeToggleComponent } from './components/atoms/theme-toggle/theme-toggle.component';
import { MenuComponent } from './components/organisms/side-menu/menu.component';
import { MenuToggleBtnComponent } from './components/atoms/menu-toggle-btn/menu-toggle-btn.component';
import { RemoveHostDirective } from './directives/remove-host.directive';
import { QuickAddTaskComponent } from './components/molecules/task/quick-add-task/quick-add-task.component';
import { ShowCompletedComponent } from './components/molecules/task/show-completed/show-completed.component';
import { LoadingSpinnerComponent } from './components/atoms/loading-spinner/loading-spinner.component';
import { PriorityIconComponent } from './components/atoms/priority-icon/priority-icon.component';

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        EditMenuComponent,
        TaskComponent,
        ModalComponent,
        CustomDialogComponent,
        ThemeToggleComponent,
        MenuComponent,
        MenuToggleBtnComponent,
        RemoveHostDirective,
        QuickAddTaskComponent,
        ShowCompletedComponent,
        LoadingSpinnerComponent,
        PriorityIconComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        StoreModule.forRoot(reducers, {
            metaReducers,
        }),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
        EffectsModule.forRoot([AppDataEffects]),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
    providers: [StoreModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
