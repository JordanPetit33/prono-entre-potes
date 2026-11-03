import { Component, computed, inject, input, signal } from '@angular/core';
import { Match, Prediction, Result } from '../../core/models/app-data';
import { AppStore } from '../../core/state/app-store';
import { formatKickoff } from '../../core/time/format-kickoff';
import { timeUntil } from '../../core/time/time-until';
import { isMatchLocked } from '../../core/validation/lock';
import { parseScore } from '../../core/validation/score';

/** `input` : à saisir (ou en modification), `saved` : prono enregistré, `locked` : verrouillé. */
type CardMode = 'input' | 'saved' | 'locked';

const STATUS_LABELS: Record<CardMode, string> = {
  input: 'À saisir',
  saved: 'Prono enregistré',
  locked: 'Verrouillé',
};

/** Carte d'un match dans l'écran Journée : pronostic du joueur actif (F-30 à F-35). */
@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.html',
  styleUrl: './match-card.css',
})
export class MatchCard {
  private readonly store = inject(AppStore);

  readonly match = input.required<Match>();
  /** Pronostic du joueur actif sur ce match. */
  readonly prediction = input<Prediction | null>(null);
  readonly result = input<Result | null>(null);
  /** Heure courante, fournie par la page pour mettre à jour le verrouillage et le temps restant. */
  readonly now = input.required<Date>();

  protected readonly readOnly = this.store.readOnly;
  protected readonly editing = signal(false);
  protected readonly home = signal('');
  protected readonly away = signal('');
  protected readonly error = signal<string | null>(null);

  protected readonly mode = computed<CardMode>(() => {
    if (isMatchLocked(this.match(), this.result(), this.now())) return 'locked';
    if (this.prediction() && !this.editing()) return 'saved';
    return 'input';
  });
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.mode()]);
  protected readonly kickoff = computed(() => formatKickoff(this.match().kickoff));
  protected readonly remaining = computed(() =>
    this.mode() === 'locked' ? null : timeUntil(this.now(), new Date(this.match().kickoff)),
  );

  protected save(event: Event): void {
    event.preventDefault();
    if (this.mode() !== 'input') return;
    const parsed = parseScore(this.home(), this.away());
    if (!parsed.ok) {
      this.error.set(parsed.error);
      return;
    }
    const result = this.store.savePrediction(this.match().id, parsed.score);
    if (!result.ok) {
      this.error.set(result.error);
      return;
    }
    this.reset();
  }

  protected startEdit(): void {
    const score = this.prediction()?.score;
    this.home.set(score ? String(score.home) : '');
    this.away.set(score ? String(score.away) : '');
    this.error.set(null);
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.reset();
  }

  /** Initiales affichées dans la pastille d'une équipe (« Paris SG » → « PS », « Lille » → « LIL »). */
  protected initials(team: string): string {
    const words = team.split(/[\s-]+/).filter(Boolean);
    const letters = words.length > 1 ? words.map((w) => Array.from(w)[0]).join('') : Array.from(team).slice(0, 3).join('');
    return letters.slice(0, 3).toUpperCase();
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private reset(): void {
    this.editing.set(false);
    this.home.set('');
    this.away.set('');
    this.error.set(null);
  }
}
