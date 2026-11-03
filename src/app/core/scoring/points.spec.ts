import { Match, Player, Prediction, Result, Score } from '../models/app-data';
import { matchPoints, outcomeOf, pointsFor, POINTS_EXACT, POINTS_OUTCOME } from './points';

const s = (home: number, away: number): Score => ({ home, away });

describe('barème', () => {
  it('est défini par des constantes : 3 points pour un score exact, 1 pour la bonne issue (F-50, F-53)', () => {
    expect(POINTS_EXACT).toBe(3);
    expect(POINTS_OUTCOME).toBe(1);
  });
});

describe('outcomeOf', () => {
  it.each<[Score, string]>([
    [s(2, 1), 'home'],
    [s(1, 1), 'draw'],
    [s(0, 0), 'draw'],
    [s(0, 3), 'away'],
  ])('%o → %s', (score, outcome) => {
    expect(outcomeOf(score)).toBe(outcome);
  });
});

describe('pointsFor (spec §8.1)', () => {
  it.each<[string, Score, Score, number, string]>([
    ['score exact', s(2, 1), s(2, 1), 3, 'exact'],
    ['bon vainqueur à domicile, mauvais score', s(1, 0), s(3, 1), 1, 'outcome'],
    ['bon vainqueur à l’extérieur, mauvais score', s(0, 2), s(1, 3), 1, 'outcome'],
    ['nul prévu, nul réel avec un autre score', s(1, 1), s(2, 2), 1, 'outcome'],
    ['nul prévu, victoire réelle', s(1, 1), s(2, 1), 0, 'miss'],
    ['victoire prévue, nul réel', s(2, 1), s(1, 1), 0, 'miss'],
    ['mauvais vainqueur', s(2, 0), s(0, 1), 0, 'miss'],
    ['0–0 prévu et 0–0 réel', s(0, 0), s(0, 0), 3, 'exact'],
  ])('%s : prono %o, résultat %o → %d point(s)', (_, prediction, result, points, kind) => {
    expect(pointsFor(prediction, result)).toEqual({ points, kind });
  });
});

describe('matchPoints', () => {
  const players: Player[] = [
    { id: 'p1', name: 'Karim', createdAt: '2026-11-01T10:00:00.000Z' },
    { id: 'p2', name: 'Léa', createdAt: '2026-11-01T10:01:00.000Z' },
  ];
  const matches: Match[] = [
    { id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' },
    { id: 'm2', matchday: 1, homeTeam: 'Lens', awayTeam: 'Brest', kickoff: '2026-11-15T16:00:00.000Z' },
  ];
  const prediction = (playerId: string, matchId: string, score: Score): Prediction => ({
    playerId,
    matchId,
    score,
    updatedAt: '2026-11-14T10:00:00.000Z',
  });
  const result = (matchId: string, score: Score): Result => ({
    matchId,
    score,
    enteredAt: '2026-11-15T18:00:00.000Z',
  });

  it('calcule les points de chaque joueur sur chaque match qui a un résultat', () => {
    const predictions = [prediction('p1', 'm1', s(2, 1)), prediction('p2', 'm1', s(1, 0))];
    expect(matchPoints(players, matches, predictions, [result('m1', s(2, 1))])).toEqual([
      { playerId: 'p1', matchId: 'm1', points: 3, kind: 'exact' },
      { playerId: 'p2', matchId: 'm1', points: 1, kind: 'outcome' },
    ]);
  });

  it('n’attribue aucun point pour un match sans résultat (F-51)', () => {
    const predictions = [prediction('p1', 'm2', s(2, 1))];
    expect(matchPoints(players, matches, predictions, [])).toEqual([]);
  });

  it('donne 0 point et le type « none » à un joueur sans pronostic (F-52)', () => {
    const points = matchPoints(players, matches, [prediction('p1', 'm1', s(0, 0))], [result('m1', s(2, 1))]);
    expect(points).toContainEqual({ playerId: 'p2', matchId: 'm1', points: 0, kind: 'none' });
  });

  it('ignore un résultat dont le match n’existe plus', () => {
    expect(matchPoints(players, matches, [], [result('disparu', s(1, 0))])).toEqual([]);
  });
});
