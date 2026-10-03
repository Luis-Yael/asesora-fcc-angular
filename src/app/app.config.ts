import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { provideRouter, withComponentInputBinding, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { routes } from './app.routes';

// Imports para poder simular las operaciones con datos usando json.server
import { provideHttpClient, withFetch } from '@angular/common/http';
import { API_URL } from './core/api.config';


registerLocaleData(localeEsMx);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Parámetros de ruta y de consulta llegan como input() a las páginas
      withComponentInputBinding(),
      // Rutas con # (/#/estudiante/inicio), igual que el prototipo de Figma
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    // HttpClient para consumir la API REST
    provideHttpClient(withFetch()),
    { provide: API_URL, useValue: 'http://localhost:3000' },

    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { horizontalPosition: 'end', verticalPosition: 'bottom' } },
    // mat-icon usa la fuente Material Symbols Outlined (paquete npm material-symbols)
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
  ],
};
