import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KeyComboComponent } from './key-combo/key-combo.component'
import { RxModule } from '../rx/rx.module'

@NgModule({
    declarations: [KeyComboComponent],
    imports: [CommonModule, RxModule],
    exports: [KeyComboComponent],
})
export class KeyboardModule {}
