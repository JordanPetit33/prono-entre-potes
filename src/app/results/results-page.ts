import { Component, computed, inject, input, signal } from '@angular/core';
import { matchesOfMatchday } from '../core/scoring/matches';
import { AppStore } from '../core/state/app-store';
import { MatchFieldErrors } from '../core/validation/match';

const kickoffFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Gestion des matchs d'une journée et saisie des résultats (F-70). */
@Component({
  selector: 'app-results-page',
  templateUrl: './results-page.html',
  styleUrl: './results-page.css',
})
export class ResultsPage {
  private readonly store = inject(AppStore);

  /** Paramètre de route `:numero`. */
  readonly numero = input<string>();

  protected readonly matchday = computed(() => {
    const n = Number(this.numero());
    return Number.isInteger(n) && n >= 1 ? n : 1;
  });
  protected readonly matches = computed(() => matchesOfMatchday(this.store.matches(), this.matchday()));
  protected readonly readOnly = this.store.readOnly;

  protected readonly homeTeam = signal('');
  protected readonly awayTeam = signal('');
  protected readonly kickoff = signal('');
  protected readonly errors = signal<MatchFieldErrors>({});
  protected readonly saveError = signal<string | null>(null);

  protected add(event: Event): void {
    event.preventDefault();
    const result = this.store.addMatch({
      matchday: this.matchday(),
      homeTeam: this.homeTeam(),
      awayTeam: this.awayTeam(),
      kickoff: this.kickoff(),
    });
    if (result.ok) {
      this.homeTeam.set('');
      this.awayTeam.set('');
      this.errors.set({});
      this.saveError.set(null);
    } else if ('errors' in result) {
      this.errors.set(result.errors);
      this.saveError.set(null);
    } else {
      this.errors.set({});
      this.saveError.set(result.error);
    }
  }

  protected formatKickoff(iso: string): string {
    return kickoffFormat.format(new Date(iso));
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
