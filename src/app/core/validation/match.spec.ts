import { MatchInput, validateMatch } from './match';

describe('validateMatch', () => {
  const valid: MatchInput = {
    matchday: 1,
    homeTeam: 'Lille',
    awayTeam: 'Nice',
    kickoff: '2026-11-15T15:00',
  };

  it('accepte un match valide et renvoie le coup d’envoi en ISO 8601', () => {
    expect(validateMatch(valid)).toEqual({
      ok: true,
      match: {
        matchday: 1,
        homeTeam: 'Lille',
        awayTeam: 'Nice',
        kickoff: new Date('2026-11-15T15:00').toISOString(),
      },
    });
  });

  it('renvoie les noms d’équipe nettoyés', () => {
    const result = validateMatch({ ...valid, homeTeam: '  Paris   SG ', awayTeam: ' Lyon ' });
    expect(result.ok && result.match.homeTeam).toBe('Paris SG');
    expect(result.ok && result.match.awayTeam).toBe('Lyon');
  });

  it('accepte une équipe de 40 caractères', () => {
    expect(validateMatch({ ...valid, homeTeam: 'a'.repeat(40) }).ok).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN])('refuse la journée %s', (matchday) => {
    expect(validateMatch({ ...valid, matchday })).toEqual({
      ok: false,
      errors: { matchday: 'La journée doit être un nombre entier supérieur ou égal à 1.' },
    });
  });

  it('refuse une équipe à domicile vide', () => {
    expect(validateMatch({ ...valid, homeTeam: '  ' })).toEqual({
      ok: false,
      errors: { homeTeam: 'L’équipe à domicile est obligatoire.' },
    });
  });

  it('refuse une équipe à l’extérieur vide', () => {
    expect(validateMatch({ ...valid, awayTeam: '' })).toEqual({
      ok: false,
      errors: { awayTeam: 'L’équipe à l’extérieur est obligatoire.' },
    });
  });

  it('refuse une équipe de 41 caractères', () => {
    expect(validateMatch({ ...valid, awayTeam: 'a'.repeat(41) })).toEqual({
      ok: false,
      errors: { awayTeam: 'Le nom d’équipe ne doit pas dépasser 40 caractères.' },
    });
  });

  it.each([
    ['Lille', 'Lille'],
    ['Paris SG', 'paris sg'],
    ['Paris SG', '  PARIS   SG '],
  ])('refuse deux équipes identiques (« %s » contre « %s »)', (homeTeam, awayTeam) => {
    expect(validateMatch({ ...valid, homeTeam, awayTeam })).toEqual({
      ok: false,
      errors: { awayTeam: 'Les deux équipes doivent être différentes.' },
    });
  });

  it('refuse un coup d’envoi vide', () => {
    expect(validateMatch({ ...valid, kickoff: '' })).toEqual({
      ok: false,
      errors: { kickoff: 'La date et l’heure du coup d’envoi sont obligatoires.' },
    });
  });

  it('refuse une date invalide', () => {
    expect(validateMatch({ ...valid, kickoff: 'pas une date' })).toEqual({
      ok: false,
      errors: { kickoff: 'La date et l’heure du coup d’envoi ne sont pas valides.' },
    });
  });

  it('signale toutes les erreurs à la fois', () => {
    const result = validateMatch({ matchday: 0, homeTeam: '', awayTeam: '', kickoff: '' });
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(['awayTeam', 'homeTeam', 'kickoff', 'matchday']);
  });
});
