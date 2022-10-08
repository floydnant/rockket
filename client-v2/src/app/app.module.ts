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
    ],
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
