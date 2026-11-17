/**
 * Charge les données exportées de l'application dans une base SQLite.
 * À lancer soi-même : l'agent n'a pas le droit de lire le dossier data/.
 *
 *   node tools/db/import-app-data.ts [export JSON] [base]
 *
 * Par défaut : data/prono-export.json → data/prono.db (la base est recréée à chaque import).
 */
import { readFileSync, rmSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import type { AppData } from '../../src/app/core/models/app-data';
import { PRONO_SCHEMA } from './prono-schema.ts';

const SUPPORTED_SCHEMA_VERSION = 1;

/** Crée une base vide avec le schéma de l'application. */
export function createDatabase(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec(PRONO_SCHEMA);
  return db;
}

/** Importe tout ou rien : à la première ligne refusée par la base, l'import est annulé. */
export function importAppData(db: DatabaseSync, data: AppData): void {
  if (data.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(`Version de données non prise en charge : ${String(data.schemaVersion)}.`);
  }
  db.exec('BEGIN');
  try {
    db.prepare('INSERT INTO competition (id, name) VALUES (1, ?)').run(data.competition.name);

    const insertPlayer = db.prepare('INSERT INTO players (id, name, created_at) VALUES (?, ?, ?)');
    for (const p of data.players) {
      insertPlayer.run(p.id, p.name, p.createdAt);
    }

    const insertMatch = db.prepare(
      'INSERT INTO matches (id, matchday, home_team, away_team, kickoff) VALUES (?, ?, ?, ?, ?)',
    );
    for (const m of data.matches) {
      insertMatch.run(m.id, m.matchday, m.homeTeam, m.awayTeam, m.kickoff);
    }

    const insertPrediction = db.prepare(
      'INSERT INTO predictions (player_id, match_id, home, away, updated_at) VALUES (?, ?, ?, ?, ?)',
    );
    for (const p of data.predictions) {
      insertPrediction.run(p.playerId, p.matchId, p.score.home, p.score.away, p.updatedAt);
    }

    const insertResult = db.prepare('INSERT INTO results (match_id, home, away, entered_at) VALUES (?, ?, ?, ?)');
    for (const r of data.results) {
      insertResult.run(r.matchId, r.score.home, r.score.away, r.enteredAt);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

if (import.meta.main) {
  const exportPath = process.argv[2] ?? 'data/prono-export.json';
  const databasePath = process.argv[3] ?? 'data/prono.db';

  let data: AppData;
  try {
    data = JSON.parse(readFileSync(exportPath, 'utf8')) as AppData;
  } catch (error) {
    console.error(`Impossible de lire ${exportPath} : ${(error as Error).message}`);
    process.exit(1);
  }

  rmSync(databasePath, { force: true });
  const db = createDatabase(databasePath);
  try {
    importAppData(db, data);
  } catch (error) {
    db.close();
    rmSync(databasePath, { force: true });
    console.error(`Import refusé : ${(error as Error).message}`);
    process.exit(1);
  }
  db.close();
  const counted = (n: number, word: string): string => `${n} ${word}${n > 1 ? 's' : ''}`;
  console.log(
    `${counted(data.players.length, 'joueur')}, ${counted(data.matches.length, 'match')}, ` +
      `${counted(data.predictions.length, 'pronostic')} et ${counted(data.results.length, 'résultat')} ` +
      `écrits dans ${databasePath}.`,
  );
}
