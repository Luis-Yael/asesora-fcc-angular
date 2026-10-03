import { InjectionToken } from '@angular/core';
/**
 * URL base de la API REST.
 * - Clase (json-server):        http://localhost:3000
 * - Backend con MySQL (Express): http://localhost:4000/api
 * Para cambiar de backend solo se modifica el valor en app.config.ts.
 */
export const API_URL = new InjectionToken<string>('API_URL');
