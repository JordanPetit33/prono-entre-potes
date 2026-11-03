import { toDatetimeLocal } from './datetime-local';

describe('toDatetimeLocal', () => {
  it('convertit une date ISO en valeur de champ datetime-local, à l’heure de l’appareil', () => {
    const local = '2026-11-15T15:00';
    expect(toDatetimeLocal(new Date(local).toISOString())).toBe(local);
  });

  it('complète les mois, jours, heures et minutes à deux chiffres', () => {
    const local = '2027-01-05T09:05';
    expect(toDatetimeLocal(new Date(local).toISOString())).toBe(local);
  });

  it('renvoie une chaîne vide pour une date invalide', () => {
    expect(toDatetimeLocal('pas une date')).toBe('');
  });
});
