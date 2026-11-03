import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Id } from '../../core/models/app-data';
import { AppStore } from '../../core/state/app-store';

/** Sélecteur du joueur actif, affiché dans l'en-tête (F-14, F-73). */
@Component({
  selector: 'app-player-picker',
  imports: [RouterLink],
  templateUrl: './player-picker.html',
  styleUrl: './player-picker.css',
})
export class PlayerPicker {
  private readonly store = inject(AppStore);

  protected readonly players = this.store.players;
  protected readonly activePlayer = this.store.activePlayer;
  protected readonly open = signal(false);

  protected choose(id: Id): void {
    this.store.setActivePlayer(id);
    this.close();
  }

  protected close(): void {
    this.open.set(false);
  }

  protected initial(name: string): string {
    return Array.from(name)[0]?.toUpperCase() ?? '';
  }
}
