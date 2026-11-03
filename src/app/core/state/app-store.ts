import { computed, Injectable, signal } from '@angular/core';
import { AppData, createEmptyAppData, Player } from '../models/app-data';
import { validatePlayerName } from '../validation/player-name';

export type AddPlayerResult = { ok: true; player: Player } | { ok: false; error: string };

/** État de l'application. Les composants passent par ce service pour lire et modifier les données. */
@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly data = signal<AppData>(createEmptyAppData());

  readonly players = computed(() => this.data().players);

  addPlayer(name: string): AddPlayerResult {
    const validation = validatePlayerName(
      name,
      this.players().map((p) => p.name),
    );
    if (!validation.ok) {
      return validation;
    }
    const player: Player = {
      id: crypto.randomUUID(),
      name: validation.name,
      createdAt: new Date().toISOString(),
    };
    this.data.update((data) => ({ ...data, players: [...data.players, player] }));
    return { ok: true, player };
  }
}
