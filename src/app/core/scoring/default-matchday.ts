import { Match, Result } from '../models/app-data';
import { isMatchLocked } from '../validation/lock';
import { matchdayNumbers } from './matches';

/**
 * Journée affichée par défaut (F-72) : la première qui contient un match non verrouillé,
 * sinon la dernière, sinon la journée 1.
 */
export function defaultMatchday(matches: readonly Match[], results: readonly Result[], now: Date): number {
  const resultByMatch = new Map(results.map((r) => [r.matchId, r]));
  const matchdays = matchdayNumbers(matches);
  const open = matchdays.find((n) =>
    matches.some((m) => m.matchday === n && !isMatchLocked(m, resultByMatch.get(m.id) ?? null, now)),
  );
  return open ?? matchdays.at(-1) ?? 1;
}
