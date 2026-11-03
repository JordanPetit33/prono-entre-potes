import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStore } from './core/state/app-store';
import { PlayerPicker } from './players/player-picker/player-picker';
import { BottomNav } from './shared/bottom-nav/bottom-nav';

@Component({
  imports: [RouterOutlet, BottomNav, PlayerPicker],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(AppStore);

  protected readonly title = 'Prono entre potes';
  protected readonly hasPlayers = computed(() => this.store.players().length > 0);
}
