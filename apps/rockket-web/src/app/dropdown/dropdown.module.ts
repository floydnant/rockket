import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DropDownComponent } from './drop-down/drop-down.component'
import { CdkMenuModule } from '@angular/cdk/menu'
import { IconsModule } from '../components/atoms/icons/icons.module'
import { KeyboardModule } from '../keyboard/keyboard.module'
import { RouterModule } from '@angular/router'
import {
    MenuTriggerDirective,
    DropDownTemplateWrapperComponent,
    ContextMenuTriggerDirective,
} from './menu-trigger.directive'
import { RxModule } from '../rx/rx.module'

@NgModule({
    declarations: [
        DropDownComponent,
        MenuTriggerDirective,
        ContextMenuTriggerDirective,
        DropDownTemplateWrapperComponent,
    ],
    imports: [CommonModule, RouterModule, CdkMenuModule, IconsModule, KeyboardModule, RxModule],
    exports: [DropDownComponent, MenuTriggerDirective, ContextMenuTriggerDirective],
})
export class DropdownModule {}
