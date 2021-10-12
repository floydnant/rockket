import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { TaskComponent } from './task/task.component';
import { ModalComponent } from './modal/modal.component';
import { CustomDialogComponent } from './custom-dialog/custom-dialog.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';

@NgModule({
    declarations: [AppComponent, SidebarComponent, EditMenuComponent, TaskComponent, ModalComponent, CustomDialogComponent],
    imports: [BrowserModule, FormsModule, StoreModule.forRoot(reducers, {
      metaReducers
    })],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
