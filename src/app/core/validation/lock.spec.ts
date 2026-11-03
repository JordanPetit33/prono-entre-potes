import { Match, Result } from '../models/app-data';
import { isMatchLocked } from './lock';

describe('isMatchLocked', () => {
  const match: Match = {
    id: 'm1',
    matchday: 1,
    homeTeam: 'Lille',
    awayTeam: 'Nice',
    kickoff: '2026-11-15T14:00:00.000Z',
  };
  const result: Result = { matchId: 'm1', score: { home: 2, away: 1 }, enteredAt: '2026-11-15T13:00:00.000Z' };

  it('est faux avant le coup d’envoi, sans résultat', () => {
    expect(isMatchLocked(match, null, new Date('2026-11-15T13:59:59.999Z'))).toBe(false);
  });

  it('est vrai à l’heure exacte du coup d’envoi', () => {
    expect(isMatchLocked(match, null, new Date('2026-11-15T14:00:00.000Z'))).toBe(true);
  });

  it('est vrai après le coup d’envoi', () => {
    expect(isMatchLocked(match, null, new Date('2026-11-16T10:00:00.000Z'))).toBe(true);
  });

  it('est vrai avant le coup d’envoi si un résultat existe', () => {
    expect(isMatchLocked(match, result, new Date('2026-11-15T12:00:00.000Z'))).toBe(true);
  });
});
