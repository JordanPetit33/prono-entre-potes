import { TestBed } from '@angular/core/testing';
import { AppData, createEmptyAppData } from '../models/app-data';
import { AppStore } from './app-store';

describe('AppStore', () => {
  let store: AppStore;

  beforeEach(() => {
    store = TestBed.inject(AppStore);
  });

  it('démarre sans joueur', () => {
    expect(store.players()).toEqual([]);
  });

  it('addPlayer ajoute un joueur avec le nom nettoyé', () => {
    const result = store.addPlayer('  Karim ');
    expect(result.ok).toBe(true);
    expect(store.players().map((p) => p.name)).toEqual(['Karim']);
  });

  it('addPlayer renvoie le joueur créé', () => {
    const result = store.addPlayer('Karim');
    expect(result).toEqual({ ok: true, player: store.players()[0] });
  });

  it('donne un identifiant unique à chaque joueur', () => {
    store.addPlayer('Karim');
    store.addPlayer('Léa');
    const [a, b] = store.players();
    expect(a.id).toBeTruthy();
    expect(b.id).toBeTruthy();
    expect(a.id).not.toBe(b.id);
  });

  it('enregistre la date de création au format ISO 8601', () => {
    store.addPlayer('Karim');
    const { createdAt } = store.players()[0];
    expect(new Date(createdAt).toISOString()).toBe(createdAt);
  });

  it('addPlayer refuse un nom invalide sans changer l’état', () => {
    const result = store.addPlayer('   ');
    expect(result).toEqual({ ok: false, error: 'Le nom est obligatoire.' });
    expect(store.players()).toEqual([]);
  });

  it('addPlayer refuse un doublon sans changer l’état', () => {
    store.addPlayer('Léa');
    const before = store.players();
    const result = store.addPlayer('lea');
    expect(result).toEqual({ ok: false, error: 'Ce nom est déjà utilisé.' });
    expect(store.players()).toBe(before);
  });

  describe('replaceData', () => {
    it('remplace tout l’état par l’AppData fourni', () => {
      const data = sampleData();
      store.replaceData(data);
      expect(store.players()).toEqual(data.players);
      expect(store.predictions()).toEqual(data.predictions);
    });
  });

  describe('renamePlayer', () => {
    beforeEach(() => store.replaceData(sampleData()));

    it('renomme un joueur avec le nom nettoyé', () => {
      expect(store.renamePlayer('p1', '  Karim B ')).toEqual({ ok: true });
      expect(store.players().find((p) => p.id === 'p1')?.name).toBe('Karim B');
    });

    it('accepte le propre nom du joueur avec une casse différente', () => {
      expect(store.renamePlayer('p1', 'KARIM')).toEqual({ ok: true });
      expect(store.players().find((p) => p.id === 'p1')?.name).toBe('KARIM');
    });

    it('refuse le nom d’un autre joueur sans changer l’état', () => {
      const before = store.players();
      expect(store.renamePlayer('p1', 'lea')).toEqual({ ok: false, error: 'Ce nom est déjà utilisé.' });
      expect(store.players()).toBe(before);
    });

    it('refuse un nom invalide sans changer l’état', () => {
      const before = store.players();
      expect(store.renamePlayer('p1', '')).toEqual({ ok: false, error: 'Le nom est obligatoire.' });
      expect(store.players()).toBe(before);
    });

    it('refuse un joueur inconnu', () => {
      expect(store.renamePlayer('inconnu', 'Tom')).toEqual({ ok: false, error: 'Joueur introuvable.' });
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => store.replaceData(sampleData()));

    it('retire le joueur', () => {
      store.removePlayer('p1');
      expect(store.players().map((p) => p.id)).toEqual(['p2']);
    });

    it('retire les pronostics du joueur et seulement les siens', () => {
      store.removePlayer('p1');
      expect(store.predictions().map((p) => p.playerId)).toEqual(['p2']);
    });

    it('ignore un joueur inconnu', () => {
      const before = store.players();
      store.removePlayer('inconnu');
      expect(store.players()).toBe(before);
    });
  });

  describe('joueur actif', () => {
    it('vaut null tant qu’aucun joueur n’existe', () => {
      expect(store.activePlayer()).toBeNull();
      expect(store.activePlayerId()).toBeNull();
    });

    it('devient automatiquement le premier joueur ajouté', () => {
      store.addPlayer('Karim');
      store.addPlayer('Léa');
      expect(store.activePlayer()?.name).toBe('Karim');
    });

    it('setActivePlayer change le joueur actif', () => {
      store.replaceData(sampleData());
      store.setActivePlayer('p2');
      expect(store.activePlayer()?.name).toBe('Léa');
      expect(store.activePlayerId()).toBe('p2');
    });

    it('setActivePlayer ignore un identifiant inconnu', () => {
      store.replaceData(sampleData());
      store.setActivePlayer('p2');
      store.setActivePlayer('inconnu');
      expect(store.activePlayerId()).toBe('p2');
    });

    it('supprimer le joueur actif rend actif le premier joueur restant', () => {
      store.replaceData(sampleData());
      store.setActivePlayer('p1');
      store.removePlayer('p1');
      expect(store.activePlayerId()).toBe('p2');
    });

    it('supprimer le dernier joueur remet le joueur actif à null', () => {
      store.replaceData(sampleData());
      store.removePlayer('p1');
      store.removePlayer('p2');
      expect(store.activePlayer()).toBeNull();
    });

    it('supprimer un autre joueur ne change pas le joueur actif', () => {
      store.replaceData(sampleData());
      store.setActivePlayer('p2');
      store.removePlayer('p1');
      expect(store.activePlayerId()).toBe('p2');
    });

    it('suit le renommage du joueur actif', () => {
      store.replaceData(sampleData());
      store.renamePlayer('p1', 'Karim B');
      expect(store.activePlayer()?.name).toBe('Karim B');
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
    matches: [
      { id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' },
    ],
    predictions: [
      { playerId: 'p1', matchId: 'm1', score: { home: 1, away: 1 }, updatedAt: '2026-11-02T10:00:00.000Z' },
      { playerId: 'p2', matchId: 'm1', score: { home: 2, away: 0 }, updatedAt: '2026-11-02T10:05:00.000Z' },
    ],
  };
}
