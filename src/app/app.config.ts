import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { LANGUAGE_MODEL_CONFIG } from './core/duplicates/language-model';
import { AppErrorHandler } from './core/errors/app-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    // Modèle Ollama local qui signale les matchs en double (docs/story-ia.md). Null : vérification désactivée.
    // Exemple : { url: 'http://localhost:11434', model: 'llama3.2' }. Jamais de clé ici.
    { provide: LANGUAGE_MODEL_CONFIG, useValue: null }
  ]
};
