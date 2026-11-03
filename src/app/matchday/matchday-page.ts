import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { matchesOfMatchday } from '../core/scoring/matches';
import { AppStore } from '../core/state/app-store';
import { Clock } from '../core/time/clock';
import { MatchCard } from './match-card/match-card';

/** Fréquence de mise à jour du verrouillage et du temps restant. */
const REFRESH_MS = 30_000;

/** Écran Journée : pronostics du joueur actif (F-70). */
@Component({
  selector: 'app-matchday-page',
  imports: [RouterLink, MatchCard],
  templateUrl: './matchday-page.html',
  styleUrl: './matchday-page.css',
})
export class MatchdayPage {
  private readonly store = inject(AppStore);
  private readonly clock = inject(Clock);

  /** Paramètre de route `:numero`. Absent sur /journee : journée 1 pour l'instant. */
  readonly numero = input<string>();

  protected readonly hasPlayers = computed(() => this.store.players().length > 0);
  protected readonly matchday = computed(() => {
    const n = Number(this.numero());
    return Number.isInteger(n) && n >= 1 ? n : 1;
  });
  protected readonly matches = computed(() => matchesOfMatchday(this.store.matches(), this.matchday()));
  protected readonly predictions = this.store.activePredictions;
  protected readonly results = computed(() => new Map(this.store.results().map((r) => [r.matchId, r])));
  protected readonly now = signal(this.clock.now());

  constructor() {
    const timer = setInterval(() => this.now.set(this.clock.now()), REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
