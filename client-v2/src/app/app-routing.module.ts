import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ComponentPlaygroundComponent } from './pages/component-playground/component-playground.component'

const routes: Routes = [
    {
        path: 'playground',
        component: ComponentPlaygroundComponent,
    },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
