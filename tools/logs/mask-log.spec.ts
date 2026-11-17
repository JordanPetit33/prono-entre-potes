import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { maskLog } from './mask-log.ts';

const fixture = (name: string): string => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

describe('maskLog', () => {
  it('masque le log fictif comme attendu', () => {
    assert.equal(maskLog(fixture('app.log')), fixture('app.masked.log'));
  });

  it('ne laisse aucune donnée sensible du log fictif', () => {
    const masked = maskLog(fixture('app.log'));
    for (const secret of [
      'prono_app',
      'p@ss',
      'W0rd',
      'heloise',
      'Lefebvre',
      '3000 6000',
      'DE89',
      'sk_live_',
      'sk_test_',
      'Repli#2026',
      'User Id=sa',
    ]) {
      assert.ok(!masked.includes(secret), `« ${secret} » est encore visible`);
    }
  });

  describe('e-mails', () => {
    it('remplace chaque e-mail par un marqueur numéroté', () => {
      assert.equal(maskLog('de a@exemple.test vers b@exemple.test'), 'de <EMAIL_1> vers <EMAIL_2>');
    });

    it('garde le même marqueur pour le même e-mail, quelle que soit la casse', () => {
      assert.equal(maskLog('a@exemple.test, b@exemple.test, A@Exemple.TEST'), '<EMAIL_1>, <EMAIL_2>, <EMAIL_1>');
    });
  });

  describe('IBAN', () => {
    it('masque un IBAN avec ou sans espaces, avec le même marqueur', () => {
      assert.equal(
        maskLog('FR76 3000 6000 0112 3456 7890 189 puis FR7630006000011234567890189'),
        '<IBAN_1> puis <IBAN_1>',
      );
    });

    it('ne touche pas au texte ordinaire', () => {
      const text = 'GET /api/journees/12 200 OK en 35 ms';
      assert.equal(maskLog(text), text);
    });
  });

  describe('clés d’API', () => {
    it('masque les clés sk_live_ et sk_test_', () => {
      assert.equal(maskLog('sk_live_AbCdEf0123456789 et sk_test_ZyXwVu9876543210'), '<API_KEY_1> et <API_KEY_2>');
    });
  });

  describe('chaînes de connexion', () => {
    it('masque l’utilisateur et le mot de passe d’une URL, en gardant l’hôte', () => {
      assert.equal(
        maskLog('mysql://root:secret@localhost:3306/prono'),
        'mysql://<USER_1>:<PASSWORD_1>@localhost:3306/prono',
      );
    });

    it('masque l’utilisateur d’une URL sans mot de passe', () => {
      assert.equal(maskLog('redis://admin@cache.exemple.test'), 'redis://<USER_1>@cache.exemple.test');
    });

    it('piège : un mot de passe qui contient « @ » est masqué en entier', () => {
      assert.equal(
        maskLog('postgres://app:mot@de@passe@db.exemple.test/prono'),
        'postgres://<USER_1>:<PASSWORD_1>@db.exemple.test/prono',
      );
    });

    it('masque User Id et Password d’une chaîne clé=valeur', () => {
      assert.equal(
        maskLog('Server=db;User Id=sa;Password=Pa55;'),
        'Server=db;User Id=<USER_1>;Password=<PASSWORD_1>;',
      );
    });
  });

  it('renvoie un texte sans donnée sensible inchangé', () => {
    assert.equal(maskLog(''), '');
    assert.equal(maskLog('Arrêt propre, 3 joueurs connectés'), 'Arrêt propre, 3 joueurs connectés');
  });
});
