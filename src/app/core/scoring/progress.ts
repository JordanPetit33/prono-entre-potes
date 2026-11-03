import { Id, Match, Prediction } from '../models/app-data';

export interface Progress {
  done: number;
  total: number;
}

/** Nombre de matchs de la journée pronostiqués par le joueur, sur le total de la journée (F-36). */
export function predictionProgress(
  matchesOfDay: readonly Match[],
  predictions: readonly Prediction[],
  playerId: Id | null,
): Progress {
  const predicted = new Set(predictions.filter((p) => p.playerId === playerId).map((p) => p.matchId));
  return {
    done: matchesOfDay.filter((m) => predicted.has(m.id)).length,
    total: matchesOfDay.length,
  };
}
