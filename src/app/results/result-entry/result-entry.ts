import { Component, computed, inject, input, signal } from '@angular/core';
import { Match, Result, Score } from '../../core/models/app-data';
import { AppStore } from '../../core/state/app-store';
import { Clock } from '../../core/time/clock';
import { parseScore } from '../../core/validation/score';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/** Confirmation en attente : résultat saisi avant le coup d'envoi, ou suppression du résultat. */
type Pending = 'early' | 'delete';

/** Saisie, correction et suppression du résultat réel d'un match (F-40 à F-42). */
@Component({
  selector: 'app-result-entry',
  imports: [ConfirmDialog],
  templateUrl: './result-entry.html',
  styleUrl: './result-entry.css',
})
export class ResultEntry {
  private readonly store = inject(AppStore);
  private readonly clock = inject(Clock);

  readonly match = input.required<Match>();
  readonly result = input<Result | null>(null);

  protected readonly readOnly = this.store.readOnly;
  protected readonly correcting = signal(false);
  protected readonly home = signal('');
  protected readonly away = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly pending = signal<Pending | null>(null);
  /** Score validé, en attente de la confirmation « avant le coup d'envoi ». */
  private readonly earlyScore = signal<Score | null>(null);

  protected readonly mode = computed(() => (this.result() && !this.correcting() ? 'view' : 'edit'));
  protected readonly confirmMessage = computed(() => {
    const { homeTeam, awayTeam } = this.match();
    return this.pending() === 'delete'
      ? `Supprimer le résultat de ${homeTeam} – ${awayTeam} ?`
      : `${homeTeam} – ${awayTeam} n’a pas encore commencé. Enregistrer quand même ce résultat ?`;
  });

  protected submit(event: Event): void {
    event.preventDefault();
    const parsed = parseScore(this.home(), this.away());
    if (!parsed.ok) {
      this.error.set(parsed.error);
      return;
    }
    if (this.clock.now().getTime() < Date.parse(this.match().kickoff)) {
      this.earlyScore.set(parsed.score);
      this.pending.set('early');
      return;
    }
    this.save(parsed.score);
  }

  protected confirm(): void {
    const pending = this.pending();
    this.pending.set(null);
    if (pending === 'delete') {
      const removed = this.store.removeResult(this.match().id);
      this.error.set(removed.ok ? null : removed.error);
    } else if (pending === 'early') {
      const score = this.earlyScore();
      this.earlyScore.set(null);
      if (score) this.save(score);
    }
  }

  protected startCorrection(): void {
    const score = this.result()?.score;
    this.home.set(score ? String(score.home) : '');
    this.away.set(score ? String(score.away) : '');
    this.error.set(null);
    this.correcting.set(true);
  }

  protected cancelCorrection(): void {
    this.reset();
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private save(score: Score): void {
    const saved = this.store.saveResult(this.match().id, score);
    if (saved.ok) {
      this.reset();
    } else {
      this.error.set(saved.error);
    }
  }

  private reset(): void {
    this.correcting.set(false);
    this.home.set('');
    this.away.set('');
    this.error.set(null);
  }
}
