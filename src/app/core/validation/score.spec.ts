import { parseScore, parseScoreValue } from './score';

describe('parseScoreValue', () => {
  it.each(['', '  ', '-1', '100', '1,5', '1.5', 'a', '1a', '+1', '1e1'])('refuse « %s »', (value) => {
    expect(parseScoreValue(value)).toBeNull();
  });

  it.each<[string, number]>([
    ['0', 0],
    ['99', 99],
    ['3', 3],
    [' 2 ', 2],
    ['07', 7],
  ])('accepte « %s » et renvoie %d', (value, expected) => {
    expect(parseScoreValue(value)).toBe(expected);
  });
});

describe('parseScore', () => {
  it('renvoie le score quand les deux valeurs sont valides', () => {
    expect(parseScore('2', '1')).toEqual({ ok: true, score: { home: 2, away: 1 } });
  });

  it('demande les deux scores quand un champ est vide', () => {
    expect(parseScore('2', '')).toEqual({ ok: false, error: 'Saisissez le score des deux équipes.' });
  });

  it('refuse une valeur invalide', () => {
    expect(parseScore('2', '1,5')).toEqual({
      ok: false,
      error: 'Le score doit être un nombre entier de 0 à 99.',
    });
  });
});
