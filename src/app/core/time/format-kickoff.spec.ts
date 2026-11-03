import { formatKickoff } from './format-kickoff';

describe('formatKickoff', () => {
  it('affiche la date et l’heure au format JJ/MM/AAAA HH:mm, à l’heure de l’appareil', () => {
    expect(formatKickoff(new Date('2026-11-15T15:30').toISOString())).toBe('15/11/2026 15:30');
  });

  it('complète jours, mois, heures et minutes à deux chiffres', () => {
    expect(formatKickoff(new Date('2027-01-05T09:05').toISOString())).toBe('05/01/2027 09:05');
  });

  it('affiche minuit en 00:00', () => {
    expect(formatKickoff(new Date('2026-12-31T00:00').toISOString())).toBe('31/12/2026 00:00');
  });
});
