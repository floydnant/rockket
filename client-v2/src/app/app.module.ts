import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { DemoComponent } from './components/demo/demo.component'
import { StatusIconComponent } from './components/atoms/icons/status-icon/status-icon.component'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'
import { IconComponent } from './components/atoms/icons/icon/icon.component'
import { FormsModule } from '@angular/forms'
import { DoubleEllipsisIconComponent } from './components/atoms/icons/double-ellipsis-icon/double-ellipsis-icon.component'
import { PriorityIconComponent } from './components/atoms/icons/priority-icon/priority-icon.component'

@NgModule({
    declarations: [
        AppComponent,
        DemoComponent,
        StatusIconComponent,
        ComponentPlaygroundComponent,
        IconComponent,
        DoubleEllipsisIconComponent,
        PriorityIconComponent,
    ],
    imports: [BrowserModule, FormsModule, AppRoutingModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
