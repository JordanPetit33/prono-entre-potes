import { TestBed } from '@angular/core/testing';
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
});
