import { Component, computed, input, output } from '@angular/core';
import { Progress } from '../../core/scoring/progress';

/** En-tête d'une journée : titre, flèches de navigation (F-71) et compteur de pronostics (F-36). */
@Component({
  selector: 'app-matchday-header',
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

  /** Numéro de la journée demandée. */
  readonly navigate = output<number>();

  protected readonly percent = computed(() => {
    const p = this.progress();
    return p && p.total > 0 ? (p.done / p.total) * 100 : 0;
  });

  protected go(matchday: number | null): void {
    if (matchday !== null) {
      this.navigate.emit(matchday);
    }
  }
}
