import { Component } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found-page.component.html',
    styleUrls: ['./not-found-page.component.css'],
})
export class NotFoundPageComponent {
    constructor(private toast: HotToastService) {
        this.toast.close('confirm-login')
    }
}
