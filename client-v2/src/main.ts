import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (environment.production) enableProdMode()

if (environment.ENVIRONMENT != 'Production') {
    console.info('Environment:', environment.ENVIRONMENT)
    console.info('Server base url:', environment.SERVER_BASE_URL)
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err))
