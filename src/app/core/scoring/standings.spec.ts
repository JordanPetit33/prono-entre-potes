import { Player } from '../models/app-data';
import { MatchPoints, PointsKind } from './points';
import { gapToPrevious, rankLabel, standings } from './standings';

function player(id: string, name: string): Player {
  return { id, name, createdAt: '2026-11-01T10:00:00.000Z' };
}

const POINTS_BY_KIND: Record<PointsKind, number> = { exact: 3, outcome: 1, miss: 0, none: 0 };

/** Points d'un joueur : un élément par match, selon son type. */
function scored(playerId: string, kinds: PointsKind[]): MatchPoints[] {
  return kinds.map((kind, i) => ({ playerId, matchId: `m${i}`, points: POINTS_BY_KIND[kind], kind }));
}

describe('standings', () => {
  it('trie par points décroissants', () => {
    const players = [player('a', 'Karim'), player('b', 'Léa'), player('c', 'Tom')];
    const points = [...scored('a', ['outcome']), ...scored('b', ['exact', 'exact']), ...scored('c', ['exact'])];
    expect(standings(players, points).map((r) => [r.rank, r.name, r.points])).toEqual([
      [1, 'Léa', 6],
      [2, 'Tom', 3],
      [3, 'Karim', 1],
    ]);
  });

  it('départage une égalité de points par le nombre de scores exacts', () => {
    const players = [player('a', 'Karim'), player('b', 'Léa')];
    // Karim : 3 bonnes issues = 3 pts ; Léa : 1 score exact = 3 pts.
    const points = [...scored('a', ['outcome', 'outcome', 'outcome']), ...scored('b', ['exact', 'miss', 'miss'])];
    expect(standings(players, points).map((r) => [r.rank, r.name])).toEqual([
      [1, 'Léa'],
      [2, 'Karim'],
    ]);
  });

  it('égalité complète : même rang, rang suivant sauté (1, 2, 2, 4), ordre alphabétique', () => {
    const players = [player('a', 'Zoé'), player('b', 'Tom'), player('c', 'Ali'), player('d', 'Max')];
    const points = [
      ...scored('d', ['exact', 'exact']),
      ...scored('a', ['exact']),
      ...scored('c', ['exact']),
      ...scored('b', ['outcome']),
    ];
    expect(standings(players, points).map((r) => [r.rank, r.name])).toEqual([
      [1, 'Max'],
      [2, 'Ali'],
      [2, 'Zoé'],
      [4, 'Tom'],
    ]);
  });

  it('l’ordre alphabétique ignore la casse et les accents', () => {
    const players = [player('a', 'émile'), player('b', 'Eva'), player('c', 'Denis')];
    expect(standings(players, []).map((r) => r.name)).toEqual(['Denis', 'émile', 'Eva']);
  });

  it('un joueur sans pronostic apparaît avec 0 point', () => {
    const players = [player('a', 'Karim'), player('b', 'Léa')];
    const rows = standings(players, scored('a', ['exact']));
    expect(rows.at(-1)).toEqual({ rank: 2, playerId: 'b', name: 'Léa', points: 0, exactScores: 0, scoredMatches: 0 });
  });

  it('chaque ligne donne rang, nom, points, scores exacts et matchs comptés', () => {
    const players = [player('a', 'Karim')];
    const rows = standings(players, scored('a', ['exact', 'outcome', 'miss', 'none']));
    expect(rows).toEqual([{ rank: 1, playerId: 'a', name: 'Karim', points: 4, exactScores: 1, scoredMatches: 3 }]);
  });

  it('renvoie une liste vide sans joueur', () => {
    expect(standings([], [])).toEqual([]);
  });
});

describe('gapToPrevious', () => {
  const rows = standings(
    [player('a', 'Karim'), player('b', 'Léa'), player('c', 'Tom'), player('d', 'Ali')],
    [...scored('b', ['exact', 'exact']), ...scored('a', ['exact']), ...scored('d', ['exact']), ...scored('c', ['outcome', 'outcome'])],
  );
  // Léa 6 (1er) ; Ali 3 et Karim 3 (2e ex æquo) ; Tom 2 (4e).

  it('donne l’écart avec le joueur classé juste devant', () => {
    expect(gapToPrevious(rows, 'a')).toBe('3 pts derrière Léa');
  });

  it('ignore les ex æquo et vise le premier joueur qui a plus de points', () => {
    expect(gapToPrevious(rows, 'c')).toBe('1 pt derrière Ali');
  });

  it('à égalité de points, départagé par les scores exacts : le dit en clair', () => {
    const tied = standings(
      [player('a', 'Karim'), player('b', 'Léa')],
      [...scored('a', ['outcome', 'outcome', 'outcome']), ...scored('b', ['exact', 'miss', 'miss'])],
    );
    expect(gapToPrevious(tied, 'a')).toBe('à égalité de points avec Léa');
  });

  it('ne dit rien pour le premier', () => {
    expect(gapToPrevious(rows, 'b')).toBeNull();
  });

  it('ne dit rien pour un joueur inconnu', () => {
    expect(gapToPrevious(rows, 'inconnu')).toBeNull();
  });
});

describe('rankLabel', () => {
  it.each<[number, string]>([
    [1, '1er'],
    [2, '2e'],
    [11, '11e'],
  ])('%d → %s', (rank, label) => {
    expect(rankLabel(rank)).toBe(label);
  });
});
