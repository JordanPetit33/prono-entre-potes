import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';
import { AppErrorHandler, ErrorNotice, UNEXPECTED_ERROR_MESSAGE } from './app-error-handler';

describe('AppErrorHandler', () => {
  let handler: AppErrorHandler;
  let notice: ErrorNotice;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useClass: AppErrorHandler }] });
    handler = TestBed.inject(ErrorHandler) as AppErrorHandler;
    notice = TestBed.inject(ErrorNotice);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  it('aucun message tant qu’aucune erreur n’est survenue', () => {
    expect(notice.message()).toBeNull();
  });

  it('affiche « Une erreur inattendue est survenue. »', () => {
    handler.handleError(new Error('boum'));
    expect(UNEXPECTED_ERROR_MESSAGE).toBe('Une erreur inattendue est survenue.');
    expect(notice.message()).toBe('Une erreur inattendue est survenue.');
  });

  it('journalise le détail de l’erreur dans console.error', () => {
    const error = new Error('boum');
    handler.handleError(error);
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it('ne relance pas l’erreur', () => {
    expect(() => handler.handleError(new Error('boum'))).not.toThrow();
  });

  it('dismiss efface le message', () => {
    handler.handleError(new Error('boum'));
    notice.dismiss();
    expect(notice.message()).toBeNull();
  });
});

describe('appConfig', () => {
  it('fournit AppErrorHandler comme ErrorHandler', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    expect(TestBed.inject(ErrorHandler)).toBeInstanceOf(AppErrorHandler);
  });
});
