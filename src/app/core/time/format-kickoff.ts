const pad = (n: number): string => String(n).padStart(2, '0');

/** Coup d'envoi au format JJ/MM/AAAA HH:mm, à l'heure de l'appareil (« 15/11/2026 15:00 »). */
export function formatKickoff(iso: string): string {
  const date = new Date(iso);
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
