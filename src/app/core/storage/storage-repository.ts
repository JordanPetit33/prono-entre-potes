import { inject, Injectable, InjectionToken } from '@angular/core';
import { AppData, createEmptyAppData, Id } from '../models/app-data';
import { hasAppDataShape } from './app-data-schema';

export const DATA_KEY = 'prono-entre-potes:data';
export const BACKUP_KEY = 'prono-entre-potes:data-backup';
export const ACTIVE_PLAYER_KEY = 'prono-entre-potes:active-player';
export const CURRENT_SCHEMA_VERSION = 1;

/** Stockage du navigateur. Null quand le navigateur en refuse l'accès. */
export const APP_STORAGE = new InjectionToken<Storage | null>('APP_STORAGE', {
  providedIn: 'root',
  factory: () => {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  },
});

export type LoadResult =
  | { status: 'ok'; data: AppData }
  /** Données écrites par une version plus récente de l'application : lecture seule. */
  | { status: 'newer-version'; data: AppData }
  /** Données illisibles : une copie brute est conservée sous BACKUP_KEY. */
  | { status: 'corrupted' }
  | { status: 'unavailable' };

export type SaveError = 'quota' | 'unavailable';
export type SaveResult = { ok: true } | { ok: false; error: SaveError };

/** Lecture et écriture des données dans le stockage du navigateur (spec §5.3 et §6). */
@Injectable({ providedIn: 'root' })
export class StorageRepository {
  private readonly storage = inject(APP_STORAGE);

  load(): LoadResult {
    let raw: string | null;
    try {
      if (!this.storage) return { status: 'unavailable' };
      raw = this.storage.getItem(DATA_KEY);
    } catch {
      return { status: 'unavailable' };
    }
    if (raw === null) {
      return { status: 'ok', data: createEmptyAppData() };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return this.corrupted(raw);
    }

    const version = (parsed as { schemaVersion?: unknown } | null)?.schemaVersion;
    if (typeof version === 'number' && version > CURRENT_SCHEMA_VERSION) {
      const data = hasAppDataShape(parsed)
        ? { ...parsed, schemaVersion: CURRENT_SCHEMA_VERSION as typeof CURRENT_SCHEMA_VERSION }
        : createEmptyAppData();
      return { status: 'newer-version', data };
    }
    // Pas encore de migration : seul le schéma 1 existe.
    if (!hasAppDataShape(parsed) || parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      return this.corrupted(raw);
    }
    return { status: 'ok', data: parsed as AppData };
  }

  save(data: AppData): SaveResult {
    try {
      if (!this.storage) return { ok: false, error: 'unavailable' };
      this.storage.setItem(DATA_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: isQuotaExceeded(error) ? 'quota' : 'unavailable' };
    }
  }

  saveActivePlayer(id: Id): void {
    try {
      this.storage?.setItem(ACTIVE_PLAYER_KEY, id);
    } catch {
      // Le joueur actif est une simple commodité : on ignore l'échec.
    }
  }

  loadActivePlayer(): Id | null {
    try {
      return this.storage?.getItem(ACTIVE_PLAYER_KEY) ?? null;
    } catch {
      return null;
    }
  }

  /** Conserve une copie brute sans jamais toucher à la clé principale. */
  private corrupted(raw: string): LoadResult {
    try {
      this.storage?.setItem(BACKUP_KEY, raw);
    } catch {
      // Copie impossible : la clé principale reste intacte de toute façon.
    }
    return { status: 'corrupted' };
  }
}

function isQuotaExceeded(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22)
  );
}
