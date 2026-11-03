import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppData, createEmptyAppData } from '../models/app-data';
import { ACTIVE_PLAYER_KEY, APP_STORAGE, BACKUP_KEY, DATA_KEY } from '../storage/storage-repository';
import { AppStore } from './app-store';

describe('AppStore et stockage', () => {
  let storage: MemoryStorage;

  function createStore(initial: Record<string, string> = {}): AppStore {
    storage = new MemoryStorage(initial);
    TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: storage }] });
    return TestBed.inject(AppStore);
  }

  function stored(): AppData {
    return JSON.parse(storage.getItem(DATA_KEY)!) as AppData;
  }

  describe('au démarrage', () => {
    it('charge les données du dépôt', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
      expect(store.storageStatus()).toBe('ok');
    });

    it('sans donnée, démarre vide avec le statut "ok"', () => {
      const store = createStore();
      expect(store.players()).toEqual([]);
      expect(store.storageStatus()).toBe('ok');
    });

    it('relit le joueur actif', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()), [ACTIVE_PLAYER_KEY]: 'p2' });
      expect(store.activePlayerId()).toBe('p2');
    });

    it('si le joueur actif mémorisé n’existe plus, le premier joueur devient actif', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()), [ACTIVE_PLAYER_KEY]: 'disparu' });
      expect(store.activePlayerId()).toBe('p1');
    });

    it('données illisibles : statut "corrupted" et état vide', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      expect(store.storageStatus()).toBe('corrupted');
      expect(store.players()).toEqual([]);
    });

    it('version plus récente : statut "newer-version" et données chargées', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify({ ...sampleData(), schemaVersion: 2 }) });
      expect(store.storageStatus()).toBe('newer-version');
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });

    it('stockage inaccessible : statut "unavailable"', () => {
      storage = new MemoryStorage();
      storage.blocked = true;
      TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: storage }] });
      const store = TestBed.inject(AppStore);
      expect(store.storageStatus()).toBe('unavailable');
    });
  });

  describe('enregistrement', () => {
    it('ajouter un joueur enregistre l’état complet', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      store.addPlayer('Tom');
      expect(stored().players.map((p) => p.name)).toEqual(['Karim', 'Léa', 'Tom']);
      expect(stored().predictions).toEqual(sampleData().predictions);
    });

    it('renommer un joueur enregistre l’état', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      store.renamePlayer('p1', 'Karim B');
      expect(stored().players.map((p) => p.name)).toEqual(['Karim B', 'Léa']);
    });

    it('supprimer un joueur enregistre l’état', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      store.removePlayer('p1');
      expect(stored().players.map((p) => p.name)).toEqual(['Léa']);
      expect(stored().predictions.map((p) => p.playerId)).toEqual(['p2']);
    });

    it('une modification refusée n’enregistre rien', () => {
      const store = createStore();
      store.addPlayer('');
      expect(storage.getItem(DATA_KEY)).toBeNull();
    });

    it('changer de joueur actif l’enregistre', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      store.setActivePlayer('p2');
      expect(storage.getItem(ACTIVE_PLAYER_KEY)).toBe('p2');
    });
  });

  describe('échec de l’enregistrement', () => {
    it('stockage plein : l’ajout est annulé, l’erreur est exposée et renvoyée', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      storage.full = true;
      const result = store.addPlayer('Tom');
      expect(result).toEqual({
        ok: false,
        error: 'L’espace de stockage est plein : la modification n’a pas été enregistrée.',
      });
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
      expect(store.storageError()).toBe('quota');
      expect(stored().players.map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });

    it('stockage plein : le renommage est annulé', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      storage.full = true;
      expect(store.renamePlayer('p1', 'Karim B').ok).toBe(false);
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });

    it('stockage plein : la suppression est annulée', () => {
      const store = createStore({ [DATA_KEY]: JSON.stringify(sampleData()) });
      storage.full = true;
      store.removePlayer('p1');
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
      expect(store.predictions()).toHaveLength(2);
      expect(store.storageError()).toBe('quota');
    });

    it('aucune erreur exposée tant que tout va bien', () => {
      const store = createStore();
      store.addPlayer('Tom');
      expect(store.storageError()).toBeNull();
    });
  });

  describe('sans écrasement', () => {
    it('données illisibles : une modification ne réécrit pas la clé principale', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      store.addPlayer('Tom');
      expect(storage.getItem(DATA_KEY)).toBe('{pas du json');
    });

    it('version plus récente : une modification ne réécrit pas la clé principale', () => {
      const raw = JSON.stringify({ ...sampleData(), schemaVersion: 2 });
      const store = createStore({ [DATA_KEY]: raw });
      store.addPlayer('Tom');
      expect(storage.getItem(DATA_KEY)).toBe(raw);
    });

    it('données illisibles : la copie de secours n’est jamais touchée par une modification', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      store.addPlayer('Tom');
      expect(storage.getItem(BACKUP_KEY)).toBe('{pas du json');
    });

    it('stockage inaccessible : l’application fonctionne en mémoire', () => {
      storage = new MemoryStorage();
      storage.blocked = true;
      TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: storage }] });
      const store = TestBed.inject(AppStore);
      expect(store.addPlayer('Tom').ok).toBe(true);
      expect(store.players().map((p) => p.name)).toEqual(['Tom']);
      expect(store.storageError()).toBeNull();
    });
  });

  describe('lecture seule (version plus récente)', () => {
    const readOnlyError = {
      ok: false,
      error: 'Ces données viennent d’une version plus récente de l’application : mettez-la à jour pour les modifier.',
    };

    function createReadOnlyStore(): AppStore {
      return createStore({ [DATA_KEY]: JSON.stringify({ ...sampleData(), schemaVersion: 2 }) });
    }

    it('readOnly vaut true', () => {
      expect(createReadOnlyStore().readOnly()).toBe(true);
    });

    it('readOnly vaut false quand les données sont chargées normalement', () => {
      expect(createStore().readOnly()).toBe(false);
    });

    it('refuse l’ajout d’un joueur', () => {
      const store = createReadOnlyStore();
      expect(store.addPlayer('Tom')).toEqual(readOnlyError);
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });

    it('refuse le renommage', () => {
      const store = createReadOnlyStore();
      expect(store.renamePlayer('p1', 'Karim B')).toEqual(readOnlyError);
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });

    it('refuse la suppression', () => {
      const store = createReadOnlyStore();
      expect(store.removePlayer('p1')).toEqual(readOnlyError);
      expect(store.players().map((p) => p.name)).toEqual(['Karim', 'Léa']);
    });
  });

  describe('resetData', () => {
    it('repart d’un AppData vide, l’enregistre et repasse au statut "ok"', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      expect(store.resetData()).toEqual({ ok: true });
      expect(store.players()).toEqual([]);
      expect(store.storageStatus()).toBe('ok');
      expect(stored()).toEqual(createEmptyAppData());
    });

    it('conserve la copie de secours', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      store.resetData();
      expect(storage.getItem(BACKUP_KEY)).toBe('{pas du json');
    });

    it('les modifications suivantes sont enregistrées', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      store.resetData();
      store.addPlayer('Tom');
      expect(stored().players.map((p) => p.name)).toEqual(['Tom']);
    });

    it('si l’enregistrement échoue, rien ne change et l’erreur est exposée', () => {
      const store = createStore({ [DATA_KEY]: '{pas du json' });
      storage.full = true;
      expect(store.resetData().ok).toBe(false);
      expect(store.storageStatus()).toBe('corrupted');
      expect(store.storageError()).toBe('quota');
      expect(storage.getItem(DATA_KEY)).toBe('{pas du json');
    });
  });

  describe('dismissStorageError', () => {
    it('efface l’erreur d’enregistrement', () => {
      const store = createStore();
      storage.full = true;
      store.addPlayer('Tom');
      store.dismissStorageError();
      expect(store.storageError()).toBeNull();
    });
  });
});

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    players: [
      { id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' },
      { id: 'p2', name: 'Léa', createdAt: '2026-11-01T10:01:00.000Z' },
    ],
    matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' }],
    predictions: [
      { playerId: 'p1', matchId: 'm1', score: { home: 1, away: 1 }, updatedAt: '2026-11-02T10:00:00.000Z' },
      { playerId: 'p2', matchId: 'm1', score: { home: 2, away: 0 }, updatedAt: '2026-11-02T10:05:00.000Z' },
    ],
  };
}
