import { DatabaseSync } from 'node:sqlite';
import type { Id } from '../../src/app/core/models/app-data';

/** Seules colonnes renvoyées : jamais les pronostics ni les dates. */
export interface PublicPlayer {
  id: Id;
  name: string;
}

const MAX_RESULTS = 50;

/** Forme de comparaison : sans casse ni accents, comme pour les noms de joueurs de l'application. */
function comparable(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Neutralise les jokers de LIKE : un « % » ou un « _ » saisi est cherché tel quel. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Déclare la fonction SQL comparable(), utilisée par la recherche par nom. */
export function registerSqlFunctions(db: DatabaseSync): void {
  db.function('comparable', { deterministic: true }, (text) => comparable(String(text)));
}

/** Ouvre la base en lecture seule : toute écriture échoue, quelle que soit la requête. */
export function openReadOnly(path: string): DatabaseSync {
  const db = new DatabaseSync(path, { readOnly: true });
  registerSqlFunctions(db);
  return db;
}

/**
 * Recherche partielle par nom, sans tenir compte de la casse ni des accents.
 * La saisie passe en paramètre, jamais dans le texte de la requête. Une saisie vide ne renvoie rien.
 */
export function searchPlayersByName(db: DatabaseSync, query: string): PublicPlayer[] {
  const input = query.trim();
  if (input === '') {
    return [];
  }
  return db
    .prepare(
      `SELECT id, name FROM players WHERE comparable(name) LIKE ? ESCAPE '\\'
       ORDER BY comparable(name) LIMIT ${MAX_RESULTS}`,
    )
    .all(`%${escapeLike(comparable(input))}%`)
    .map((row) => ({ id: String(row['id']), name: String(row['name']) }));
}
