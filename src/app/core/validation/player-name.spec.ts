import { validatePlayerName } from './player-name';

describe('validatePlayerName', () => {
  it('refuse un nom vide', () => {
    expect(validatePlayerName('', [])).toEqual({ ok: false, error: 'Le nom est obligatoire.' });
  });

  it('refuse un nom fait uniquement d’espaces', () => {
    expect(validatePlayerName('   ', [])).toEqual({ ok: false, error: 'Le nom est obligatoire.' });
  });

  it('refuse un nom de 31 caractères', () => {
    expect(validatePlayerName('a'.repeat(31), [])).toEqual({
      ok: false,
      error: 'Le nom ne doit pas dépasser 30 caractères.',
    });
  });

  it('accepte un nom de 1 caractère', () => {
    expect(validatePlayerName('K', [])).toEqual({ ok: true, name: 'K' });
  });

  it('accepte un nom de 30 caractères', () => {
    const name = 'a'.repeat(30);
    expect(validatePlayerName(name, [])).toEqual({ ok: true, name });
  });

  it('compte la longueur après avoir retiré les espaces', () => {
    const name = 'a'.repeat(30);
    expect(validatePlayerName(`  ${name}  `, [])).toEqual({ ok: true, name });
  });

  it('retire les espaces de début et de fin', () => {
    expect(validatePlayerName('  Karim  ', [])).toEqual({ ok: true, name: 'Karim' });
  });

  it.each(['lea', 'LÉA', 'Lea', ' léa '])('refuse « %s » quand « Léa » existe déjà', (name) => {
    expect(validatePlayerName(name, ['Léa'])).toEqual({ ok: false, error: 'Ce nom est déjà utilisé.' });
  });

  it('accepte un nom différent des noms existants', () => {
    expect(validatePlayerName('Karim', ['Léa', 'Tom'])).toEqual({ ok: true, name: 'Karim' });
  });
});
