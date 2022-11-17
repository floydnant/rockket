import { Component } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
    constructor(private toast: HotToastService) {
        this.toast.close('confirm-login')
    }
}
