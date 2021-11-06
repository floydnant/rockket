import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers, appDataReducer } from './reducers';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { TaskComponent } from './task/task.component';
import { ModalComponent } from './modal/modal.component';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { AppDataEffects } from './reducers/appData/appData.effects';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        EditMenuComponent,
        TaskComponent,
        ModalComponent,
        CustomDialogComponent,
        ThemeToggleComponent,
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
