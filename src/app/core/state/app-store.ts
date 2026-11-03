import { computed, inject, Injectable, signal } from '@angular/core';
import { AppData, createEmptyAppData, Id, Match, Player } from '../models/app-data';
import { matchdayNumbers } from '../scoring/matches';
import { LoadResult, SaveError, StorageRepository } from '../storage/storage-repository';
import { Clock } from '../time/clock';
import { MatchFieldErrors, MatchInput, validateMatch } from '../validation/match';
import { validatePlayerName } from '../validation/player-name';

export type AddPlayerResult = { ok: true; player: Player } | { ok: false; error: string };
/** Un refus de validation renvoie `errors` par champ ; un échec d'enregistrement renvoie `error`. */
export type AddMatchResult =
  | { ok: true; match: Match }
  | { ok: false; errors: MatchFieldErrors }
  | { ok: false; error: string };
export type UpdateMatchResult = { ok: true } | { ok: false; errors: MatchFieldErrors } | { ok: false; error: string };
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
  private readonly clock = inject(Clock);

  private readonly data = signal<AppData>(createEmptyAppData());
  private readonly selectedPlayerId = signal<Id | null>(null);

  readonly players = computed(() => this.data().players);
  readonly predictions = computed(() => this.data().predictions);
  readonly matches = computed(() => this.data().matches);
  readonly results = computed(() => this.data().results);
  /** Numéros des journées qui ont au moins un match, triés. */
  readonly matchdays = computed(() => matchdayNumbers(this.matches()));

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
      createdAt: this.clock.now().toISOString(),
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

  addMatch(input: MatchInput): AddMatchResult {
    const validation = validateMatch(input);
    if (!validation.ok) {
      return validation;
    }
    const match: Match = { id: crypto.randomUUID(), ...validation.match };
    const saved = this.commit((data) => ({ ...data, matches: [...data.matches, match] }));
    return saved.ok ? { ok: true, match } : saved;
  }

  /** Modifie un match tant que son résultat n'est pas saisi (F-22). */
  updateMatch(id: Id, input: MatchInput): UpdateMatchResult {
    if (!this.matches().some((m) => m.id === id)) {
      return { ok: false, error: 'Match introuvable.' };
    }
    if (this.results().some((r) => r.matchId === id)) {
      return { ok: false, error: 'Ce match a un résultat : il ne peut plus être modifié.' };
    }
    const validation = validateMatch(input);
    if (!validation.ok) {
      return validation;
    }
    return this.commit((data) => ({
      ...data,
      matches: data.matches.map((m) => (m.id === id ? { id, ...validation.match } : m)),
    }));
  }

  /** Supprime le match, ses pronostics et son résultat (F-23). */
  removeMatch(id: Id): UpdateResult {
    if (!this.matches().some((m) => m.id === id)) {
      return { ok: true };
    }
    return this.commit((data) => ({
      ...data,
      matches: data.matches.filter((m) => m.id !== id),
      predictions: data.predictions.filter((p) => p.matchId !== id),
      results: data.results.filter((r) => r.matchId !== id),
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
