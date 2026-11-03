import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { POINTS_EXACT, POINTS_OUTCOME } from '../core/scoring/points';
import { AppStore } from '../core/state/app-store';

/** Écran Classement : classement général de la compétition (F-60 à F-63). */
@Component({
  selector: 'app-standings-page',
  imports: [RouterLink],
  templateUrl: './standings-page.html',
  styleUrl: './standings-page.css',
})
export class StandingsPage {
  private readonly store = inject(AppStore);

  protected readonly rows = this.store.standings;
  protected readonly activePlayerId = this.store.activePlayerId;
  protected readonly pointsExact = POINTS_EXACT;
  protected readonly pointsOutcome = POINTS_OUTCOME;
}
