import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import '@total-typescript/ts-reset'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (!environment.isProduction) {
    console.info('Context:', environment.CONTEXT)
    console.info('Server base url:', environment.SERVER_BASE_URL)
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err))
