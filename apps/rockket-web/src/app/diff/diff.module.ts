import { NgModule } from '@angular/core'
import { DiffComponent } from './diff.component'
import { CommonModule } from '@angular/common'

@NgModule({
    declarations: [DiffComponent],
    imports: [CommonModule],
    exports: [DiffComponent],
})
export class DiffModule {}
