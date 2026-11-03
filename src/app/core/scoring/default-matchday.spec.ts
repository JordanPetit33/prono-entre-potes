import { Match, Result } from '../models/app-data';
import { defaultMatchday } from './default-matchday';

const NOW = new Date('2026-11-14T10:00:00.000Z');
const PAST = '2026-11-01T14:00:00.000Z';
const FUTURE = '2026-11-20T14:00:00.000Z';

function match(id: string, matchday: number, kickoff: string): Match {
  return { id, matchday, homeTeam: 'A', awayTeam: 'B', kickoff };
}

function result(matchId: string): Result {
  return { matchId, score: { home: 1, away: 0 }, enteredAt: PAST };
}

describe('defaultMatchday', () => {
  it('renvoie 1 s’il n’y a aucun match', () => {
    expect(defaultMatchday([], [], NOW)).toBe(1);
  });

  it('renvoie la première journée qui contient un match non verrouillé', () => {
    const matches = [match('a', 1, PAST), match('b', 2, PAST), match('c', 2, FUTURE), match('d', 3, FUTURE)];
    expect(defaultMatchday(matches, [], NOW)).toBe(2);
  });

  it('ne dépend pas de l’ordre des matchs', () => {
    const matches = [match('d', 3, FUTURE), match('c', 2, FUTURE), match('a', 1, PAST)];
    expect(defaultMatchday(matches, [], NOW)).toBe(2);
  });

  it('un match futur avec un résultat compte comme verrouillé', () => {
    const matches = [match('a', 1, FUTURE), match('b', 2, FUTURE)];
    expect(defaultMatchday(matches, [result('a')], NOW)).toBe(2);
  });

  it('renvoie la dernière journée quand tout est verrouillé', () => {
    const matches = [match('a', 1, PAST), match('b', 4, PAST), match('c', 2, PAST)];
    expect(defaultMatchday(matches, [], NOW)).toBe(4);
  });
});
