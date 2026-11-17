import type { AppData } from '../../src/app/core/models/app-data';

/**
 * Données fictives au format de l'application (clé localStorage prono-entre-potes:data).
 * Noms avec accent, apostrophe, trait d'union et alphabet non latin.
 */
export function testAppData(): AppData {
  return {
    schemaVersion: 1,
    competition: { name: 'Ligue des potes' },
    players: [
      { id: 'p1', name: 'Héloïse', createdAt: '2026-11-01T10:00:00.000Z' },
      { id: 'p2', name: "D'Artagnan", createdAt: '2026-11-01T10:01:00.000Z' },
      { id: 'p3', name: 'Jean-Baptiste', createdAt: '2026-11-01T10:02:00.000Z' },
      { id: 'p4', name: 'Δημήτρης', createdAt: '2026-11-01T10:03:00.000Z' },
      { id: 'p5', name: 'Hélène', createdAt: '2026-11-01T10:04:00.000Z' },
    ],
    matches: [
      { id: 'm1', matchday: 1, homeTeam: 'Lille', awayTeam: 'Nice', kickoff: '2026-11-15T14:00:00.000Z' },
      { id: 'm2', matchday: 2, homeTeam: 'Lens', awayTeam: 'Brest', kickoff: '2026-11-22T15:00:00.000Z' },
    ],
    predictions: [
      { playerId: 'p1', matchId: 'm1', score: { home: 2, away: 1 }, updatedAt: '2026-11-14T09:00:00.000Z' },
      { playerId: 'p2', matchId: 'm1', score: { home: 0, away: 0 }, updatedAt: '2026-11-14T09:05:00.000Z' },
      { playerId: 'p1', matchId: 'm2', score: { home: 1, away: 3 }, updatedAt: '2026-11-20T18:00:00.000Z' },
    ],
    results: [{ matchId: 'm1', score: { home: 2, away: 1 }, enteredAt: '2026-11-15T16:00:00.000Z' }],
  };
}
