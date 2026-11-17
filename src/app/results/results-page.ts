import { Component, computed, inject, input, PendingTasks, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DuplicateCheck, TeamPair } from '../core/duplicates/duplicate-check';
import { Id, Match, Result } from '../core/models/app-data';
import { matchesOfMatchday } from '../core/scoring/matches';
import { AddMatchResult, AppStore, UpdateMatchResult } from '../core/state/app-store';
import { formatKickoff } from '../core/time/format-kickoff';
import { kickoffFromFields, toKickoffFields } from '../core/time/kickoff-fields';
import { MatchFieldErrors, MatchInput, validateMatch } from '../core/validation/match';
import { MatchdayHeader } from '../matchday/matchday-header/matchday-header';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { ResultEntry } from './result-entry/result-entry';

/** Gestion des matchs d'une journée et saisie des résultats (F-70). */
@Component({
  selector: 'app-results-page',
  imports: [ConfirmDialog, MatchdayHeader, ResultEntry],
  templateUrl: './results-page.html',
  styleUrl: './results-page.css',
})
export class ResultsPage {
  private readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly duplicates = inject(DuplicateCheck);
  private readonly pendingTasks = inject(PendingTasks);

  /** Paramètre de route `:numero`. */
  readonly numero = input<string>();

  protected readonly matchday = computed(() => {
    const n = Number(this.numero());
    return Number.isInteger(n) && n >= 1 ? n : 1;
  });
  protected readonly matches = computed(() => matchesOfMatchday(this.store.matches(), this.matchday()));
  protected readonly readOnly = this.store.readOnly;
  private readonly resultsByMatch = computed(() => new Map(this.store.results().map((r) => [r.matchId, r])));

  protected readonly homeTeam = signal('');
  protected readonly awayTeam = signal('');
  protected readonly kickoffDate = signal('');
  protected readonly kickoffTime = signal('');
  protected readonly errors = signal<MatchFieldErrors>({});
  protected readonly saveError = signal<string | null>(null);

  /** Match en cours de modification, null en mode ajout. */
  protected readonly editingId = signal<Id | null>(null);

  protected readonly toDelete = signal<Match | null>(null);
  protected readonly deleteMessage = computed(() => {
    const match = this.toDelete();
    return match ? `Supprimer ${this.label(match)} ? Ses pronostics et son résultat seront aussi supprimés.` : '';
  });

  /** Vérification des doublons en cours : l'envoi du formulaire est bloqué. */
  protected readonly checking = signal(false);
  protected readonly checkNotice = signal<string | null>(null);
  /** Match à ajouter que le modèle juge déjà saisi : l'organisateur doit trancher. */
  protected readonly duplicate = signal<{ input: MatchInput; existing: Match } | null>(null);
  protected readonly duplicateMessage = computed(() => {
    const pending = this.duplicate();
    return pending ? `Ce match ressemble à ${this.label(pending.existing)}, déjà saisi pour cette journée.` : '';
  });

  protected save(event: Event): void {
    event.preventDefault();
    // Un coup d'envoi illisible est transmis vide : le store signale toutes les erreurs d'un coup,
    // puis on remplace son message sur le coup d'envoi par celui, plus précis, de la lecture des champs.
    const kickoff = kickoffFromFields(this.kickoffDate(), this.kickoffTime());
    const input: MatchInput = {
      matchday: this.matchday(),
      homeTeam: this.homeTeam(),
      awayTeam: this.awayTeam(),
      kickoff: kickoff.ok ? kickoff.kickoff : '',
    };
    this.checkNotice.set(null);
    const editingId = this.editingId();
    if (editingId) {
      this.applySave(this.store.updateMatch(editingId, input), kickoff.ok ? null : kickoff.error);
      return;
    }
    const validation = validateMatch(input);
    if (!this.duplicates.enabled || !validation.ok) {
      this.applySave(this.store.addMatch(input), kickoff.ok ? null : kickoff.error);
      return;
    }
    void this.checkThenAdd(input, validation.match);
  }

  /** Demande au modèle si le match existe déjà ; seuls les noms d'équipes lui sont transmis. */
  private async checkThenAdd(input: MatchInput, match: TeamPair): Promise<void> {
    this.checking.set(true);
    await this.pendingTasks.run(async () => {
      const outcome = await this.duplicates.check(
        { homeTeam: match.homeTeam, awayTeam: match.awayTeam },
        this.matches(),
      );
      this.checking.set(false);
      if (outcome.status === 'duplicate') {
        this.duplicate.set({ input, existing: outcome.match });
        return;
      }
      this.applySave(this.store.addMatch(input), null);
      if (outcome.status === 'unavailable') {
        this.checkNotice.set('Vérification des doublons indisponible.');
      }
    });
  }

  protected confirmDuplicate(): void {
    const pending = this.duplicate();
    this.duplicate.set(null);
    if (pending) {
      this.applySave(this.store.addMatch(pending.input), null);
    }
  }

  private applySave(result: UpdateMatchResult | AddMatchResult, kickoffError: string | null): void {
    const editingId = this.editingId();
    if (result.ok) {
      if (editingId) {
        this.cancelEdit();
      } else {
        this.homeTeam.set('');
        this.awayTeam.set('');
        this.clearErrors();
      }
    } else if ('errors' in result) {
      this.errors.set(kickoffError === null ? result.errors : { ...result.errors, kickoff: kickoffError });
      this.saveError.set(null);
    } else {
      this.errors.set({});
      this.saveError.set(result.error);
    }
  }

  protected goTo(matchday: number): void {
    this.cancelEdit();
    void this.router.navigateByUrl(`/resultats/${matchday}`);
  }

  protected startEdit(match: Match): void {
    this.editingId.set(match.id);
    this.homeTeam.set(match.homeTeam);
    this.awayTeam.set(match.awayTeam);
    const { date, time } = toKickoffFields(match.kickoff);
    this.kickoffDate.set(date);
    this.kickoffTime.set(time);
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
    return this.resultsByMatch().has(matchId);
  }

  protected resultOf(matchId: Id): Result | null {
    return this.resultsByMatch().get(matchId) ?? null;
  }

  protected label(match: Match): string {
    return `${match.homeTeam} – ${match.awayTeam}`;
  }

  protected readonly formatKickoff = formatKickoff;

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private clearErrors(): void {
    this.errors.set({});
    this.saveError.set(null);
  }
}
