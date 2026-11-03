import { Match } from '../models/app-data';
import { matchdayNumbers, matchesOfMatchday } from './matches';

function match(id: string, matchday: number, homeTeam: string, kickoff: string): Match {
  return { id, matchday, homeTeam, awayTeam: 'Adversaire', kickoff };
}

describe('matchesOfMatchday', () => {
  it('ne garde que les matchs de la journée demandée', () => {
    const matches = [
      match('a', 1, 'Lille', '2026-11-15T14:00:00.000Z'),
      match('b', 2, 'Nice', '2026-11-22T14:00:00.000Z'),
      match('c', 1, 'Lens', '2026-11-15T16:00:00.000Z'),
    ];
    expect(matchesOfMatchday(matches, 1).map((m) => m.id)).toEqual(['a', 'c']);
  });

  it('trie par coup d’envoi (F-24)', () => {
    const matches = [
      match('tard', 1, 'Lille', '2026-11-15T20:00:00.000Z'),
      match('tot', 1, 'Nice', '2026-11-14T14:00:00.000Z'),
      match('milieu', 1, 'Lens', '2026-11-15T14:00:00.000Z'),
    ];
    expect(matchesOfMatchday(matches, 1).map((m) => m.id)).toEqual(['tot', 'milieu', 'tard']);
  });

  it('à coup d’envoi égal, trie par équipe à domicile, sans tenir compte des accents ni de la casse', () => {
    const kickoff = '2026-11-15T14:00:00.000Z';
    const matches = [
      match('r', 1, 'Rennes', kickoff),
      match('e', 1, 'Évian', kickoff),
      match('b', 1, 'brest', kickoff),
    ];
    expect(matchesOfMatchday(matches, 1).map((m) => m.homeTeam)).toEqual(['brest', 'Évian', 'Rennes']);
  });

  it('renvoie une liste vide pour une journée sans match', () => {
    expect(matchesOfMatchday([match('a', 1, 'Lille', '2026-11-15T14:00:00.000Z')], 3)).toEqual([]);
  });

  it('ne modifie pas la liste reçue', () => {
    const matches = [
      match('b', 1, 'Nice', '2026-11-15T20:00:00.000Z'),
      match('a', 1, 'Lille', '2026-11-15T14:00:00.000Z'),
    ];
    matchesOfMatchday(matches, 1);
    expect(matches.map((m) => m.id)).toEqual(['b', 'a']);
  });
});

describe('matchdayNumbers', () => {
  it('renvoie les numéros de journée existants, triés et sans doublon', () => {
    const matches = [
      match('a', 3, 'Lille', '2026-11-15T14:00:00.000Z'),
      match('b', 1, 'Nice', '2026-11-01T14:00:00.000Z'),
      match('c', 3, 'Lens', '2026-11-15T16:00:00.000Z'),
      match('d', 10, 'Brest', '2027-01-10T14:00:00.000Z'),
    ];
    expect(matchdayNumbers(matches)).toEqual([1, 3, 10]);
  });

  it('renvoie une liste vide sans match', () => {
    expect(matchdayNumbers([])).toEqual([]);
  });
});
