import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import '@total-typescript/ts-reset'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (!environment.isProduction) {
    console.info('environment:', environment)
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err))
