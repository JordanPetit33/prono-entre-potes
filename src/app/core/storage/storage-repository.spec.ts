import { TestBed } from '@angular/core/testing';
import { MemoryStorage } from '../../../testing/memory-storage';
import { AppData, createEmptyAppData } from '../models/app-data';
import {
  ACTIVE_PLAYER_KEY,
  APP_STORAGE,
  BACKUP_KEY,
  CURRENT_SCHEMA_VERSION,
  DATA_KEY,
  StorageRepository,
} from './storage-repository';

describe('StorageRepository', () => {
  let storage: MemoryStorage;
  let repository: StorageRepository;

  function setup(initial: Record<string, string> = {}): void {
    storage = new MemoryStorage(initial);
    TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: storage }] });
    repository = TestBed.inject(StorageRepository);
  }

  it('utilise les clés prévues par la spec', () => {
    expect(DATA_KEY).toBe('prono-entre-potes:data');
    expect(BACKUP_KEY).toBe('prono-entre-potes:data-backup');
    expect(ACTIVE_PLAYER_KEY).toBe('prono-entre-potes:active-player');
    expect(CURRENT_SCHEMA_VERSION).toBe(1);
  });

  describe('load', () => {
    it('sans donnée, renvoie un AppData vide', () => {
      setup();
      expect(repository.load()).toEqual({ status: 'ok', data: createEmptyAppData() });
    });

    it('relit ce que save a enregistré', () => {
      setup();
      const data = sampleData();
      expect(repository.save(data)).toEqual({ ok: true });
      expect(JSON.parse(storage.getItem(DATA_KEY)!)).toEqual(data);
      expect(repository.load()).toEqual({ status: 'ok', data });
    });

    it('JSON invalide : signale des données illisibles et en garde une copie, sans toucher à la clé principale', () => {
      setup({ [DATA_KEY]: '{pas du json' });
      expect(repository.load()).toEqual({ status: 'corrupted' });
      expect(storage.getItem(BACKUP_KEY)).toBe('{pas du json');
      expect(storage.getItem(DATA_KEY)).toBe('{pas du json');
    });

    it.each<[string, unknown]>([
      ['un tableau', []],
      ['null', null],
      ['sans players', { ...createEmptyAppData(), players: undefined }],
      ['players qui n’est pas un tableau', { ...createEmptyAppData(), players: {} }],
      ['un joueur sans nom', { ...createEmptyAppData(), players: [{ id: 'p1', createdAt: '2026-11-01T10:00:00.000Z' }] }],
      ['un match avec une journée en texte', { ...sampleData(), matches: [{ ...sampleData().matches[0], matchday: '1' }] }],
      ['un score hors limites', { ...sampleData(), results: [{ matchId: 'm1', score: { home: 100, away: 0 }, enteredAt: '2026-11-15T16:00:00.000Z' }] }],
      ['un score non entier', { ...sampleData(), predictions: [{ ...sampleData().predictions[0], score: { home: 1.5, away: 0 } }] }],
      ['sans nom de compétition', { ...createEmptyAppData(), competition: {} }],
      ['sans schemaVersion', { ...createEmptyAppData(), schemaVersion: undefined }],
    ])('structure incorrecte (%s) : même comportement que le JSON invalide', (_, value) => {
      const raw = JSON.stringify(value);
      setup({ [DATA_KEY]: raw });
      expect(repository.load()).toEqual({ status: 'corrupted' });
      expect(storage.getItem(BACKUP_KEY)).toBe(raw);
      expect(storage.getItem(DATA_KEY)).toBe(raw);
    });

    it('schemaVersion plus récent : renvoie les données en lecture seule', () => {
      const data = { ...sampleData(), schemaVersion: 2 };
      setup({ [DATA_KEY]: JSON.stringify(data) });
      const result = repository.load();
      expect(result.status).toBe('newer-version');
      expect(result.status === 'newer-version' && result.data.players).toEqual(data.players);
    });

    it('schemaVersion plus récent et structure inconnue : lecture seule avec des données vides', () => {
      setup({ [DATA_KEY]: JSON.stringify({ schemaVersion: 2, autreChose: true }) });
      expect(repository.load()).toEqual({ status: 'newer-version', data: createEmptyAppData() });
    });

    it('stockage inaccessible : signale "unavailable"', () => {
      setup();
      storage.blocked = true;
      expect(repository.load()).toEqual({ status: 'unavailable' });
    });

    it('aucun stockage fourni : signale "unavailable"', () => {
      TestBed.configureTestingModule({ providers: [{ provide: APP_STORAGE, useValue: null }] });
      expect(TestBed.inject(StorageRepository).load()).toEqual({ status: 'unavailable' });
    });
  });

  describe('save', () => {
    it('stockage plein : renvoie l’erreur "quota" et l’ancienne valeur reste intacte', () => {
      setup();
      repository.save(sampleData());
      const before = storage.getItem(DATA_KEY);
      storage.full = true;
      expect(repository.save(createEmptyAppData())).toEqual({ ok: false, error: 'quota' });
      expect(storage.getItem(DATA_KEY)).toBe(before);
    });

    it('stockage inaccessible : renvoie l’erreur "unavailable"', () => {
      setup();
      storage.blocked = true;
      expect(repository.save(sampleData())).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  describe('joueur actif', () => {
    it('saveActivePlayer puis loadActivePlayer', () => {
      setup();
      repository.saveActivePlayer('p2');
      expect(storage.getItem(ACTIVE_PLAYER_KEY)).toBe('p2');
      expect(repository.loadActivePlayer()).toBe('p2');
    });

    it('loadActivePlayer sans valeur renvoie null', () => {
      setup();
      expect(repository.loadActivePlayer()).toBeNull();
    });

    it('ne lève pas d’erreur si le stockage est inaccessible', () => {
      setup();
      storage.blocked = true;
      expect(() => repository.saveActivePlayer('p1')).not.toThrow();
      expect(repository.loadActivePlayer()).toBeNull();
    });
  });
});

function sampleData(): AppData {
  return {
    ...createEmptyAppData(),
    players: [{ id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' }],
    matches: [{ id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' }],
    predictions: [
      { playerId: 'p1', matchId: 'm1', score: { home: 1, away: 1 }, updatedAt: '2026-11-02T10:00:00.000Z' },
    ],
    results: [{ matchId: 'm1', score: { home: 2, away: 1 }, enteredAt: '2026-11-15T16:00:00.000Z' }],
  };
}
