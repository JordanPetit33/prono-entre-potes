const pad = (n: number): string => String(n).padStart(2, '0');

/** Valeur d'un champ datetime-local (« 2026-11-15T15:00 », heure de l'appareil) pour une date ISO 8601. */
export function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
