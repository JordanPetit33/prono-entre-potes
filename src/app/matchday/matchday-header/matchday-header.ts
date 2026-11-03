import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Progress } from '../../core/scoring/progress';
import { formatPoints, rankLabel } from '../../core/scoring/standings';

/** Place du joueur actif au classement, avec l'écart au joueur qui le précède. */
export interface HeaderStanding {
  rank: number;
  points: number;
  gap: string | null;
}

/** En-tête d'une journée : titre, flèches (F-71), classement du joueur actif (F-62) et compteur (F-36). */
@Component({
  selector: 'app-matchday-header',
  imports: [RouterLink],
  templateUrl: './matchday-header.html',
  styleUrl: './matchday-header.css',
})
export class MatchdayHeader {
  readonly matchday = input.required<number>();
  /** Journée précédente, null pour désactiver la flèche. */
  readonly previous = input.required<number | null>();
  /** Journée suivante, null pour désactiver la flèche. */
  readonly next = input.required<number | null>();
  /** Compteur de pronostics, masqué quand null. */
  readonly progress = input<Progress | null>(null);
  /** Classement du joueur actif, masqué quand null. */
  readonly standing = input<HeaderStanding | null>(null);

  /** Numéro de la journée demandée. */
  readonly navigate = output<number>();

  protected readonly percent = computed(() => {
    const p = this.progress();
    return p && p.total > 0 ? (p.done / p.total) * 100 : 0;
  });

  protected readonly rankLabel = rankLabel;
  protected readonly formatPoints = formatPoints;

  protected go(matchday: number | null): void {
    if (matchday !== null) {
      this.navigate.emit(matchday);
    }
  }
}
