import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDatabase, importAppData } from './import-app-data.ts';
import { testAppData } from './test-data.ts';

const all = (db: ReturnType<typeof createDatabase>, sql: string): unknown[] =>
  db
    .prepare(sql)
    .all()
    .map((row) => ({ ...row }));

const count = (db: ReturnType<typeof createDatabase>, table: string): number =>
  Number(db.prepare(`SELECT count(*) AS n FROM ${table}`).get()?.['n']);

describe('importAppData', () => {
  it('importe le nom de la compétition', () => {
    const db = createDatabase(':memory:');
    importAppData(db, testAppData());
    assert.deepEqual(all(db, 'SELECT name FROM competition'), [{ name: 'Ligue des potes' }]);
  });

  it('importe les joueurs avec leur nom tel quel', () => {
    const db = createDatabase(':memory:');
    importAppData(db, testAppData());
    assert.deepEqual(all(db, 'SELECT id, name, created_at FROM players ORDER BY id'), [
      { id: 'p1', name: 'Héloïse', created_at: '2026-11-01T10:00:00.000Z' },
      { id: 'p2', name: "D'Artagnan", created_at: '2026-11-01T10:01:00.000Z' },
      { id: 'p3', name: 'Jean-Baptiste', created_at: '2026-11-01T10:02:00.000Z' },
      { id: 'p4', name: 'Δημήτρης', created_at: '2026-11-01T10:03:00.000Z' },
      { id: 'p5', name: 'Hélène', created_at: '2026-11-01T10:04:00.000Z' },
    ]);
  });

  it('importe les matchs', () => {
    const db = createDatabase(':memory:');
    importAppData(db, testAppData());
    assert.deepEqual(all(db, 'SELECT id, matchday, home_team, away_team, kickoff FROM matches ORDER BY id'), [
      { id: 'm1', matchday: 1, home_team: 'Lille', away_team: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' },
      { id: 'm2', matchday: 2, home_team: 'Lens', away_team: 'Brest', kickoff: '2026-11-22T15:00:00.000Z' },
    ]);
  });

  it('garde les pronostics et les résultats dans deux tables distinctes', () => {
    const db = createDatabase(':memory:');
    importAppData(db, testAppData());
    assert.deepEqual(all(db, 'SELECT player_id, match_id, home, away FROM predictions ORDER BY player_id, match_id'), [
      { player_id: 'p1', match_id: 'm1', home: 2, away: 1 },
      { player_id: 'p1', match_id: 'm2', home: 1, away: 3 },
      { player_id: 'p2', match_id: 'm1', home: 0, away: 0 },
    ]);
    assert.deepEqual(all(db, 'SELECT match_id, home, away, entered_at FROM results'), [
      { match_id: 'm1', home: 2, away: 1, entered_at: '2026-11-15T16:00:00.000Z' },
    ]);
  });

  it('refuse une version de données inconnue sans rien écrire', () => {
    const db = createDatabase(':memory:');
    const data = { ...testAppData(), schemaVersion: 2 } as unknown as ReturnType<typeof testAppData>;
    assert.throws(() => importAppData(db, data), /version/i);
    assert.equal(count(db, 'players'), 0);
  });

  it('refuse un score hors de 0 à 99 et annule tout l’import', () => {
    const db = createDatabase(':memory:');
    const data = testAppData();
    data.predictions[2] = { ...data.predictions[2], score: { home: 120, away: 0 } };
    assert.throws(() => importAppData(db, data));
    assert.equal(count(db, 'players'), 0);
    assert.equal(count(db, 'predictions'), 0);
  });

  it('refuse un pronostic d’un joueur inconnu et annule tout l’import', () => {
    const db = createDatabase(':memory:');
    const data = testAppData();
    data.predictions.push({ playerId: 'inconnu', matchId: 'm1', score: { home: 1, away: 1 }, updatedAt: 'x' });
    assert.throws(() => importAppData(db, data));
    assert.equal(count(db, 'matches'), 0);
  });
});
