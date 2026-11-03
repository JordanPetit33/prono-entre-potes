export const PLAYER_NAME_MAX_LENGTH = 30;

export type PlayerNameValidation = { ok: true; name: string } | { ok: false; error: string };

/** Forme de comparaison : sans casse ni accents. */
function comparable(name: string): string {
  return name.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function validatePlayerName(name: string, existingNames: readonly string[]): PlayerNameValidation {
  const trimmed = name.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Le nom est obligatoire.' };
  }
  if (Array.from(trimmed).length > PLAYER_NAME_MAX_LENGTH) {
    return { ok: false, error: `Le nom ne doit pas dépasser ${PLAYER_NAME_MAX_LENGTH} caractères.` };
  }
  const key = comparable(trimmed);
  if (existingNames.some((existing) => comparable(existing) === key)) {
    return { ok: false, error: 'Ce nom est déjà utilisé.' };
  }
  return { ok: true, name: trimmed };
}
