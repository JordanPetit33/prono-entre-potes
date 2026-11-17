import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { createDatabase, importAppData } from './import-app-data.ts';
import { openReadOnly, registerSqlFunctions, searchPlayersByName } from './player-search.ts';
import { testAppData } from './test-data.ts';

const INJECTIONS = [
  "' OR '1'='1",
  "' OR 1=1 --",
  "x' UNION SELECT player_id, match_id FROM predictions --",
  "'; DELETE FROM players; --",
];

function createTestDatabase(): ReturnType<typeof createDatabase> {
  const db = createDatabase(':memory:');
  importAppData(db, testAppData());
  registerSqlFunctions(db);
  return db;
}

const names = (rows: { name: string }[]): string[] => rows.map((r) => r.name);

describe('searchPlayersByName', () => {
  const db = createTestDatabase();

  it('renvoie seulement l’identifiant et le nom, jamais les pronostics', () => {
    const [row] = searchPlayersByName(db, "D'Artagnan");
    assert.deepEqual(row, { id: 'p2', name: "D'Artagnan" });
    assert.deepEqual(Object.keys(row), ['id', 'name']);
  });

  it('trouve une partie du nom, sans tenir compte de la casse, triée par nom', () => {
    assert.deepEqual(names(searchPlayersByName(db, 'HEL')), ['Hélène', 'Héloïse']);
  });

  it('trouve un nom accentué, avec ou sans accent dans la saisie', () => {
    assert.deepEqual(names(searchPlayersByName(db, 'Héloïse')), ['Héloïse']);
    assert.deepEqual(names(searchPlayersByName(db, 'heloise')), ['Héloïse']);
    assert.deepEqual(names(searchPlayersByName(db, 'HÉLÈ')), ['Hélène']);
  });

  it('trouve un nom avec apostrophe ou trait d’union', () => {
    assert.deepEqual(names(searchPlayersByName(db, "d'art")), ["D'Artagnan"]);
    assert.deepEqual(names(searchPlayersByName(db, 'jean-b')), ['Jean-Baptiste']);
  });

  it('trouve un nom non latin', () => {
    assert.deepEqual(names(searchPlayersByName(db, 'δημητρης')), ['Δημήτρης']);
  });

  it('une saisie vide ne renvoie rien, au lieu de tous les joueurs', () => {
    assert.deepEqual(searchPlayersByName(db, ''), []);
    assert.deepEqual(searchPlayersByName(db, '   '), []);
  });

  for (const input of INJECTIONS) {
    it(`injection « ${input} » : aucune ligne`, () => {
      assert.deepEqual(searchPlayersByName(db, input), []);
    });
  }

  it('une tentative d’injection ne modifie pas la table', () => {
    searchPlayersByName(db, "'; DELETE FROM players; --");
    assert.equal(db.prepare('SELECT count(*) AS n FROM players').get()?.['n'], 5);
  });

  describe('jokers de LIKE', () => {
    for (const input of ['%', '%%%', '_', '___', '\\', '%\\%']) {
      it(`« ${input} » ne renvoie pas tous les joueurs`, () => {
        assert.deepEqual(searchPlayersByName(db, input), []);
      });
    }

    it('un « % » ou un « _ » saisi est cherché tel quel', () => {
      db.prepare(`INSERT INTO players (id, name, created_at) VALUES ('p6', 'Cent_100%', '2026-11-02T10:00:00.000Z')`).run();
      assert.deepEqual(names(searchPlayersByName(db, '100%')), ['Cent_100%']);
      assert.deepEqual(names(searchPlayersByName(db, 't_1')), ['Cent_100%']);
      assert.deepEqual(searchPlayersByName(db, 'cent%1'), []);
    });
  });
});

describe('openReadOnly', () => {
  const folder = mkdtempSync(join(tmpdir(), 'prono-tools-'));
  const path = join(folder, 'prono.db');
  const writable = createDatabase(path);
  importAppData(writable, testAppData());
  writable.close();

  const db = openReadOnly(path);
  after(() => {
    db.close();
    rmSync(folder, { recursive: true, force: true });
  });

  it('permet la recherche', () => {
    assert.deepEqual(names(searchPlayersByName(db, 'heloise')), ['Héloïse']);
  });

  it('refuse toute écriture', () => {
    assert.throws(() => db.exec('DELETE FROM players'), /readonly/);
    assert.throws(() => db.exec('DROP TABLE predictions'), /readonly/);
  });
});
