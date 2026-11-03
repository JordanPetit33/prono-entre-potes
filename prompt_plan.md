# Plan de construction — Prono entre potes

Plan tiré de `spec.md`, variante TDD : chaque étape commence par des tests qui échouent, puis le code qui les fait passer. Les identifiants `F-xx` renvoient aux besoins de `spec.md`.

---

## 1. Plan initial

1. Initialiser le projet Angular avec Vitest.
2. Construire la coquille de l'application : navigation et routes.
3. Gérer les joueurs.
4. Stocker les données dans le navigateur.
5. Gérer les matchs.
6. Saisir les pronostics.
7. Saisir les résultats.
8. Calculer les points et le classement.
9. Finitions et PWA.

## 2. Premier découpage

Le plan initial mélange des étapes de tailles très différentes. « Gérer les joueurs » couvre à la fois le domaine, l'état et trois écrans ; « Calculer les points et le classement » regroupe deux algorithmes distincts. Premier découpage :

1. Initialisation Angular.
2. Coquille, navigation, routes.
3. Modèles, validation des joueurs, état en mémoire.
4. Écran de gestion des joueurs.
5. Sélecteur de joueur actif.
6. Persistance `localStorage`.
7. Matchs : création, modification, suppression.
8. Pronostics et verrouillage.
9. Résultats.
10. Points.
11. Classement.
12. PWA.

## 3. Second découpage

En repassant sur chaque morceau :

- **Persistance (6)** : le dépôt de stockage et ses cas d'erreur sont déjà lourds à tester. L'affichage des erreurs (bandeau, écran de données illisibles, lecture seule) devient une étape à part.
- **Matchs (7)** : la création et l'affichage d'une part, la modification et la suppression avec confirmation d'autre part.
- **Pronostics (8)** : la navigation entre journées et la journée par défaut (F-71, F-72) sont une logique indépendante de la saisie : étape à part.
- **Points (10)** : la visibilité des pronostics des autres (F-34) dépend du verrouillage et s'affiche au même endroit : on la garde avec les points, sur la carte de match terminé.
- **Finitions** : le nom de la compétition et le gestionnaire d'erreurs global sont petits et indépendants : une étape commune avant la PWA.

## 4. Vérification de la taille des étapes

Chaque étape finale respecte ces critères :

- Elle ajoute un comportement visible ou une règle testable, jamais une couche technique seule.
- Elle tient en une session d'agent : une à trois unités de code (fonction pure, service, composant) et leurs tests.
- Elle se termine branchée sur l'existant : rien n'est écrit « pour plus tard ».
- Elle ne s'appuie que sur les étapes précédentes.

Étapes finales :

| # | Étape | Besoins |
|---|---|---|
| 1 | Initialiser le projet Angular | — |
| 2 | Coquille : navigation et routes | F-70, routes §4.3 |
| 3 | Modèles, validation des joueurs, état en mémoire, écran d'accueil | F-10, F-11, F-15 |
| 4 | Écran de gestion des joueurs | F-10 à F-13, F-73 |
| 5 | Sélecteur de joueur actif | F-14 |
| 6 | Dépôt de stockage et branchement de l'état | §5.3, F-14 |
| 7 | Affichage des erreurs de stockage | §6 |
| 8 | Création et liste des matchs | F-02, F-20, F-21, F-24 |
| 9 | Modification et suppression des matchs | F-22, F-23 |
| 10 | Pronostics et verrouillage | F-30 à F-33, F-35 |
| 11 | Navigation entre journées et compteur | F-36, F-71, F-72 |
| 12 | Saisie des résultats | F-40 à F-43 |
| 13 | Points et pronostics des autres | F-34, F-50 à F-53 |
| 14 | Classement | F-60 à F-63 |
| 15 | Nom de la compétition et erreurs inattendues | F-01, §6 |
| 16 | PWA installable et hors ligne | §8.5 |

---

## 5. Règles communes à tous les prompts

Chaque prompt ci-dessous les rappelle en une ligne. Les voici en entier :

- Lire `AGENTS.md` et `spec.md` avant de commencer.
- TDD : écrire d'abord les tests, les lancer avec `npm test` et montrer qu'ils échouent, puis écrire le code jusqu'à ce qu'ils passent.
- Ne jamais modifier un test dans le seul but de le faire passer.
- N'ajouter aucune dépendance sans l'accord explicite de l'utilisateur.
- Textes de l'interface en français.
- Terminer par `npm test` et `npm run build`, tous deux sans erreur.
- Ne pas commiter. Proposer un message de commit et s'arrêter.

---

## Étape 1 · Initialiser le projet Angular

```text
Lis AGENTS.md et spec.md (sections 4 et 9).

Objectif : initialiser l'application Angular dans le dossier courant, avec Vitest comme lanceur de tests.

1. Avant toute installation, présente-moi la liste exacte des paquets et des versions que tu comptes ajouter (Angular, Angular CLI, TypeScript, Vitest, et tout autre paquet requis), avec leur compatibilité. Attends mon accord explicite avant d'installer quoi que ce soit.
2. Génère le projet Angular dans le dossier courant : composants standalone, routage activé, styles CSS, TypeScript strict, pas de rendu serveur. Utilise le lanceur de tests Vitest de l'Angular CLI. Les fichiers existants (README.md, AGENTS.md, PLAN.md, PROMPTS.md, spec.md, prompt_plan.md, todo.md, .vscode/) ne doivent être ni écrasés ni modifiés.
3. Vérifie que package.json contient les scripts "start" (ng serve), "test" (tests Vitest, sans mode surveillance) et "build" (ng build).
4. TDD : écris d'abord src/app/app.component.spec.ts (ou le nom généré équivalent) avec un test qui vérifie que l'application affiche le titre « Prono entre potes ». Lance npm test et montre qu'il échoue.
5. Remplace le gabarit d'accueil généré par Angular par un composant racine minimal qui affiche ce titre et contient un <router-outlet>. Supprime le contenu de démonstration inutile.
6. Lance npm test puis npm run build, montre-moi les résultats.

N'ajoute aucune autre dépendance. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 2 · Coquille : navigation et routes

```text
Lis AGENTS.md et spec.md (sections 3.8 et 4.3). L'étape 1 est faite : l'application Angular démarre et affiche son titre.

Objectif : la coquille de l'application, avec la barre de navigation du bas et les routes, sans contenu métier.

TDD, tests d'abord (montre qu'ils échouent avant d'écrire le code) :
- La barre de navigation affiche trois liens : « Journée », « Résultats », « Classement ».
- Le lien de la page courante porte aria-current="page".
- "/" redirige vers "/journee".
- "/journee", "/journee/3", "/resultats/3", "/classement" et "/joueurs" affichent chacun leur page (un titre suffit pour l'instant).
- Une route inconnue redirige vers "/journee".

Puis le code :
- src/app/app.routes.ts avec les routes de spec.md §4.3.
- Un composant de page vide par écran, dans les dossiers prévus par spec.md §4.2 : matchday/, results/, standings/, players/. Chaque page affiche seulement un titre (« Journée », « Résultats », « Classement », « Joueurs »).
- src/app/shared/bottom-nav/ : la barre de navigation, avec routerLink et routerLinkActive. Le lien « Résultats » mène à "/resultats/1" pour l'instant.
- Le composant racine affiche un en-tête avec « Prono entre potes », le <router-outlet> et la barre de navigation.
- Mise en page mobile d'abord (390 px de référence), zones tactiles de 44 px minimum.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 3 · Modèles, validation des joueurs, état en mémoire

```text
Lis AGENTS.md et spec.md (sections 3.2, 4.2 et 5). Les étapes 1 et 2 sont faites : la coquille et les routes existent.

Objectif : les types du domaine, la validation des noms de joueur, un état de l'application en mémoire, et l'écran d'accueil quand il n'y a aucun joueur.

TDD, tests d'abord (montre qu'ils échouent) :
- src/app/core/validation/player-name.spec.ts : validatePlayerName(name, existingNames) refuse un nom vide, un nom fait d'espaces, un nom de 31 caractères, un doublon (« Léa » contre « lea », « LÉA », « Lea ») ; accepte un nom de 1 et de 30 caractères ; retire les espaces de début et de fin. Le résultat indique soit le nom nettoyé, soit un message d'erreur en français.
- src/app/core/state/app-store.spec.ts : un AppStore vide n'a aucun joueur ; addPlayer ajoute un joueur avec un id unique ; addPlayer refuse un nom invalide sans changer l'état ; les joueurs sont exposés en signal.
- Test de la page Journée : sans joueur, elle affiche « Bienvenue » et un lien « Créer les joueurs » vers "/joueurs".

Puis le code :
- src/app/core/models/ : les types de spec.md §5.1 (Score, Player, Match, Prediction, Result, AppData) et une fonction createEmptyAppData(). TypeScript pur, aucune dépendance Angular.
- src/app/core/validation/player-name.ts : validatePlayerName, fonction pure. La comparaison des doublons ignore la casse et les accents.
- src/app/core/state/app-store.ts : service Angular (providedIn: 'root') qui garde un AppData dans un signal privé, expose players en signal en lecture seule et une méthode addPlayer(name). Les identifiants viennent de crypto.randomUUID().
- Branche le tout : la page Journée lit AppStore et affiche l'écran d'accueil quand la liste des joueurs est vide (F-15).

Pas de stockage pour l'instant : tout reste en mémoire. Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 4 · Écran de gestion des joueurs

```text
Lis AGENTS.md et spec.md (sections 3.2 et 6). Les étapes 1 à 3 sont faites : AppStore garde les joueurs en mémoire et sait en ajouter.

Objectif : l'écran /joueurs pour ajouter, renommer et supprimer des joueurs.

TDD, tests d'abord (montre qu'ils échouent) :
- AppStore.renamePlayer(id, name) applique les mêmes règles que l'ajout ; renommer un joueur avec son propre nom (casse différente) est accepté.
- AppStore.removePlayer(id) retire le joueur et ses pronostics. Prépare le test avec un AppData contenant des pronostics de deux joueurs : seuls ceux du joueur supprimé disparaissent.
- Composant de confirmation (src/app/shared/confirm-dialog/) : affiche le message reçu, émet « confirmé » ou « annulé ».
- Page Joueurs : liste les joueurs ; le formulaire d'ajout affiche le message d'erreur sous le champ quand le nom est refusé ; la suppression demande une confirmation qui précise que les pronostics du joueur seront supprimés ; annuler ne supprime rien.

Puis le code :
- Les méthodes renamePlayer et removePlayer dans AppStore. Ajoute à AppStore un moyen d'initialiser son état depuis un AppData (utile aux tests et à l'étape 6).
- Le composant de confirmation, réutilisable, basé sur l'élément <dialog> natif.
- La page Joueurs dans src/app/players/, avec un formulaire accessible (<label> pour chaque champ).
- Branche le tout : la route /joueurs affiche cette page ; le lien « Créer les joueurs » de l'écran d'accueil y mène.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 5 · Sélecteur de joueur actif

```text
Lis AGENTS.md et spec.md (sections 3.2, F-14 et F-73). Les étapes 1 à 4 sont faites : on peut créer, renommer et supprimer des joueurs.

Objectif : choisir le joueur actif depuis l'en-tête.

TDD, tests d'abord (montre qu'ils échouent) :
- AppStore.activePlayer vaut null tant qu'aucun joueur n'existe.
- Après l'ajout du premier joueur, il devient automatiquement le joueur actif.
- setActivePlayer(id) change le joueur actif ; un id inconnu est ignoré.
- Supprimer le joueur actif rend actif le premier joueur restant, ou null s'il n'en reste aucun.
- Composant sélecteur : affiche le nom du joueur actif, propose la liste des joueurs et un lien « Gérer les joueurs » vers /joueurs ; choisir un joueur appelle setActivePlayer.

Puis le code :
- activePlayerId (signal) et activePlayer (computed) dans AppStore, avec setActivePlayer.
- src/app/players/player-picker/ : bouton accessible (aria-label « Changer de joueur, joueur actuel : <nom> ») qui ouvre la liste.
- Branche le tout : le sélecteur s'affiche dans l'en-tête de l'application quand au moins un joueur existe.

Le joueur actif n'est pas encore mémorisé entre deux visites : ce sera fait à l'étape 6. Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 6 · Dépôt de stockage et branchement de l'état

```text
Lis AGENTS.md et spec.md (sections 5.3 et 6). Les étapes 1 à 5 sont faites : l'état des joueurs vit dans AppStore, en mémoire.

Objectif : conserver les données dans localStorage.

TDD, tests d'abord (montre qu'ils échouent). Utilise un faux Storage en mémoire injecté dans le dépôt, jamais le vrai localStorage :
- src/app/core/storage/storage-repository.spec.ts :
  - load() sans donnée renvoie { status: 'ok', data: AppData vide }.
  - save(data) puis load() renvoie des données identiques, sous la clé "prono-entre-potes:data".
  - JSON invalide : load() renvoie { status: 'corrupted' } et recopie le contenu brut dans "prono-entre-potes:data-backup" sans toucher à la clé principale.
  - Structure incorrecte (champ manquant, mauvais type) : même comportement que le JSON invalide.
  - schemaVersion plus récent que la version connue : load() renvoie { status: 'newer-version', data } en lecture seule.
  - save() quand setItem lève QuotaExceededError : renvoie une erreur 'quota' et l'ancienne valeur reste intacte.
  - Storage inaccessible (l'accès lève une exception) : le dépôt signale 'unavailable'.
  - saveActivePlayer(id) et loadActivePlayer() utilisent la clé "prono-entre-potes:active-player".
- app-store.spec.ts :
  - Au démarrage, AppStore charge les données du dépôt.
  - Chaque modification réussie (ajout, renommage, suppression de joueur) appelle save avec l'état complet.
  - Si save échoue, l'état en mémoire revient à sa valeur précédente et AppStore expose l'erreur dans un signal storageError.
  - Le joueur actif est relu au démarrage ; s'il n'existe plus, le premier joueur devient actif.

Puis le code :
- src/app/core/storage/storage-repository.ts : classe injectable qui reçoit le Storage par un InjectionToken (fourni par défaut avec window.localStorage), avec une validation de structure écrite à la main (pas de bibliothèque).
- Les statuts de chargement exposés par AppStore dans un signal storageStatus ('ok' | 'unavailable' | 'corrupted' | 'newer-version').
- Branche le tout : AppStore utilise le dépôt ; l'application charge les données au démarrage.

L'affichage des erreurs à l'écran est l'objet de l'étape 7 : ici, seuls les signaux sont exposés. Lance npm test et npm run build, puis vérifie avec npm start qu'un joueur créé est toujours là après un rechargement de la page. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 7 · Affichage des erreurs de stockage

```text
Lis AGENTS.md et spec.md (section 6). Les étapes 1 à 6 sont faites : AppStore expose storageStatus et storageError.

Objectif : informer l'utilisateur des problèmes de stockage.

TDD, tests d'abord (montre qu'ils échouent) :
- storageStatus 'unavailable' : un bandeau permanent affiche « Vos données ne seront pas conservées sur cet appareil. » et l'application reste utilisable.
- storageStatus 'corrupted' : un écran d'erreur remplace le contenu ; il explique qu'une copie des données a été conservée et propose « Repartir de zéro » ; ce bouton demande une confirmation ; après confirmation, AppStore repart d'un AppData vide et l'enregistre ; annuler ne change rien.
- storageStatus 'newer-version' : un bandeau invite à mettre à jour l'application ; toute modification est refusée par AppStore et les formulaires sont désactivés.
- storageError 'quota' : un message d'erreur s'affiche et peut être fermé.

Puis le code :
- src/app/shared/storage-banner/ et src/app/shared/storage-error-screen/.
- Une méthode resetData() dans AppStore et un signal readOnly.
- Branche le tout : le composant racine affiche le bandeau ou l'écran selon storageStatus ; le formulaire de la page Joueurs se désactive en lecture seule ; le composant de confirmation de l'étape 4 est réutilisé.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 8 · Création et liste des matchs

```text
Lis AGENTS.md et spec.md (sections 3.3, 4.2 et 4.3). Les étapes 1 à 7 sont faites : joueurs et stockage fonctionnent.

Objectif : créer des matchs et les lister par journée dans l'écran Résultats.

TDD, tests d'abord (montre qu'ils échouent) :
- src/app/core/validation/match.spec.ts : validateMatch refuse une journée 0, négative ou non entière, une équipe vide, une équipe de 41 caractères, deux équipes identiques (casse et espaces ignorés), une date invalide ; accepte un match valide et renvoie les noms nettoyés.
- src/app/core/scoring/matches.spec.ts : matchesOfMatchday(matches, n) renvoie les matchs de la journée n triés par coup d'envoi puis par équipe à domicile (F-24).
- app-store.spec.ts : addMatch ajoute un match valide et l'enregistre ; refuse un match invalide sans changer l'état ; matchdays (computed) renvoie la liste triée des numéros de journée existants.
- Page Résultats (/resultats/:numero) : liste les matchs de la journée demandée ; un formulaire « Ajouter un match » (équipe à domicile, équipe à l'extérieur, date et heure) crée un match dans cette journée ; un message d'erreur s'affiche sous le champ fautif.

Puis le code :
- validateMatch et matchesOfMatchday, fonctions pures.
- addMatch et matchdays dans AppStore.
- src/app/core/time/clock.ts : service Clock injectable avec now(): Date, pour fixer l'heure dans les tests (il servira dès l'étape 10).
- Branche le tout : la page Résultats lit le numéro de journée dans la route et utilise AppStore.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 9 · Modification et suppression des matchs

```text
Lis AGENTS.md et spec.md (F-22 et F-23). Les étapes 1 à 8 sont faites : on crée et liste des matchs.

Objectif : modifier et supprimer un match depuis l'écran Résultats.

TDD, tests d'abord (montre qu'ils échouent) :
- app-store.spec.ts :
  - updateMatch modifie un match sans résultat, avec les règles de validateMatch.
  - updateMatch est refusé si le match a un résultat (prépare un AppData avec un résultat).
  - removeMatch supprime le match, ses pronostics et son résultat, et rien d'autre.
- Page Résultats : chaque match a les boutons « Modifier » et « Supprimer » ; « Modifier » est absent si le match a un résultat ; « Supprimer » demande une confirmation qui précise que les pronostics et le résultat seront supprimés.

Puis le code :
- updateMatch et removeMatch dans AppStore.
- Le mode édition dans la page Résultats, en réutilisant le formulaire de l'étape 8.
- Branche le tout avec le composant de confirmation existant.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 10 · Pronostics et verrouillage

```text
Lis AGENTS.md et spec.md (sections 3.4 et 7). Les étapes 1 à 9 sont faites : joueurs, matchs et stockage fonctionnent, un service Clock existe.

Objectif : le joueur actif saisit ses pronostics dans l'écran Journée.

TDD, tests d'abord (montre qu'ils échouent) :
- src/app/core/validation/score.spec.ts : parseScoreValue refuse "", "-1", "100", "1,5", "1.5", "a" ; accepte "0" et "99" et renvoie un nombre.
- src/app/core/validation/lock.spec.ts : isMatchLocked(match, result, now) est faux avant le coup d'envoi sans résultat ; vrai à l'heure exacte du coup d'envoi ; vrai avant le coup d'envoi si un résultat existe.
- app-store.spec.ts (avec une horloge fixée) :
  - savePrediction(matchId, score) enregistre le pronostic du joueur actif.
  - Une seconde saisie remplace celle du même joueur ; le pronostic d'un autre joueur sur le même match n'est pas modifié (F-32).
  - Refus si le match est verrouillé, avec le message « Ce match a commencé, le pronostic est verrouillé ».
  - Refus sans joueur actif.
- Composant carte de match (src/app/matchday/match-card/) :
  - État « À saisir » : deux champs de score avec libellé « Buts de <équipe> », inputmode="numeric", et un bouton « Valider mon prono ».
  - État « Prono enregistré » : le score saisi et un bouton « Modifier mon prono ».
  - État « Verrouillé » : champs désactivés et mention « Verrouillé ».
  - Affiche l'heure du coup d'envoi (format fr-FR) et le temps restant avant clôture.
  - Un score invalide affiche un message sous les champs et n'appelle pas savePrediction.

Puis le code :
- parseScoreValue et isMatchLocked, fonctions pures.
- savePrediction dans AppStore, et un computed qui donne, pour le joueur actif, son pronostic par match.
- La carte de match.
- Branche le tout : la page /journee/:numero liste les matchs de la journée avec une carte chacun ; /journee affiche la journée 1 pour l'instant.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 11 · Navigation entre journées et compteur

```text
Lis AGENTS.md et spec.md (F-36, F-71, F-72). Les étapes 1 à 10 sont faites : on saisit des pronostics dans l'écran Journée.

Objectif : naviguer d'une journée à l'autre, afficher la bonne journée par défaut et le compteur de pronostics.

TDD, tests d'abord (montre qu'ils échouent) :
- src/app/core/scoring/default-matchday.spec.ts : defaultMatchday(matches, results, now) renvoie la première journée contenant un match non verrouillé ; la dernière journée si tout est verrouillé ; 1 s'il n'y a aucun match.
- src/app/core/scoring/progress.spec.ts : predictionProgress(matchesOfDay, predictions, playerId) renvoie { done, total } ; ne compte que les pronostics du joueur donné.
- En-tête de journée (src/app/matchday/matchday-header/) : affiche « Journée <n> », des boutons « Journée précédente » et « Journée suivante » (aria-label), désactivés aux extrémités, et le compteur « <done> / <total> » avec une barre de progression.
- /journee redirige vers /journee/<journée par défaut>.

Puis le code :
- defaultMatchday et predictionProgress, fonctions pures (lock.ts de l'étape 10 est réutilisé).
- L'en-tête de journée.
- Branche le tout : la route /journee calcule la journée par défaut ; la page Journée affiche l'en-tête au-dessus des cartes ; le lien « Journée » de la barre du bas mène à /journee et le lien « Résultats » à /resultats/<journée par défaut>.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 12 · Saisie des résultats

```text
Lis AGENTS.md et spec.md (section 3.5). Les étapes 1 à 11 sont faites.

Objectif : saisir, corriger et supprimer le résultat réel d'un match dans l'écran Résultats.

TDD, tests d'abord (montre qu'ils échouent) :
- app-store.spec.ts (horloge fixée) :
  - saveResult(matchId, score) enregistre le résultat ; une seconde saisie le corrige.
  - saveResult et removeResult ne modifient aucun pronostic : compare la liste des pronostics avant et après (F-43).
  - Un score invalide est refusé.
  - removeResult supprime le résultat ; le match redevient modifiable s'il n'a pas commencé.
- Page Résultats :
  - Chaque match a deux champs de score et un bouton « Enregistrer le résultat ».
  - Avant l'heure du coup d'envoi, enregistrer demande une confirmation (F-41) ; annuler n'enregistre rien.
  - Un match avec résultat affiche le score et les boutons « Corriger » et « Supprimer le résultat » (avec confirmation).
- Carte de match de l'écran Journée : un match avec résultat affiche l'état « Terminé » et le score réel à côté du pronostic du joueur actif.

Puis le code :
- saveResult et removeResult dans AppStore, avec parseScoreValue de l'étape 10.
- Le formulaire de résultat dans la page Résultats.
- Branche le tout : le verrouillage (isMatchLocked) tient compte du résultat, déjà testé à l'étape 10 ; la carte de match gère l'état « Terminé ».

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 13 · Points et pronostics des autres

```text
Lis AGENTS.md et spec.md (sections 3.6, F-34 et 8.1). Les étapes 1 à 12 sont faites : pronostics et résultats sont saisis.

Objectif : calculer les points de chaque pronostic et les afficher.

TDD, tests d'abord (montre qu'ils échouent). Écris tous les cas de spec.md §8.1 « Calcul des points » :
- src/app/core/scoring/points.spec.ts :
  - outcomeOf(score) renvoie 'home', 'draw' ou 'away'.
  - pointsFor(prediction, result) : score exact → 3 ('exact') ; bon vainqueur à domicile, mauvais score → 1 ('outcome') ; bon vainqueur à l'extérieur → 1 ; nul prévu et nul réel avec un autre score → 1 ; nul prévu et victoire → 0 ('miss') ; victoire prévue et nul → 0 ; mauvais vainqueur → 0 ; 0–0 prévu et 0–0 réel → 3.
  - matchPoints(players, matches, predictions, results) : aucun élément pour un match sans résultat (F-51) ; 'none' et 0 point pour un joueur sans pronostic (F-52).
- Carte de match terminé : affiche une pastille « +3 pts · score exact », « +1 pt · bonne issue » ou « 0 pt », écrite en toutes lettres (pas seulement une couleur).
- Carte de match verrouillé : affiche les pronostics des autres joueurs ; carte non verrouillée : ne les affiche pas (F-34).

Puis le code :
- src/app/core/scoring/points.ts : fonctions pures, barème dans des constantes exportées (POINTS_EXACT = 3, POINTS_OUTCOME = 1) et nulle part ailleurs (F-53).
- Un computed dans AppStore qui expose les points par joueur et par match, jamais stocké.
- Branche le tout : la carte de match affiche les points du joueur actif et, une fois verrouillée, la liste des pronostics des autres joueurs avec leurs points.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 14 · Classement

```text
Lis AGENTS.md et spec.md (sections 3.7 et 8.1). Les étapes 1 à 13 sont faites : les points sont calculés par match.

Objectif : le classement général et le rang du joueur actif.

TDD, tests d'abord (montre qu'ils échouent). Écris tous les cas de spec.md §8.1 « Classement » :
- src/app/core/scoring/standings.spec.ts : standings(players, matchPoints) :
  - tri par points décroissants ;
  - égalité de points départagée par le nombre de scores exacts ;
  - égalité complète : même rang, rang suivant sauté (1, 2, 2, 4), ordre alphabétique ;
  - joueur sans pronostic présent avec 0 point ;
  - chaque ligne donne rang, nom, points, scores exacts, matchs comptés.
- app-store.spec.ts : après saveResult puis correction du résultat, le classement exposé change ; après removePlayer, le joueur disparaît du classement.
- Page Classement : un tableau avec les colonnes Rang, Joueur, Points, Scores exacts, Matchs ; la ligne du joueur actif est mise en évidence.
- En-tête de journée : affiche le rang et les points du joueur actif, et l'écart avec le joueur qui le précède (« 3 pts derrière Léa ») ; rien d'autre s'il est premier.

Puis le code :
- src/app/core/scoring/standings.ts, fonction pure qui utilise matchPoints de l'étape 13.
- Un computed standings dans AppStore.
- Branche le tout : la page /classement affiche le tableau ; l'en-tête de journée affiche le rang avec un lien vers /classement.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 15 · Nom de la compétition et erreurs inattendues

```text
Lis AGENTS.md et spec.md (F-01 et section 6). Les étapes 1 à 14 sont faites : l'application est complète fonctionnellement.

Objectif : rendre le nom de la compétition modifiable et capter les erreurs inattendues.

TDD, tests d'abord (montre qu'ils échouent) :
- app-store.spec.ts : le nom par défaut est « Ma compétition » ; renameCompetition accepte 1 à 40 caractères, retire les espaces de début et de fin, refuse un nom vide ; le nom est enregistré.
- En-tête de journée : affiche le nom de la compétition.
- Page Joueurs : une section « Compétition » permet de modifier le nom, avec message d'erreur.
- Gestionnaire d'erreurs global : une erreur inattendue affiche « Une erreur inattendue est survenue. » sans bloquer l'application, et le détail part dans console.error.

Puis le code :
- renameCompetition dans AppStore.
- src/app/core/errors/app-error-handler.ts : ErrorHandler Angular, et un signal ou service pour afficher le message.
- Branche le tout : le gestionnaire est fourni dans app.config.ts ; le message s'affiche dans le composant racine.

Lance npm test et npm run build. Ne commite pas : propose un message de commit et arrête-toi.
```

## Étape 16 · PWA installable et hors ligne

```text
Lis AGENTS.md et spec.md (sections 4.1 et 8.5) et PLAN.md (étape 5). Les étapes 1 à 15 sont faites.

Objectif : rendre l'application installable et utilisable hors ligne. Cette étape n'ajoute aucune synchronisation et ne récupère aucun résultat.

1. Avant toute installation, présente-moi le paquet nécessaire (@angular/service-worker, à la version alignée sur Angular) et la commande que tu comptes lancer. Attends mon accord explicite.
2. TDD, tests d'abord (montre qu'ils échouent) :
   - Le manifeste (public/manifest.webmanifest ou src/manifest.webmanifest selon la structure du projet) a un name « Prono entre potes », un short_name, start_url, display "standalone", des couleurs et au moins des icônes 192 et 512 px.
   - ngsw-config.json met en cache l'index, les fichiers de l'application et les icônes.
   - index.html référence le manifeste et une meta theme-color.
3. Ajoute le service worker Angular, le manifeste et les icônes (icônes simples générées sans dépendance supplémentaire : demande-moi si tu en as besoin d'une).
4. Le service worker n'est activé qu'en production.
5. Lance npm test et npm run build.
6. Donne-moi la marche à suivre pour la vérification manuelle de spec.md §8.5 : servir le dossier de build en local, installer l'application, couper le réseau, recharger, vérifier que les données sont présentes.

Ne commite pas : propose un message de commit et arrête-toi.
```
