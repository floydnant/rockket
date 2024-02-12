import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { HttpService } from './http.service'

@NgModule({
    declarations: [],
    providers: [HttpService],
    imports: [CommonModule, HttpClientModule],
})
export class HttpModule {}
