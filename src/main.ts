import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from 'environments';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

declare var global: any;

// Set `__static` path to static files in production
(global.__static) = require('path')
.join(__dirname, '/static')
.replace(/\\/g, '\\\\');

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .catch(err => console.error(err));
