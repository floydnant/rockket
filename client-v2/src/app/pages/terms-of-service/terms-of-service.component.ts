import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-terms-of-service',
    templateUrl: './terms-of-service.component.html',
    styleUrls: ['./terms-of-service.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsOfServiceComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
