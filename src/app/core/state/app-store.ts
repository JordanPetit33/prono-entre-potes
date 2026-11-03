import { computed, inject, Injectable, signal } from '@angular/core';
import { AppData, createEmptyAppData, Id, Player } from '../models/app-data';
import { LoadResult, SaveError, StorageRepository } from '../storage/storage-repository';
import { validatePlayerName } from '../validation/player-name';

export type AddPlayerResult = { ok: true; player: Player } | { ok: false; error: string };
export type UpdateResult = { ok: true } | { ok: false; error: string };
export type StorageStatus = LoadResult['status'];

export const SAVE_ERROR_MESSAGES: Record<SaveError, string> = {
  quota: 'L’espace de stockage est plein : la modification n’a pas été enregistrée.',
  unavailable: 'Le stockage n’est pas accessible : la modification n’a pas été enregistrée.',
};

const READ_ONLY_MESSAGE =
  'Ces données viennent d’une version plus récente de l’application : mettez-la à jour pour les modifier.';

/** État de l'application. Les composants passent par ce service pour lire et modifier les données. */
@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly repository = inject(StorageRepository);

  private readonly data = signal<AppData>(createEmptyAppData());
  private readonly selectedPlayerId = signal<Id | null>(null);

  readonly players = computed(() => this.data().players);
  readonly predictions = computed(() => this.data().predictions);

  /** Résultat du chargement au démarrage. */
  readonly storageStatus = signal<StorageStatus>('ok');
  /** Dernier échec d'enregistrement, null si aucun. */
  readonly storageError = signal<SaveError | null>(null);

  /** Joueur choisi, ou à défaut le premier joueur (F-14). Null s'il n'y a aucun joueur. */
  readonly activePlayer = computed(() => {
    const players = this.players();
    return players.find((p) => p.id === this.selectedPlayerId()) ?? players[0] ?? null;
  });
  readonly activePlayerId = computed(() => this.activePlayer()?.id ?? null);

  constructor() {
    const loaded = this.repository.load();
    this.storageStatus.set(loaded.status);
    if (loaded.status === 'ok' || loaded.status === 'newer-version') {
      this.data.set(loaded.data);
    }
    this.selectedPlayerId.set(this.repository.loadActivePlayer());
  }

  /** Données écrites par une version plus récente : aucune modification possible. */
  readonly readOnly = computed(() => this.storageStatus() === 'newer-version');

  /** Repart d'un état vide et l'enregistre, après des données illisibles. La copie de secours reste intacte. */
  resetData(): UpdateResult {
    const empty = createEmptyAppData();
    const saved = this.repository.save(empty);
    if (!saved.ok) {
      this.storageError.set(saved.error);
      return { ok: false, error: SAVE_ERROR_MESSAGES[saved.error] };
    }
    this.storageError.set(null);
    this.storageStatus.set('ok');
    this.selectedPlayerId.set(null);
    this.data.set(empty);
    return { ok: true };
  }

  dismissStorageError(): void {
    this.storageError.set(null);
  }

  /** Remplace l'état en mémoire, sans l'enregistrer. */
  replaceData(data: AppData): void {
    this.data.set(data);
  }

  /** Un identifiant inconnu est ignoré. */
  setActivePlayer(id: Id): void {
    if (this.players().some((p) => p.id === id)) {
      this.selectedPlayerId.set(id);
      this.repository.saveActivePlayer(id);
    }
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
    const saved = this.commit((data) => ({ ...data, players: [...data.players, player] }));
    return saved.ok ? { ok: true, player } : saved;
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
    return this.commit((data) => ({
      ...data,
      players: data.players.map((p) => (p.id === id ? { ...p, name: validation.name } : p)),
    }));
  }

  /** Supprime le joueur et ses pronostics (F-13). */
  removePlayer(id: Id): UpdateResult {
    if (!this.players().some((p) => p.id === id)) {
      return { ok: true };
    }
    return this.commit((data) => ({
      ...data,
      players: data.players.filter((p) => p.id !== id),
      predictions: data.predictions.filter((p) => p.playerId !== id),
    }));
  }

  /**
   * Applique une modification validée. Elle n'est gardée en mémoire que si l'enregistrement réussit.
   * Les données ne sont enregistrées que si elles ont été chargées normalement : des données illisibles
   * ou écrites par une version plus récente ne sont jamais écrasées, et sans stockage on reste en mémoire.
   */
  private commit(change: (data: AppData) => AppData): UpdateResult {
    if (this.readOnly()) {
      return { ok: false, error: READ_ONLY_MESSAGE };
    }
    const next = change(this.data());
    if (this.storageStatus() === 'ok') {
      const saved = this.repository.save(next);
      if (!saved.ok) {
        this.storageError.set(saved.error);
        return { ok: false, error: SAVE_ERROR_MESSAGES[saved.error] };
      }
    }
    this.storageError.set(null);
    this.data.set(next);
    return { ok: true };
  }
}
