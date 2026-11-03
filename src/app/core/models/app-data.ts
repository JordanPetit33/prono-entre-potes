/** Identifiant généré avec crypto.randomUUID(). */
export type Id = string;

export interface Score {
  /** Entier de 0 à 99. */
  home: number;
  /** Entier de 0 à 99. */
  away: number;
}

export interface Player {
  id: Id;
  name: string;
  /** ISO 8601. */
  createdAt: string;
}

export interface Match {
  id: Id;
  /** Entier ≥ 1. */
  matchday: number;
  homeTeam: string;
  awayTeam: string;
  /** ISO 8601, avec fuseau. */
  kickoff: string;
}

export interface Prediction {
  playerId: Id;
  matchId: Id;
  score: Score;
  /** ISO 8601. */
  updatedAt: string;
}

export interface Result {
  matchId: Id;
  score: Score;
  /** ISO 8601. */
  enteredAt: string;
}

export interface AppData {
  schemaVersion: 1;
  competition: { name: string };
  players: Player[];
  matches: Match[];
  /** Unique par (playerId, matchId). */
  predictions: Prediction[];
  /** Unique par matchId. */
  results: Result[];
}

export function createEmptyAppData(): AppData {
  return {
    schemaVersion: 1,
    competition: { name: 'Ma compétition' },
    players: [],
    matches: [],
    predictions: [],
    results: [],
  };
}
