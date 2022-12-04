import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DialogModule } from '@angular/cdk/dialog'
import { DialogService } from './dialog.service'
import { ModalComponent } from './modal/modal.component'
import { DialogComponent } from './dialog/dialog.component'
import { IconsModule } from '../components/atoms/icons/icons.module'

@NgModule({
    declarations: [ModalComponent, DialogComponent],
    providers: [DialogService],
    exports: [ModalComponent, DialogComponent],
    imports: [CommonModule, DialogModule, IconsModule],
})
export class ModalModule {}
