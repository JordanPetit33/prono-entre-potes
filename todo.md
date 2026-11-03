# Todo — Prono entre potes

Checklist tirée de `prompt_plan.md`. Une étape n'est cochée que lorsque ses tests passent, que `npm run build` compile et que l'application a été vérifiée à la main.

Pour chaque étape, la boucle est la même : envoyer le prompt, laisser l'agent coder et tester, lancer l'application soi-même, cocher, commiter.

## Préparation

- [x] Spécification validée (`spec.md`)
- [x] Plan de construction rédigé (`prompt_plan.md`)
- [x] Checklist créée (`todo.md`)
- [ ] Capture de la maquette ajoutée dans `docs/maquette-ecran-principal.png`
- [ ] `spec.md`, `prompt_plan.md` et `todo.md` commités

## Étape 1 · Initialiser le projet Angular

- [x] Liste des paquets et versions présentée par l'agent
- [x] Accord donné pour l'installation des dépendances
- [x] Projet Angular généré dans le dossier courant (standalone, routage, CSS, strict, sans SSR)
- [x] Fichiers existants intacts (README.md, AGENTS.md, PLAN.md, PROMPTS.md, spec.md, prompt_plan.md, todo.md, .vscode/)
- [x] Scripts `start`, `test` et `build` présents dans `package.json`
- [x] Test du titre « Prono entre potes » écrit et en échec
- [x] Gabarit de démonstration remplacé par un composant racine minimal avec `<router-outlet>`
- [x] `npm test` passe
- [x] `npm run build` compile
- [x] Vérifié avec `npm start` : le titre s'affiche
- [x] Commit

## Étape 2 · Coquille : navigation et routes

- [x] Tests écrits et en échec : trois liens, `aria-current`, redirections, pages par route
- [x] `app.routes.ts` avec les routes de spec §4.3
- [x] Pages vides : Journée, Résultats, Classement, Joueurs
- [x] Barre de navigation du bas (`shared/bottom-nav/`)
- [x] En-tête « Prono entre potes » dans le composant racine
- [x] Mise en page mobile, zones tactiles ≥ 44 px
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : navigation entre les onglets, route inconnue redirigée
- [ ] Commit

## Étape 3 · Modèles, validation des joueurs, état en mémoire

- [x] Tests de `validatePlayerName` écrits et en échec (vide, espaces, 31 caractères, doublons casse/accents, 1 et 30 caractères)
- [x] Tests d'`AppStore` écrits et en échec (vide, `addPlayer`, refus d'un nom invalide)
- [x] Test de l'écran d'accueil sans joueur écrit et en échec
- [x] Types du domaine dans `core/models/` et `createEmptyAppData()`
- [x] `validatePlayerName`, fonction pure
- [x] `AppStore` en mémoire avec signaux
- [x] Écran d'accueil « Bienvenue » avec lien « Créer les joueurs » (F-15)
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : l'écran d'accueil s'affiche
- [ ] Commit

## Étape 4 · Écran de gestion des joueurs

- [x] Tests de `renamePlayer` et `removePlayer` écrits et en échec (suppression des pronostics du seul joueur concerné)
- [x] Tests du composant de confirmation écrits et en échec
- [x] Tests de la page Joueurs écrits et en échec (liste, erreur sous le champ, confirmation, annulation)
- [x] `renamePlayer`, `removePlayer` et initialisation depuis un `AppData` dans `AppStore`
- [x] Composant de confirmation (`shared/confirm-dialog/`, `<dialog>` natif)
- [x] Page Joueurs avec formulaire accessible
- [x] Lien de l'écran d'accueil vers `/joueurs`
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : ajout, renommage, doublon refusé, suppression confirmée
- [ ] Commit

## Étape 5 · Sélecteur de joueur actif

- [x] Tests du joueur actif écrits et en échec (null, premier joueur, `setActivePlayer`, id inconnu, suppression du joueur actif)
- [x] Tests du sélecteur écrits et en échec
- [x] `activePlayerId`, `activePlayer` et `setActivePlayer` dans `AppStore`
- [x] Composant `players/player-picker/` avec `aria-label`
- [x] Lien « Gérer les joueurs »
- [x] Sélecteur affiché dans l'en-tête dès qu'un joueur existe
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : changement de joueur actif
- [ ] Commit

## Étape 6 · Dépôt de stockage et branchement de l'état

- [x] Tests du dépôt écrits et en échec, avec un faux `Storage` : vide, aller-retour, JSON invalide, structure incorrecte, version plus récente, quota, stockage inaccessible, joueur actif
- [x] Tests d'`AppStore` écrits et en échec : chargement, sauvegarde après modification, retour arrière si la sauvegarde échoue, joueur actif relu
- [x] `StorageRepository` avec `InjectionToken` pour le `Storage`
- [x] Validation de structure écrite à la main
- [x] Copie de secours dans `prono-entre-potes:data-backup`
- [x] Signaux `storageStatus` et `storageError` dans `AppStore`
- [x] `AppStore` branché sur le dépôt
- [x] `npm test` passe
- [x] `npm run build` compile
- [x] Vérifié avec `npm start` : un joueur créé est toujours là après rechargement
- [x] Vérifié : le joueur actif est conservé après rechargement
- [ ] Commit

## Étape 7 · Affichage des erreurs de stockage

- [x] Tests écrits et en échec : bandeau « non conservées », écran « données illisibles », « Repartir de zéro » avec confirmation, lecture seule, message de quota
- [x] `resetData()` et `readOnly` dans `AppStore`
- [x] Composant `shared/storage-banner/`
- [x] Composant `shared/storage-error-screen/`
- [x] Formulaires désactivés en lecture seule
- [x] Branchement dans le composant racine
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : en navigation privée ou après avoir corrompu la clé à la main dans les outils de développement
- [ ] Commit

## Étape 8 · Création et liste des matchs

- [x] Tests de `validateMatch` écrits et en échec
- [x] Tests de `matchesOfMatchday` (tri F-24) écrits et en échec
- [x] Tests d'`addMatch` et `matchdays` écrits et en échec
- [x] Tests de la page Résultats écrits et en échec (liste, ajout, erreur sous le champ)
- [x] `validateMatch` et `matchesOfMatchday`, fonctions pures
- [x] `addMatch` et `matchdays` dans `AppStore`
- [x] Service `Clock` (`core/time/clock.ts`)
- [x] Page Résultats branchée sur la route et sur `AppStore`
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : création de matchs sur deux journées, ordre correct
- [ ] Commit

## Étape 9 · Modification et suppression des matchs

- [x] Tests d'`updateMatch` écrits et en échec (modification, refus si résultat)
- [x] Tests de `removeMatch` écrits et en échec (cascade sur pronostics et résultat)
- [x] Tests de la page Résultats écrits et en échec (boutons, confirmation)
- [x] `updateMatch` et `removeMatch` dans `AppStore`
- [x] Mode édition réutilisant le formulaire de l'étape 8
- [x] Confirmation de suppression avec le composant existant
- [x] `npm test` passe
- [x] `npm run build` compile
- [ ] Vérifié avec `npm start` : modification et suppression d'un match
- [ ] Commit

## Étape 10 · Pronostics et verrouillage

- [ ] Tests de `parseScoreValue` écrits et en échec
- [ ] Tests d'`isMatchLocked` écrits et en échec (avant, à l'heure exacte, avec résultat)
- [ ] Tests de `savePrediction` écrits et en échec (enregistrement, remplacement, autre joueur intact, match verrouillé, sans joueur actif)
- [ ] Tests de la carte de match écrits et en échec (À saisir, Prono enregistré, Verrouillé, heure, temps restant, score invalide)
- [ ] `parseScoreValue` et `isMatchLocked`, fonctions pures
- [ ] `savePrediction` et pronostics du joueur actif dans `AppStore`
- [ ] Composant `matchday/match-card/`
- [ ] Champs de score avec libellé « Buts de <équipe> » et `inputmode="numeric"`
- [ ] Page `/journee/:numero` qui affiche les cartes
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérifié avec `npm start` : saisie et modification d'un prono, match passé verrouillé
- [ ] Vérifié : le prono d'un joueur n'écrase pas celui d'un autre
- [ ] Commit

## Étape 11 · Navigation entre journées et compteur

- [ ] Tests de `defaultMatchday` écrits et en échec
- [ ] Tests de `predictionProgress` écrits et en échec
- [ ] Tests de l'en-tête de journée écrits et en échec (titre, flèches, extrémités, compteur)
- [ ] Test de la redirection de `/journee` écrit et en échec
- [ ] `defaultMatchday` et `predictionProgress`, fonctions pures
- [ ] Composant `matchday/matchday-header/` avec barre de progression
- [ ] `/journee` redirige vers la journée par défaut
- [ ] Liens de la barre du bas mis à jour
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérifié avec `npm start` : flèches, compteur « x / y », journée par défaut
- [ ] Commit

## Étape 12 · Saisie des résultats

- [ ] Tests de `saveResult` et `removeResult` écrits et en échec
- [ ] Test « un résultat ne modifie aucun pronostic » écrit et en échec (F-43)
- [ ] Tests de la page Résultats écrits et en échec (saisie, confirmation avant le coup d'envoi, correction, suppression)
- [ ] Test de l'état « Terminé » de la carte de match écrit et en échec
- [ ] `saveResult` et `removeResult` dans `AppStore`
- [ ] Formulaire de résultat dans la page Résultats
- [ ] État « Terminé » dans la carte de match
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérifié avec `npm start` : saisie, correction et suppression d'un résultat
- [ ] Vérifié : le prono du joueur reste inchangé après la saisie du résultat
- [ ] Commit

## Étape 13 · Points et pronostics des autres

- [ ] Tests d'`outcomeOf` écrits et en échec
- [ ] Tests de `pointsFor` écrits et en échec : les huit cas de spec §8.1
- [ ] Tests de `matchPoints` écrits et en échec (match sans résultat, joueur sans pronostic)
- [ ] Tests de la pastille de points écrits et en échec
- [ ] Tests de visibilité des pronostics des autres écrits et en échec (F-34)
- [ ] `core/scoring/points.ts` avec `POINTS_EXACT` et `POINTS_OUTCOME` comme seules sources du barème
- [ ] Points par joueur et par match calculés dans `AppStore`, jamais stockés
- [ ] Pastille « +3 pts · score exact », « +1 pt · bonne issue », « 0 pt »
- [ ] Pronostics des autres affichés après verrouillage
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérifié avec `npm start` : points corrects sur un match terminé, pronos des autres masqués avant le coup d'envoi
- [ ] Commit

## Étape 14 · Classement

- [ ] Tests de `standings` écrits et en échec (tri, départage, rang partagé 1-2-2-4, joueur sans prono)
- [ ] Tests d'`AppStore` écrits et en échec (mise à jour après résultat et correction, joueur supprimé)
- [ ] Tests de la page Classement écrits et en échec
- [ ] Tests du rang dans l'en-tête de journée écrits et en échec
- [ ] `core/scoring/standings.ts`, fonction pure
- [ ] `standings` calculé dans `AppStore`
- [ ] Page `/classement` avec tableau et ligne du joueur actif mise en évidence
- [ ] Rang, points et écart dans l'en-tête de journée, avec lien vers `/classement`
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérifié avec `npm start` : classement à plusieurs joueurs, égalités
- [ ] Commit

## Étape 15 · Nom de la compétition et erreurs inattendues

- [ ] Tests de `renameCompetition` écrits et en échec
- [ ] Test du nom dans l'en-tête de journée écrit et en échec
- [ ] Test de la section « Compétition » de la page Joueurs écrit et en échec
- [ ] Test du gestionnaire d'erreurs global écrit et en échec
- [ ] `renameCompetition` dans `AppStore`
- [ ] `core/errors/app-error-handler.ts`, fourni dans `app.config.ts`
- [ ] Message « Une erreur inattendue est survenue. » dans le composant racine
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérifié avec `npm start` : renommage de la compétition
- [ ] Commit

## Étape 16 · PWA installable et hors ligne

- [ ] Paquet `@angular/service-worker` et commande présentés par l'agent
- [ ] Accord donné pour l'installation
- [ ] Tests du manifeste, de `ngsw-config.json` et d'`index.html` écrits et en échec
- [ ] Service worker ajouté, actif en production uniquement
- [ ] Manifeste et icônes 192 et 512 px
- [ ] `npm test` passe
- [ ] `npm run build` compile
- [ ] Vérification manuelle : l'application propose l'installation
- [ ] Vérification manuelle : hors ligne, l'interface s'ouvre et les données sont présentes
- [ ] Vérification manuelle : les données survivent à la fermeture de l'application
- [ ] Commit

## Fin de l'étape 1 de la formation

- [ ] Une première version de l'application démarre
- [ ] Les tests de la logique principale passent
- [ ] Les prompts corrigés sont notés dans `PROMPTS.md`
