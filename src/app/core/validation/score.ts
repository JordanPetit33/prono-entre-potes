import { Score } from '../models/app-data';

export const SCORE_MAX = 99;
export const SCORE_ERROR = `Le score doit être un nombre entier de 0 à ${SCORE_MAX}.`;

export type ScoreParsing = { ok: true; score: Score } | { ok: false; error: string };

/** Vrai pour un entier de 0 à 99 (F-31). */
export function isValidScoreValue(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= SCORE_MAX;
}

/** Lit la valeur d'un champ de score : un entier de 0 à 99, sinon null. */
export function parseScoreValue(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{1,2}$/.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

/** Lit les deux champs d'un score. */
export function parseScore(home: string, away: string): ScoreParsing {
  if (home.trim() === '' || away.trim() === '') {
    return { ok: false, error: 'Saisissez le score des deux équipes.' };
  }
  const homeValue = parseScoreValue(home);
  const awayValue = parseScoreValue(away);
  if (homeValue === null || awayValue === null) {
    return { ok: false, error: SCORE_ERROR };
  }
  return { ok: true, score: { home: homeValue, away: awayValue } };
}
