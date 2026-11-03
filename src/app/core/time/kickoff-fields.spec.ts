import { kickoffFromFields, toKickoffFields } from './kickoff-fields';

describe('kickoffFromFields', () => {
  it('convertit JJ/MM/AAAA et HH:mm en date et heure locales', () => {
    expect(kickoffFromFields('15/11/2026', '15:30')).toEqual({ ok: true, kickoff: '2026-11-15T15:30' });
  });

  it.each<[string, string, string]>([
    ['5/1/2027', '9:05', '2027-01-05T09:05'],
    [' 05/01/2027 ', ' 09:05 ', '2027-01-05T09:05'],
    ['31/12/2026', '00:00', '2026-12-31T00:00'],
    ['29/02/2028', '23:59', '2028-02-29T23:59'],
    ['15/11/2026', '15h30', '2026-11-15T15:30'],
  ])('accepte « %s » « %s »', (date, time, kickoff) => {
    expect(kickoffFromFields(date, time)).toEqual({ ok: true, kickoff });
  });

  it.each([
    ['', '15:30'],
    ['15/11/2026', ''],
    ['  ', '  '],
  ])('demande la date et l’heure quand un champ est vide (« %s » « %s »)', (date, time) => {
    expect(kickoffFromFields(date, time)).toEqual({
      ok: false,
      error: 'La date et l’heure du coup d’envoi sont obligatoires.',
    });
  });

  it.each(['2026-11-15', '15-11-2026', '15/11/26', '15/11', 'demain'])('refuse la date « %s »', (date) => {
    expect(kickoffFromFields(date, '15:30')).toEqual({ ok: false, error: 'La date doit être au format JJ/MM/AAAA.' });
  });

  it.each(['31/02/2026', '29/02/2027', '00/11/2026', '15/13/2026', '31/04/2026'])(
    'refuse la date impossible « %s »',
    (date) => {
      expect(kickoffFromFields(date, '15:30')).toEqual({ ok: false, error: 'Cette date n’existe pas.' });
    },
  );

  it.each(['24:00', '15:60', '1530', '3 PM', '15:3', 'midi'])('refuse l’heure « %s »', (time) => {
    expect(kickoffFromFields('15/11/2026', time)).toEqual({
      ok: false,
      error: 'L’heure doit être au format HH:mm, de 00:00 à 23:59.',
    });
  });
});

describe('toKickoffFields', () => {
  it('donne la date et l’heure d’un coup d’envoi ISO, à l’heure de l’appareil', () => {
    expect(toKickoffFields(new Date('2026-11-15T15:30').toISOString())).toEqual({ date: '15/11/2026', time: '15:30' });
  });

  it('complète à deux chiffres', () => {
    expect(toKickoffFields(new Date('2027-01-05T09:05').toISOString())).toEqual({ date: '05/01/2027', time: '09:05' });
  });

  it('renvoie des champs vides pour une date invalide', () => {
    expect(toKickoffFields('pas une date')).toEqual({ date: '', time: '' });
  });

  it('fait l’aller-retour avec kickoffFromFields', () => {
    const iso = new Date('2026-11-15T15:30').toISOString();
    const { date, time } = toKickoffFields(iso);
    const parsed = kickoffFromFields(date, time);
    expect(parsed.ok && new Date(parsed.kickoff).toISOString()).toBe(iso);
  });
});
