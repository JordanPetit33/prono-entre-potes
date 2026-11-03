import { Id, Player } from '../models/app-data';
import { MatchPoints } from './points';

export interface StandingRow {
  rank: number;
  playerId: Id;
  name: string;
  points: number;
  exactScores: number;
  /** Matchs pronostiqués qui ont un résultat. */
  scoredMatches: number;
}

const byName = new Intl.Collator('fr', { sensitivity: 'base' });

/** « 0 pt », « 1 pt », « 3 pts ». */
export function formatPoints(points: number): string {
  return `${points} ${points > 1 ? 'pts' : 'pt'}`;
}

/** « 1er », « 2e », « 11e ». */
export function rankLabel(rank: number): string {
  return rank === 1 ? '1er' : `${rank}e`;
}

/**
 * Classement général (F-60, F-61) : points décroissants, puis scores exacts décroissants.
 * Les joueurs encore à égalité partagent le rang (1, 2, 2, 4) et sont classés par ordre alphabétique.
 */
export function standings(players: readonly Player[], matchPoints: readonly MatchPoints[]): StandingRow[] {
  const sorted = players
    .map((player) => {
      const own = matchPoints.filter((p) => p.playerId === player.id);
      return {
        playerId: player.id,
        name: player.name,
        points: own.reduce((sum, p) => sum + p.points, 0),
        exactScores: own.filter((p) => p.kind === 'exact').length,
        scoredMatches: own.filter((p) => p.kind !== 'none').length,
      };
    })
    .sort((a, b) => b.points - a.points || b.exactScores - a.exactScores || byName.compare(a.name, b.name));

  return sorted.map((row) => {
    const tiedWith = sorted.findIndex((other) => other.points === row.points && other.exactScores === row.exactScores);
    return { rank: tiedWith + 1, ...row };
  });
}

/**
 * Écart avec le joueur classé juste devant (F-62), par exemple « 3 pts derrière Léa ».
 * Avec des ex æquo devant, vise le premier d'entre eux. Null pour le premier ou un joueur inconnu.
 */
export function gapToPrevious(rows: readonly StandingRow[], playerId: Id): string | null {
  const own = rows.find((r) => r.playerId === playerId);
  if (!own || own.rank === 1) return null;
  const previousRank = Math.max(...rows.filter((r) => r.rank < own.rank).map((r) => r.rank));
  const ahead = rows.find((r) => r.rank === previousRank)!;
  const gap = ahead.points - own.points;
  return gap === 0 ? `à égalité de points avec ${ahead.name}` : `${formatPoints(gap)} derrière ${ahead.name}`;
}
