# Plan de réalisation

Le projet n'est pas encore initialisé avec Angular ; les chemins ci-dessous sont les emplacements prévus et pourront être ajustés à la structure générée. Les tests unitaires sont écrits avec Vitest via Angular CLI et lancés avec `npm test`. Les dépendances nécessaires, notamment celles de l'application Angular et de sa PWA, ne seront ajoutées qu'après accord explicite.

## 1. Initialiser l'application Angular

- **À construire :** socle TypeScript/Angular, navigation de base et configuration du lancement, de la compilation et de Vitest.
- **Test de réussite :** `npm test` passe avec un test initial de rendu de l'application ; `npm run build` compile sans erreur.
- **Fichiers concernés :** `package.json`, fichier de verrouillage npm, configuration Angular, `src/main.ts`, `src/app/app.config.ts`, `src/app/app.component.ts`, `src/app/app.component.spec.ts`.

## 2. Modéliser les matchs et calculer les points

- **À construire :** types pour les joueurs, matchs, pronostics et résultats réels, puis service de calcul suivant les règles de points validées pour le projet.
- **Test de réussite :** tests Vitest du service couvrant chaque cas de la règle de calcul décidée et vérifiant qu'aucun point n'est calculé avant la saisie du résultat réel.
- **Fichiers concernés :** `src/app/core/models/`, `src/app/core/scoring/`, tests `.spec.ts` associés.

## 3. Saisir les matchs, pronostics et résultats

- **À construire :** écrans de saisie des matchs, pronostics et résultats manuels, avec validation et stockage local dans le navigateur. Les pronostics et les résultats restent des données distinctes.
- **Test de réussite :** tests Vitest des formulaires et du stockage : une saisie valide est conservée, une saisie invalide est refusée, et modifier un résultat ne remplace pas un pronostic.
- **Fichiers concernés :** `src/app/matches/`, `src/app/predictions/`, `src/app/results/`, `src/app/core/storage/`, tests `.spec.ts` associés.

## 4. Afficher les points et le classement

- **À construire :** calcul des scores des joueurs à partir des pronostics et résultats saisis, puis affichage du classement de la compétition unique.
- **Test de réussite :** tests Vitest avec plusieurs joueurs et matchs vérifiant les points attribués, l'ordre du classement et la mise à jour après saisie d'un résultat.
- **Fichiers concernés :** `src/app/standings/`, `src/app/core/scoring/`, tests `.spec.ts` associés.

## 5. Rendre l'application installable et vérifier l'accès hors ligne

- **À construire :** service worker Angular et ressources PWA nécessaires pour installer l'application et servir l'interface hors ligne. Cette étape ne synchronise pas les données entre appareils et ne récupère pas les résultats.
- **Test de réussite :** tests Vitest pour les éléments de configuration testables, `npm run build`, puis vérification dans un navigateur : installer l'application, la charger une première fois et confirmer que l'interface s'ouvre ensuite hors ligne.
- **Fichiers concernés :** configuration Angular et service worker, `ngsw-config.json`, manifeste PWA sous `src/`, icônes sous `public/` ou `src/assets/`, tests `.spec.ts` associés.

Les scripts `npm start`, `npm test` et `npm run build` seront configurés dans `package.json` à l'étape 1. Les dépendances devront être approuvées avant leur ajout.
