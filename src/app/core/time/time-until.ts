const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Temps restant de `from` à `to`, en français court (« 1 j 4 h », « 2 h 15 min »). Null si `to` est passé. */
export function timeUntil(from: Date, to: Date): string | null {
  const ms = to.getTime() - from.getTime();
  if (ms <= 0) {
    return null;
  }
  if (ms >= DAY) {
    const days = Math.floor(ms / DAY);
    const hours = Math.floor((ms % DAY) / HOUR);
    return hours > 0 ? `${days} j ${hours} h` : `${days} j`;
  }
  if (ms >= HOUR) {
    const hours = Math.floor(ms / HOUR);
    const minutes = Math.floor((ms % HOUR) / MINUTE);
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }
  if (ms >= MINUTE) {
    return `${Math.floor(ms / MINUTE)} min`;
  }
  return 'moins d’une minute';
}
