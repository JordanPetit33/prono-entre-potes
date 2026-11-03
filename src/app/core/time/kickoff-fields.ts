const pad = (n: number): string => String(n).padStart(2, '0');

/** `kickoff` : date et heure locales au format « 2026-11-15T15:30 », lisibles par `new Date()`. */
export type KickoffParsing = { ok: true; kickoff: string } | { ok: false; error: string };

/**
 * Lit les champs « Date » (JJ/MM/AAAA) et « Heure » (HH:mm) du coup d'envoi, à l'heure de l'appareil.
 * Le jour, le mois et l'heure peuvent n'avoir qu'un chiffre ; l'heure accepte aussi « 15h30 ».
 */
export function kickoffFromFields(date: string, time: string): KickoffParsing {
  const dateText = date.trim();
  const timeText = time.trim();
  if (dateText === '' || timeText === '') {
    return { ok: false, error: 'La date et l’heure du coup d’envoi sont obligatoires.' };
  }

  const dateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateText);
  if (!dateMatch) {
    return { ok: false, error: 'La date doit être au format JJ/MM/AAAA.' };
  }
  const [day, month, year] = dateMatch.slice(1).map(Number);
  const check = new Date(year, month - 1, day);
  if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) {
    return { ok: false, error: 'Cette date n’existe pas.' };
  }

  const timeMatch = /^(\d{1,2})[:hH](\d{2})$/.exec(timeText);
  const [hours, minutes] = timeMatch ? timeMatch.slice(1).map(Number) : [NaN, NaN];
  if (!(hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59)) {
    return { ok: false, error: 'L’heure doit être au format HH:mm, de 00:00 à 23:59.' };
  }

  return { ok: true, kickoff: `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}` };
}

/** Valeurs des champs « Date » et « Heure » pour un coup d'envoi ISO 8601, à l'heure de l'appareil. */
export function toKickoffFields(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: '', time: '' };
  }
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
