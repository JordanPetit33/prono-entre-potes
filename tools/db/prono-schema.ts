/**
 * Schéma SQLite des données de l'application (AppData, clé localStorage prono-entre-potes:data).
 * Les règles de l'application sont vérifiées par la base : scores de 0 à 99, journée ≥ 1, liens entre tables.
 * Les pronostics et les résultats restent dans deux tables distinctes.
 *
 * Données sensibles : les noms des joueurs et leurs pronostics. La recherche ne renvoie que l'identifiant et le nom.
 */
export const PRONO_SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE competition (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL
);

CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  matchday INTEGER NOT NULL CHECK (matchday >= 1),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  kickoff TEXT NOT NULL
);

CREATE TABLE predictions (
  player_id TEXT NOT NULL REFERENCES players (id) ON DELETE CASCADE,
  match_id TEXT NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
  home INTEGER NOT NULL CHECK (home BETWEEN 0 AND 99),
  away INTEGER NOT NULL CHECK (away BETWEEN 0 AND 99),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (player_id, match_id)
);

CREATE TABLE results (
  match_id TEXT PRIMARY KEY REFERENCES matches (id) ON DELETE CASCADE,
  home INTEGER NOT NULL CHECK (home BETWEEN 0 AND 99),
  away INTEGER NOT NULL CHECK (away BETWEEN 0 AND 99),
  entered_at TEXT NOT NULL
);

CREATE INDEX matches_matchday ON matches (matchday);
`;
