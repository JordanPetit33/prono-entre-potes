import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppStore } from './core/state/app-store';
import { PlayerPicker } from './players/player-picker/player-picker';
import { BottomNav } from './shared/bottom-nav/bottom-nav';
import { StorageBanner } from './shared/storage-banner/storage-banner';
import { StorageErrorScreen } from './shared/storage-error-screen/storage-error-screen';

@Component({
  imports: [RouterOutlet, BottomNav, PlayerPicker, StorageBanner, StorageErrorScreen],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(AppStore);

  protected readonly title = 'Prono entre potes';
  protected readonly hasPlayers = computed(() => this.store.players().length > 0);
  protected readonly corrupted = computed(() => this.store.storageStatus() === 'corrupted');
}
