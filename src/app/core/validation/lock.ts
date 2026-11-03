import { Match, Result } from '../models/app-data';

/** Un pronostic est verrouillé dès le coup d'envoi, ou dès qu'un résultat est saisi (F-33). */
export function isMatchLocked(match: Match, result: Result | null, now: Date): boolean {
  return result !== null || now.getTime() >= Date.parse(match.kickoff);
}
