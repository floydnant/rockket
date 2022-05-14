import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { ServiceWorkerModule } from '@angular/service-worker';

import { reducers, metaReducers } from './reducers';

import { AppComponent } from './components/app.component';
import { SidebarComponent } from './components/organisms/sidebar/sidebar.component';
import { EditMenuComponent } from './components/organisms/edit-menu/edit-menu.component';
import { TaskComponent } from './components/molecules/task/task.component';
import { ModalComponent } from './components/molecules/modal/modal.component';
import { CustomDialogComponent } from './components/organisms/dialog/dialog.component';
import { environment } from '../environments/environment';
import { AppDataEffects } from './reducers/appData/appData.effects';
import { ThemeToggleComponent } from './components/atoms/theme-toggle/theme-toggle.component';
import { MenuToggleBtnComponent } from './components/atoms/menu-toggle-btn/menu-toggle-btn.component';
import { RemoveHostDirective } from './directives/remove-host.directive';
import { SingleInputFormComponent } from './components/molecules/single-input-form/single-input-form.component';
import { CollapseToggleComponent } from './components/atoms/collapse-toggle/collapse-toggle.component';
import { LoadingSpinnerComponent } from './components/atoms/loading-spinner/loading-spinner.component';
import { PriorityIconComponent } from './components/atoms/priority-icon/priority-icon.component';
import { ToggleSwitchComponent } from './components/atoms/toggle-switch/toggle-switch.component';
import { AppleShareIconComponent } from './components/atoms/apple-share-icon/apple-share-icon.component';
import { TasklistComponent } from './components/organisms/task-list/task-list.component';
import { TaskProgressComponent } from './components/molecules/task-progress/task-progress.component';
import { DomValueAccessorDirective } from './directives/dom-value-accessor.directive';
import { DomChangesListenerDirective } from './directives/dom-changes-listener.directive';

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        EditMenuComponent,
        TaskComponent,
        ModalComponent,
        CustomDialogComponent,
        ThemeToggleComponent,
        MenuToggleBtnComponent,
        RemoveHostDirective,
        SingleInputFormComponent,
        CollapseToggleComponent,
        LoadingSpinnerComponent,
        PriorityIconComponent,
        ToggleSwitchComponent,
        AppleShareIconComponent,
        TasklistComponent,
        TaskProgressComponent,
        DomValueAccessorDirective,
        DomChangesListenerDirective,
    ],
    imports: [
        DragDropModule,
        BrowserModule,
        BrowserAnimationsModule,
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
