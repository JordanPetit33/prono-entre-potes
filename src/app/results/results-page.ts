import { Component, computed, inject, input, signal } from '@angular/core';
import { Id, Match } from '../core/models/app-data';
import { matchesOfMatchday } from '../core/scoring/matches';
import { AppStore } from '../core/state/app-store';
import { toDatetimeLocal } from '../core/time/datetime-local';
import { MatchFieldErrors } from '../core/validation/match';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

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
  imports: [ConfirmDialog],
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
  private readonly matchIdsWithResult = computed(() => new Set(this.store.results().map((r) => r.matchId)));

  protected readonly homeTeam = signal('');
  protected readonly awayTeam = signal('');
  protected readonly kickoff = signal('');
  protected readonly errors = signal<MatchFieldErrors>({});
  protected readonly saveError = signal<string | null>(null);

  /** Match en cours de modification, null en mode ajout. */
  protected readonly editingId = signal<Id | null>(null);

  protected readonly toDelete = signal<Match | null>(null);
  protected readonly deleteMessage = computed(() => {
    const match = this.toDelete();
    return match ? `Supprimer ${this.label(match)} ? Ses pronostics et son résultat seront aussi supprimés.` : '';
  });

  protected save(event: Event): void {
    event.preventDefault();
    const input = {
      matchday: this.matchday(),
      homeTeam: this.homeTeam(),
      awayTeam: this.awayTeam(),
      kickoff: this.kickoff(),
    };
    const editingId = this.editingId();
    const result = editingId ? this.store.updateMatch(editingId, input) : this.store.addMatch(input);
    if (result.ok) {
      if (editingId) {
        this.cancelEdit();
      } else {
        this.homeTeam.set('');
        this.awayTeam.set('');
        this.clearErrors();
      }
    } else if ('errors' in result) {
      this.errors.set(result.errors);
      this.saveError.set(null);
    } else {
      this.errors.set({});
      this.saveError.set(result.error);
    }
  }

  protected startEdit(match: Match): void {
    this.editingId.set(match.id);
    this.homeTeam.set(match.homeTeam);
    this.awayTeam.set(match.awayTeam);
    this.kickoff.set(toDatetimeLocal(match.kickoff));
    this.clearErrors();
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.homeTeam.set('');
    this.awayTeam.set('');
    this.clearErrors();
  }

  protected confirmDelete(): void {
    const match = this.toDelete();
    this.toDelete.set(null);
    if (!match) return;
    const result = this.store.removeMatch(match.id);
    if (!result.ok) {
      this.saveError.set(result.error);
    } else if (this.editingId() === match.id) {
      this.cancelEdit();
    }
  }

  protected hasResult(matchId: Id): boolean {
    return this.matchIdsWithResult().has(matchId);
  }

  protected label(match: Match): string {
    return `${match.homeTeam} – ${match.awayTeam}`;
  }

  protected formatKickoff(iso: string): string {
    return kickoffFormat.format(new Date(iso));
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private clearErrors(): void {
    this.errors.set({});
    this.saveError.set(null);
  }
}
