/**
 * Masque les données sensibles d'un log avant de le donner à l'agent.
 * Chaque valeur devient un marqueur numéroté (<EMAIL_1>, <IBAN_1>…), le même partout dans le fichier.
 *
 *   node tools/logs/mask-log.ts chemin/du.log > log-masque.txt
 */
import { readFileSync } from 'node:fs';

type Category = 'USER' | 'PASSWORD' | 'API_KEY' | 'IBAN' | 'EMAIL';

/** schema://utilisateur[:mot de passe]@hôte. Le mot de passe va jusqu'au dernier « @ » : il peut en contenir. */
const URL_CREDENTIALS = /\b([a-z][a-z0-9+.-]*:\/\/)([^:@/\s]+)(?::(\S*))?@(?=[^\s@/:]+)/gi;
/** Chaînes clé=valeur : Server=…;User Id=…;Password=…; */
const KEY_VALUE_USER = /\b(User Id|Uid|Username|User)(\s*=\s*)([^;\s]+)/gi;
const KEY_VALUE_PASSWORD = /\b(Password|Pwd)(\s*=\s*)([^;\s]+)/gi;
const API_KEY = /\bsk_(?:live|test)_[A-Za-z0-9]+/g;
const IBAN = /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,3})?\b/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

export function maskLog(text: string): string {
  const markers = new Map<string, string>();
  const counters = new Map<Category, number>();

  /** Même valeur, même marqueur ; une nouvelle valeur prend le numéro suivant de sa catégorie. */
  const mark = (category: Category, value: string): string => {
    const key = `${category}:${value}`;
    let marker = markers.get(key);
    if (!marker) {
      const n = (counters.get(category) ?? 0) + 1;
      counters.set(category, n);
      marker = `<${category}_${n}>`;
      markers.set(key, marker);
    }
    return marker;
  };

  // Les chaînes de connexion passent avant les e-mails : sinon « p@ss!W0rd@hote » serait pris pour un e-mail
  // à partir du dernier « @ », et le début du mot de passe resterait visible.
  return text
    .replace(URL_CREDENTIALS, (_, scheme: string, user: string, password?: string) => {
      const credentials =
        password === undefined ? mark('USER', user) : `${mark('USER', user)}:${mark('PASSWORD', password)}`;
      return `${scheme}${credentials}@`;
    })
    .replace(KEY_VALUE_USER, (_, key: string, equals: string, value: string) => `${key}${equals}${mark('USER', value)}`)
    .replace(
      KEY_VALUE_PASSWORD,
      (_, key: string, equals: string, value: string) => `${key}${equals}${mark('PASSWORD', value)}`,
    )
    .replace(API_KEY, (key) => mark('API_KEY', key))
    .replace(IBAN, (iban) => mark('IBAN', iban.replace(/ /g, '')))
    .replace(EMAIL, (email) => mark('EMAIL', email.toLowerCase()));
}

if (import.meta.main) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage : node tools/logs/mask-log.ts chemin/du.log > log-masque.txt');
    process.exit(1);
  }
  process.stdout.write(maskLog(readFileSync(path, 'utf8')));
}
