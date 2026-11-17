# Sécuriser le travail de l'agent IA sur les données de l'application

L'application garde ses données dans le `localStorage` du navigateur (clé `prono-entre-potes:data`, format `AppData`). Pour s'exercer, on les exporte dans une base SQLite qui reprend le modèle de l'application : `competition`, `players`, `matches`, `predictions`, `results`.

Données sensibles : **les noms des joueurs et leurs pronostics**.

Principe : **l'agent écrit les requêtes, il ne voit aucune donnée réelle et ne peut rien modifier.**

## Où est quoi

| Élément | Fichier |
|---|---|
| Schéma SQLite du modèle de l'application | `tools/db/prono-schema.ts` |
| Import de l'export de l'application, à lancer soi-même | `tools/db/import-app-data.ts` : `data/prono-export.json` → `data/prono.db` |
| Extraction du schéma seul, pour l'agent | `tools/db/export-schema.ts` → `docs/schema.txt` |
| Données de test fictives (accent, apostrophe, trait d'union, nom non latin) | `tools/db/test-data.ts` |
| Recherche de joueurs paramétrée et ses tests | `tools/db/player-search.ts`, `player-search.spec.ts` |
| Tests de l'import | `tools/db/import-app-data.spec.ts` |
| Masquage de logs et ses tests | `tools/logs/mask-log.ts`, `mask-log.spec.ts`, `tools/logs/fixtures/` |
| Règles de l'agent | `.claude/settings.json` |
| Hook de fin qui relance les tests | `.claude/hooks/run-tools-tests.sh` |
| Hook Git anti-secrets | `.githooks/pre-commit`, `.gitleaks.toml` |

## À faire soi-même

Ces étapes touchent `data/` : l'agent n'a pas le droit de les faire.

1. Avec `npm start` lancé, ouvrir l'application, puis la console du navigateur (F12) et taper :

   ```js
   copy(localStorage.getItem('prono-entre-potes:data'))
   ```

2. Coller le contenu du presse-papiers dans un nouveau fichier `data/prono-export.json`.
3. Dans le terminal :

   ```bash
   node tools/db/import-app-data.ts
   node tools/db/export-schema.ts
   npm run test:tools
   ```

L'import est refait de zéro à chaque lancement. Un export invalide est refusé sans créer de base.

Pour un log réel : `node tools/logs/mask-log.ts chemin/du.log > log-masque.txt`, relire le résultat, puis ne donner que `log-masque.txt` à l'agent.

## Garde-fous

- **Lecture** : `.env`, `*.sql`, `*.dump` et `data/` sont interdits en lecture et en écriture, y compris par une commande shell.
- **Commandes** : chacune demande une confirmation, en particulier `sqlite3`, `psql` et `mysql`.
- **Base** : la recherche ouvre la base en lecture seule (`openReadOnly`), donc toute écriture échoue.
- **Import** : tout ou rien ; la base refuse ce que l'application refuse (score hors de 0 à 99, journée < 1, pronostic d'un joueur ou d'un match inconnu). Pronostics et résultats restent dans deux tables distinctes.
- **Requêtes** : la saisie passe toujours en paramètre ; les jokers `%` et `_` de `LIKE` sont échappés ; une saisie vide ne renvoie rien ; seuls l'identifiant et le nom du joueur sortent, jamais ses pronostics.
- **Logs** : les chaînes de connexion sont masquées avant les e-mails, sinon un mot de passe contenant « @ » resterait en partie visible.
- **Fin de tour** : le hook `Stop` relance `npm run test:tools` et oblige l'agent à corriger un test cassé.

## Checklist

- [ ] Aucune donnée réelle dans le contexte de l'agent : il n'a reçu que `docs/schema.txt` et des données fictives.
- [ ] Secrets et données bloqués par une règle testée : « Affiche le contenu de data/prono-export.json » est refusé.
- [ ] Requêtes paramétrées, avec un test d'injection (`' OR '1'='1`) qui ne renvoie aucune ligne.
- [ ] Une saisie vide ou faite de jokers (`%`, `___`) ne renvoie pas tous les joueurs.
- [ ] Seules les colonnes utiles sont renvoyées.
- [ ] Accès en lecture seule, jamais à la production : « Supprime tous les pronostics de data/prono.db » est bloqué ou demande une autorisation.
- [ ] Logs masqués par un script testé avant d'être fournis à l'agent.
