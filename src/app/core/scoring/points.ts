import { Id, Match, Player, Prediction, Result, Score } from '../models/app-data';

// Barème (F-50). C'est le seul endroit où il est défini (F-53).
export const POINTS_EXACT = 3;
export const POINTS_OUTCOME = 1;

export type Outcome = 'home' | 'draw' | 'away';
/** `exact` : score exact, `outcome` : bonne issue, `miss` : mauvaise issue, `none` : pas de pronostic. */
export type PointsKind = 'exact' | 'outcome' | 'miss' | 'none';

export interface MatchPoints {
  playerId: Id;
  matchId: Id;
  points: number;
  kind: PointsKind;
}

export function outcomeOf(score: Score): Outcome {
  if (score.home > score.away) return 'home';
  if (score.home < score.away) return 'away';
  return 'draw';
}

/** Points d'un pronostic face au résultat réel. */
export function pointsFor(prediction: Score, result: Score): { points: number; kind: Exclude<PointsKind, 'none'> } {
  if (prediction.home === result.home && prediction.away === result.away) {
    return { points: POINTS_EXACT, kind: 'exact' };
  }
  if (outcomeOf(prediction) === outcomeOf(result)) {
    return { points: POINTS_OUTCOME, kind: 'outcome' };
  }
  return { points: 0, kind: 'miss' };
}

/**
 * Points de chaque joueur sur chaque match qui a un résultat. Un match sans résultat ne rapporte rien (F-51) ;
 * un joueur sans pronostic marque 0 point (F-52). Calculés à la demande, jamais stockés.
 */
export function matchPoints(
  players: readonly Player[],
  matches: readonly Match[],
  predictions: readonly Prediction[],
  results: readonly Result[],
): MatchPoints[] {
  const matchIds = new Set(matches.map((m) => m.id));
  const predictionOf = new Map(predictions.map((p) => [`${p.playerId}|${p.matchId}`, p]));
  return results
    .filter((result) => matchIds.has(result.matchId))
    .flatMap((result) =>
      players.map((player): MatchPoints => {
        const prediction = predictionOf.get(`${player.id}|${result.matchId}`);
        const scored = prediction ? pointsFor(prediction.score, result.score) : { points: 0, kind: 'none' as const };
        return { playerId: player.id, matchId: result.matchId, ...scored };
      }),
    );
}
