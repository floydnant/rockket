import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { TaskComponent } from './task/task.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [AppComponent, SidebarComponent, EditMenuComponent, TaskComponent],
    imports: [BrowserModule, FormsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
