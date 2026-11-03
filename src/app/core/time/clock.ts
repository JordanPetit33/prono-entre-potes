import { Injectable } from '@angular/core';

/** Heure courante. Injectée pour pouvoir la fixer dans les tests. */
@Injectable({ providedIn: 'root' })
export class Clock {
  now(): Date {
    return new Date();
  }
}
