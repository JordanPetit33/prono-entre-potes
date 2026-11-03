import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppData, createEmptyAppData } from '../models/app-data';
import { APP_STORAGE, DATA_KEY } from '../storage/storage-repository';
import { Clock } from '../time/clock';
import { AppStore } from './app-store';

const NOW = new Date('2026-11-15T17:00:00.000Z');

describe('AppStore et résultats', () => {
  let storage: MemoryStorage;
  let store: AppStore;

  beforeEach(() => {
    storage = new MemoryStorage({ [DATA_KEY]: JSON.stringify(sampleData()) });
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_STORAGE, useValue: storage },
        { provide: Clock, useValue: { now: () => NOW } },
      ],
    });
    store = TestBed.inject(AppStore);
  });

  const stored = (): AppData => JSON.parse(storage.getItem(DATA_KEY)!) as AppData;

  it('saveResult enregistre le résultat, daté par l’horloge', () => {
    expect(store.saveResult('m1', { home: 2, away: 1 })).toEqual({ ok: true });
    expect(store.results()).toEqual([{ matchId: 'm1', score: { home: 2, away: 1 }, enteredAt: NOW.toISOString() }]);
    expect(stored().results).toEqual(store.results());
  });

  it('une seconde saisie corrige le résultat', () => {
    store.saveResult('m1', { home: 2, away: 1 });
    store.saveResult('m1', { home: 3, away: 1 });
    expect(store.results().map((r) => r.score)).toEqual([{ home: 3, away: 1 }]);
  });

  it('saveResult ne modifie aucun pronostic (F-43)', () => {
    const before = structuredClone(store.predictions());
    store.saveResult('m1', { home: 2, away: 1 });
    store.saveResult('m1', { home: 0, away: 0 });
    expect(store.predictions()).toEqual(before);
    expect(stored().predictions).toEqual(before);
  });

  it('removeResult ne modifie aucun pronostic (F-43)', () => {
    store.saveResult('m1', { home: 2, away: 1 });
    const before = structuredClone(store.predictions());
    store.removeResult('m1');
    expect(store.predictions()).toEqual(before);
  });

  it('refuse un score invalide', () => {
    expect(store.saveResult('m1', { home: 2, away: 100 })).toEqual({
      ok: false,
      error: 'Le score doit être un nombre entier de 0 à 99.',
    });
    expect(store.results()).toEqual([]);
  });

  it('refuse un match inconnu', () => {
    expect(store.saveResult('inconnu', { home: 1, away: 0 })).toEqual({ ok: false, error: 'Match introuvable.' });
  });

  it('removeResult supprime le résultat et l’enregistre', () => {
    store.saveResult('m1', { home: 2, away: 1 });
    expect(store.removeResult('m1')).toEqual({ ok: true });
    expect(store.results()).toEqual([]);
    expect(stored().results).toEqual([]);
  });

  it('après removeResult, le match redevient modifiable', () => {
    store.saveResult('m1', { home: 2, away: 1 });
    const input = { matchday: 1, homeTeam: 'Lille OSC', awayTeam: 'Nice', kickoff: '2026-11-20T15:00' };
    expect(store.updateMatch('m1', input).ok).toBe(false);
    store.removeResult('m1');
    expect(store.updateMatch('m1', input)).toEqual({ ok: true });
  });

  describe('points', () => {
    it('sont calculés dès qu’un résultat est saisi, et jamais stockés', () => {
      store.saveResult('m1', { home: 2, away: 1 });
      expect(store.matchPoints()).toEqual([
        { playerId: 'p1', matchId: 'm1', points: 0, kind: 'miss' },
        { playerId: 'p2', matchId: 'm1', points: 3, kind: 'exact' },
      ]);
      expect(Object.keys(stored())).not.toContain('points');
      expect(JSON.stringify(stored())).not.toContain('"kind"');
    });

    it('sont recalculés quand le résultat est corrigé', () => {
      store.saveResult('m1', { home: 2, away: 1 });
      store.saveResult('m1', { home: 1, away: 1 });
      expect(store.matchPoints().map((p) => p.points)).toEqual([3, 0]);
    });

    it('disparaissent quand le résultat est supprimé', () => {
      store.saveResult('m1', { home: 2, away: 1 });
      store.removeResult('m1');
      expect(store.matchPoints()).toEqual([]);
    });
  });

  describe('classement', () => {
    const ranking = (): [number, string, number][] => store.standings().map((r) => [r.rank, r.name, r.points]);

    it('liste tous les joueurs à 0 point tant qu’aucun résultat n’est saisi', () => {
      expect(ranking()).toEqual([
        [1, 'Karim', 0],
        [1, 'Léa', 0],
      ]);
    });

    it('se met à jour après la saisie d’un résultat (F-63)', () => {
      store.saveResult('m1', { home: 2, away: 1 });
      expect(ranking()).toEqual([
        [1, 'Léa', 3],
        [2, 'Karim', 0],
      ]);
    });

    it('se met à jour après la correction d’un résultat', () => {
      store.saveResult('m1', { home: 2, away: 1 });
      store.saveResult('m1', { home: 1, away: 1 });
      expect(ranking()).toEqual([
        [1, 'Karim', 3],
        [2, 'Léa', 0],
      ]);
    });

    it('un joueur supprimé disparaît du classement', () => {
      store.saveResult('m1', { home: 2, away: 1 });
      store.removePlayer('p2');
      expect(ranking()).toEqual([[1, 'Karim', 0]]);
    });
  });

  it('après removeResult, le pronostic redevient possible si le match n’a pas commencé', () => {
    store.saveResult('m2', { home: 1, away: 1 });
    expect(store.savePrediction('m2', { home: 0, away: 0 }).ok).toBe(false);
    store.removeResult('m2');
    expect(store.savePrediction('m2', { home: 0, away: 0 })).toEqual({ ok: true });
  });
});

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    players: [
      { id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' },
      { id: 'p2', name: 'Léa', createdAt: '2026-11-01T10:01:00.000Z' },
    ],
    matches: [
      { id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' },
      { id: 'm2', matchday: 1, homeTeam: 'Lens', awayTeam: 'Brest', kickoff: '2026-11-22T14:00:00.000Z' },
    ],
    predictions: [
      { playerId: 'p1', matchId: 'm1', score: { home: 1, away: 1 }, updatedAt: '2026-11-02T10:00:00.000Z' },
      { playerId: 'p2', matchId: 'm1', score: { home: 2, away: 1 }, updatedAt: '2026-11-02T10:05:00.000Z' },
    ],
  };
}
