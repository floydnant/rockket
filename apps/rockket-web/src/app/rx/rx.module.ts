import { NgModule } from '@angular/core'
import { RxFor } from '@rx-angular/template/for'
import { RxIf } from '@rx-angular/template/if'
import { RxLet } from '@rx-angular/template/let'
import { RxPush } from '@rx-angular/template/push'

@NgModule({
    imports: [RxFor, RxIf, RxLet, RxPush],
    exports: [RxFor, RxIf, RxLet, RxPush],
})
export class RxModule {}
