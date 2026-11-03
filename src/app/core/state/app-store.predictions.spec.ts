import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppData, createEmptyAppData } from '../models/app-data';
import { APP_STORAGE, DATA_KEY } from '../storage/storage-repository';
import { Clock } from '../time/clock';
import { AppStore } from './app-store';

const NOW = new Date('2026-11-14T10:00:00.000Z');

describe('AppStore et pronostics', () => {
  let storage: MemoryStorage;
  let store: AppStore;

  function createStore(data: AppData = sampleData(), now: Date = NOW): AppStore {
    storage = new MemoryStorage({ [DATA_KEY]: JSON.stringify(data) });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_STORAGE, useValue: storage },
        { provide: Clock, useValue: { now: () => now } },
      ],
    });
    return TestBed.inject(AppStore);
  }

  beforeEach(() => {
    store = createStore();
  });

  it('enregistre le pronostic du joueur actif, daté par l’horloge', () => {
    expect(store.savePrediction('m1', { home: 2, away: 1 })).toEqual({ ok: true });
    expect(store.predictions()).toEqual([
      { playerId: 'p1', matchId: 'm1', score: { home: 2, away: 1 }, updatedAt: NOW.toISOString() },
    ]);
  });

  it('enregistre le pronostic dans le stockage', () => {
    store.savePrediction('m1', { home: 2, away: 1 });
    expect((JSON.parse(storage.getItem(DATA_KEY)!) as AppData).predictions).toHaveLength(1);
  });

  it('une seconde saisie remplace celle du même joueur', () => {
    store.savePrediction('m1', { home: 2, away: 1 });
    store.savePrediction('m1', { home: 0, away: 0 });
    expect(store.predictions().map((p) => p.score)).toEqual([{ home: 0, away: 0 }]);
  });

  it('ne modifie pas le pronostic d’un autre joueur sur le même match (F-32)', () => {
    store.setActivePlayer('p2');
    store.savePrediction('m1', { home: 3, away: 3 });
    store.setActivePlayer('p1');
    store.savePrediction('m1', { home: 1, away: 0 });
    store.savePrediction('m1', { home: 2, away: 0 });
    const byPlayer = Object.fromEntries(store.predictions().map((p) => [p.playerId, p.score]));
    expect(byPlayer).toEqual({ p1: { home: 2, away: 0 }, p2: { home: 3, away: 3 } });
  });

  it('refuse un match verrouillé par son coup d’envoi', () => {
    store = createStore(sampleData(), new Date('2026-11-15T14:00:00.000Z'));
    expect(store.savePrediction('m1', { home: 2, away: 1 })).toEqual({
      ok: false,
      error: 'Ce match a commencé, le pronostic est verrouillé.',
    });
    expect(store.predictions()).toEqual([]);
  });

  it('refuse un match verrouillé par son résultat', () => {
    store = createStore({
      ...sampleData(),
      results: [{ matchId: 'm1', score: { home: 1, away: 1 }, enteredAt: NOW.toISOString() }],
    });
    expect(store.savePrediction('m1', { home: 2, away: 1 }).ok).toBe(false);
  });

  it('refuse sans joueur actif', () => {
    store = createStore({ ...sampleData(), players: [] });
    expect(store.savePrediction('m1', { home: 2, away: 1 })).toEqual({
      ok: false,
      error: 'Choisissez d’abord un joueur.',
    });
  });

  it('refuse un match inconnu', () => {
    expect(store.savePrediction('inconnu', { home: 2, away: 1 })).toEqual({ ok: false, error: 'Match introuvable.' });
  });

  it('refuse un score hors limites', () => {
    expect(store.savePrediction('m1', { home: 100, away: 1 })).toEqual({
      ok: false,
      error: 'Le score doit être un nombre entier de 0 à 99.',
    });
  });

  describe('activePredictions', () => {
    it('donne les pronostics du joueur actif, par match', () => {
      store.setActivePlayer('p2');
      store.savePrediction('m1', { home: 3, away: 3 });
      store.setActivePlayer('p1');
      store.savePrediction('m1', { home: 1, away: 0 });
      expect(store.activePredictions().get('m1')?.score).toEqual({ home: 1, away: 0 });
      store.setActivePlayer('p2');
      expect(store.activePredictions().get('m1')?.score).toEqual({ home: 3, away: 3 });
    });

    it('est vide sans pronostic', () => {
      expect(store.activePredictions().size).toBe(0);
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
  };
}
