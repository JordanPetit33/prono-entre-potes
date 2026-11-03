import { timeUntil } from './time-until';

describe('timeUntil', () => {
  const from = new Date('2026-11-14T10:00:00.000Z');
  const at = (iso: string): Date => new Date(iso);

  it('en jours et heures au-delà d’un jour', () => {
    expect(timeUntil(from, at('2026-11-15T14:30:00.000Z'))).toBe('1 j 4 h');
  });

  it('en jours seuls quand il n’y a pas d’heure en plus', () => {
    expect(timeUntil(from, at('2026-11-16T10:20:00.000Z'))).toBe('2 j');
  });

  it('en heures et minutes en dessous d’un jour', () => {
    expect(timeUntil(from, at('2026-11-14T12:15:00.000Z'))).toBe('2 h 15 min');
  });

  it('en heures seules quand il n’y a pas de minute en plus', () => {
    expect(timeUntil(from, at('2026-11-14T13:00:30.000Z'))).toBe('3 h');
  });

  it('en minutes en dessous d’une heure', () => {
    expect(timeUntil(from, at('2026-11-14T10:42:00.000Z'))).toBe('42 min');
  });

  it('« moins d’une minute » en dessous d’une minute', () => {
    expect(timeUntil(from, at('2026-11-14T10:00:30.000Z'))).toBe('moins d’une minute');
  });

  it('null quand l’échéance est passée', () => {
    expect(timeUntil(from, from)).toBeNull();
    expect(timeUntil(from, at('2026-11-14T09:00:00.000Z'))).toBeNull();
  });
});
