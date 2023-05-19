import { NgModule } from '@angular/core'
import { ForModule } from '@rx-angular/template/for'
import { IfModule } from '@rx-angular/template/if'
import { LetModule } from '@rx-angular/template/let'
import { PushModule } from '@rx-angular/template/push'

@NgModule({
    exports: [LetModule, IfModule, ForModule, PushModule],
})
export class RxModule {}
