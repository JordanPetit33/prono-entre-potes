import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStore } from '../core/state/app-store';

@Component({
  selector: 'app-matchday-page',
  imports: [RouterLink],
  templateUrl: './matchday-page.html',
  styleUrl: './matchday-page.css',
})
export class MatchdayPage {
  private readonly store = inject(AppStore);

  protected readonly hasPlayers = computed(() => this.store.players().length > 0);
}
