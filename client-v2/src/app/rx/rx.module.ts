import { NgModule } from '@angular/core'
import { LetDirective, LetModule } from '@rx-angular/template/let'
import { IfModule, RxIf } from '@rx-angular/template/if'
import { ForModule, RxFor } from '@rx-angular/template/for'
import { PushModule, PushPipe } from '@rx-angular/template/push'

@NgModule({
    declarations: [],
    imports: [LetModule, IfModule, ForModule, PushModule],
    exports: [LetDirective, RxIf, RxFor, PushPipe],
})
export class RxModule {}
