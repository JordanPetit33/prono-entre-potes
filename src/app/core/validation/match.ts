import { Match } from '../models/app-data';

export const TEAM_NAME_MAX_LENGTH = 40;

/** Saisie d'un match. `kickoff` est une date et heure locales lisibles par `new Date()`, ex. « 2026-11-15T15:30 ». */
export interface MatchInput {
  matchday: number;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
}

export type MatchFieldErrors = Partial<Record<keyof MatchInput, string>>;
export type MatchValidation = { ok: true; match: Omit<Match, 'id'> } | { ok: false; errors: MatchFieldErrors };

/** Retire les espaces de début et de fin, et réduit les espaces multiples. */
function clean(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function teamError(name: string, missing: string): string | undefined {
  if (name === '') return missing;
  if (Array.from(name).length > TEAM_NAME_MAX_LENGTH) {
    return `Le nom d’équipe ne doit pas dépasser ${TEAM_NAME_MAX_LENGTH} caractères.`;
  }
  return undefined;
}

export function validateMatch(input: MatchInput): MatchValidation {
  const errors: MatchFieldErrors = {};
  const homeTeam = clean(input.homeTeam);
  const awayTeam = clean(input.awayTeam);

  if (!Number.isInteger(input.matchday) || input.matchday < 1) {
    errors.matchday = 'La journée doit être un nombre entier supérieur ou égal à 1.';
  }

  const homeError = teamError(homeTeam, 'L’équipe à domicile est obligatoire.');
  const awayError = teamError(awayTeam, 'L’équipe à l’extérieur est obligatoire.');
  if (homeError) errors.homeTeam = homeError;
  if (awayError) errors.awayTeam = awayError;
  if (!homeError && !awayError && homeTeam.toLowerCase() === awayTeam.toLowerCase()) {
    errors.awayTeam = 'Les deux équipes doivent être différentes.';
  }

  const kickoff = new Date(input.kickoff.trim());
  if (input.kickoff.trim() === '') {
    errors.kickoff = 'La date et l’heure du coup d’envoi sont obligatoires.';
  } else if (Number.isNaN(kickoff.getTime())) {
    errors.kickoff = 'La date et l’heure du coup d’envoi ne sont pas valides.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, match: { matchday: input.matchday, homeTeam, awayTeam, kickoff: kickoff.toISOString() } };
}
