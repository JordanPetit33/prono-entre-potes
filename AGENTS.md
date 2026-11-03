# AGENTS.md

## Le projet

Prono entre potes permet à un petit groupe d'amis de pronostiquer les scores des matchs de football, de calculer les points après la saisie manuelle des résultats et de suivre un classement.

Le périmètre actuel est une seule compétition, sans paris d'argent, sans récupération automatique des résultats, sans comptes utilisateurs et sans synchronisation en ligne.

## Stack

- Langage : TypeScript.
- Framework : Angular.
- PWA : s'appuyer sur le service worker Angular pour rendre l'application installable et permettre l'accès hors ligne à l'interface ; cela n'implique ni synchronisation en ligne ni récupération automatique des résultats.
- Tests : Vitest via Angular CLI.
- Gestionnaire de paquets : npm. Les versions exactes d'Angular, TypeScript et Vitest seront fixées lors de l'initialisation, en vérifiant leur compatibilité.

## Commandes

- `npm start` : lancer le serveur de développement.
- `npm test` : exécuter les tests Vitest via Angular CLI.
- `npm run build` : compiler l'application.
- Ces scripts seront configurés dans `package.json` lors de la création du projet. Le dépôt n'étant pas encore initialisé en Angular, ils ne sont pas exécutables à ce stade.

## Conventions

- Respecter les choix de langage, de nommage, de formatage et d'architecture établis dans le projet ; éviter d'en ajouter d'autres sans nécessité.
- Garder les règles de calcul des points explicites, cohérentes et testables ; ajouter ou adapter des tests pour chaque règle métier modifiée, sans changer un test uniquement pour faire passer l'implémentation.
- Distinguer les pronostics saisis à l'avance des résultats réels saisis après les matchs ; ne pas remplacer ni confondre ces données.
- Garder les textes destinés aux utilisateurs en français, sauf convention contraire déjà présente dans l'application.
- Faire des changements ciblés et ne pas élargir le périmètre fonctionnel sans demande explicite.
- Ne pas créer de commit sans demande explicite.

## Interdits

- Ne jamais ajouter de dépendance sans demander l'accord de l'utilisateur.
- Ne jamais écrire de secret (clé, mot de passe, jeton) dans le code ou dans le dépôt.
- Ne jamais modifier un test dans le seul but de le faire passer ; corriger le comportement ou la règle de test avec justification.
- Ne pas ajouter de paris d'argent, de récupération automatique des résultats, de comptes utilisateurs, de synchronisation en ligne ou de gestion de plusieurs compétitions sans demande explicite.
