// import '@total-typescript/ts-reset'
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
// import { AppModule } from './app/app.module'

// platformBrowserDynamic()
//     .bootstrapModule(AppModule)
//     .catch(err => console.error(err))

import '@total-typescript/ts-reset'
import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (environment.production) enableProdMode()

if (environment.CONTEXT != 'Production') {
    console.info('Context:', environment.CONTEXT)
    console.info('Server base url:', environment.SERVER_BASE_URL)
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err))
