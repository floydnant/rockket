import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropDownComponent } from './drop-down/drop-down.component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { IconsModule } from '../components/atoms/icons/icons.module'
import { KeyboardModule } from '../keyboard/keyboard.module'
import { RouterModule } from '@angular/router'

@NgModule({
    declarations: [DropDownComponent],
    imports: [CommonModule, RouterModule, CdkMenuModule, IconsModule, KeyboardModule],
    exports: [DropDownComponent],
})
export class DropdownModule {}
