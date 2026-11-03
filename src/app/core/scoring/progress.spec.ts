import { Match, Prediction } from '../models/app-data';
import { predictionProgress } from './progress';

function match(id: string): Match {
  return { id, matchday: 1, homeTeam: 'A', awayTeam: 'B', kickoff: '2026-11-20T14:00:00.000Z' };
}

function prediction(playerId: string, matchId: string): Prediction {
  return { playerId, matchId, score: { home: 1, away: 0 }, updatedAt: '2026-11-14T10:00:00.000Z' };
}

describe('predictionProgress', () => {
  const matches = [match('m1'), match('m2'), match('m3')];

  it('compte les matchs pronostiqués par le joueur sur le total de la journée', () => {
    expect(predictionProgress(matches, [prediction('p1', 'm1'), prediction('p1', 'm3')], 'p1')).toEqual({
      done: 2,
      total: 3,
    });
  });

  it('ne compte que les pronostics du joueur donné', () => {
    expect(predictionProgress(matches, [prediction('p2', 'm1'), prediction('p2', 'm2')], 'p1')).toEqual({
      done: 0,
      total: 3,
    });
  });

  it('ignore les pronostics sur des matchs d’autres journées', () => {
    expect(predictionProgress(matches, [prediction('p1', 'autre')], 'p1')).toEqual({ done: 0, total: 3 });
  });

  it('renvoie 0 / 0 pour une journée sans match', () => {
    expect(predictionProgress([], [prediction('p1', 'm1')], 'p1')).toEqual({ done: 0, total: 0 });
  });

  it('renvoie 0 pronostic sans joueur', () => {
    expect(predictionProgress(matches, [prediction('p1', 'm1')], null)).toEqual({ done: 0, total: 3 });
  });
});
