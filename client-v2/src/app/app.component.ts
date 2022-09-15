import { Component } from '@angular/core'
import { environment } from 'src/environments/environment'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'client-v2'

    packageVersion = environment.PACKAGE_VERSION
}
