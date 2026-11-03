import { computed, Injectable, signal } from '@angular/core';
import { AppData, createEmptyAppData, Id, Player } from '../models/app-data';
import { validatePlayerName } from '../validation/player-name';

export type AddPlayerResult = { ok: true; player: Player } | { ok: false; error: string };
export type UpdateResult = { ok: true } | { ok: false; error: string };

/** État de l'application. Les composants passent par ce service pour lire et modifier les données. */
@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly data = signal<AppData>(createEmptyAppData());

  readonly players = computed(() => this.data().players);
  readonly predictions = computed(() => this.data().predictions);

  replaceData(data: AppData): void {
    this.data.set(data);
  }

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

  renamePlayer(id: Id, name: string): UpdateResult {
    if (!this.players().some((p) => p.id === id)) {
      return { ok: false, error: 'Joueur introuvable.' };
    }
    const validation = validatePlayerName(
      name,
      this.players()
        .filter((p) => p.id !== id)
        .map((p) => p.name),
    );
    if (!validation.ok) {
      return validation;
    }
    this.data.update((data) => ({
      ...data,
      players: data.players.map((p) => (p.id === id ? { ...p, name: validation.name } : p)),
    }));
    return { ok: true };
  }

  /** Supprime le joueur et ses pronostics (F-13). */
  removePlayer(id: Id): void {
    if (!this.players().some((p) => p.id === id)) {
      return;
    }
    this.data.update((data) => ({
      ...data,
      players: data.players.filter((p) => p.id !== id),
      predictions: data.predictions.filter((p) => p.playerId !== id),
    }));
  }
}
