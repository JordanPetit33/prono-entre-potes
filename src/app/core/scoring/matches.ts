import { Match } from '../models/app-data';

const byTeamName = new Intl.Collator('fr', { sensitivity: 'base' });

/** Matchs de la journée, triés par coup d'envoi puis par équipe à domicile (F-24). */
export function matchesOfMatchday(matches: readonly Match[], matchday: number): Match[] {
  return matches
    .filter((m) => m.matchday === matchday)
    .sort(
      (a, b) =>
        Date.parse(a.kickoff) - Date.parse(b.kickoff) || byTeamName.compare(a.homeTeam, b.homeTeam),
    );
}

/** Numéros des journées qui ont au moins un match, triés. */
export function matchdayNumbers(matches: readonly Match[]): number[] {
  return [...new Set(matches.map((m) => m.matchday))].sort((a, b) => a - b);
}
