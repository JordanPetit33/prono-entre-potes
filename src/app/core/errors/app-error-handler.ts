import { ErrorHandler, inject, Injectable, signal } from '@angular/core';

export const UNEXPECTED_ERROR_MESSAGE = 'Une erreur inattendue est survenue.';

/** Message affiché par le composant racine après une erreur inattendue. */
@Injectable({ providedIn: 'root' })
export class ErrorNotice {
  readonly message = signal<string | null>(null);

  show(): void {
    this.message.set(UNEXPECTED_ERROR_MESSAGE);
  }

  dismiss(): void {
    this.message.set(null);
  }
}

/**
 * Capte les erreurs inattendues (spec §6) : message générique pour l'utilisateur, détail dans la console.
 * L'erreur n'est pas relancée, l'application reste utilisable.
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly notice = inject(ErrorNotice);

  handleError(error: unknown): void {
    console.error(error);
    this.notice.show();
  }
}
