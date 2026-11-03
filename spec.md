# Spécification — Prono entre potes

Document de référence pour développer la première version de l'application. Il complète `README.md` (vision), `AGENTS.md` (règles de travail) et `PLAN.md` (grandes étapes).

> **Choix par défaut à valider.** Certaines décisions n'ont pas encore été prises. Elles sont marquées **[À valider]** dans le texte et regroupées à la fin, dans la section « Décisions à valider ». Tant qu'elles ne sont pas modifiées, le développeur applique la valeur indiquée.

---

## 1. Objectif et périmètre

Un petit groupe d'amis pronostique les scores des matchs d'une compétition de football. Après chaque match, un résultat est saisi à la main. L'application calcule les points de chaque joueur et affiche un classement.

### Dans le périmètre (version 1)

- Une seule compétition, découpée en journées.
- Gestion des joueurs, des matchs, des pronostics et des résultats.
- Calcul des points et classement général.
- Données stockées dans le navigateur de l'appareil.
- Application installable (PWA), interface utilisable hors ligne.

### Hors périmètre

- Paris d'argent.
- Récupération automatique des matchs ou des résultats.
- Comptes utilisateurs, mots de passe, authentification.
- Synchronisation en ligne ou entre appareils.
- Plusieurs compétitions en parallèle.

Toute évolution vers ces sujets nécessite une demande explicite.

---

## 2. Utilisateurs et usage

- **Joueurs** : 2 à 20 amis. Ils n'ont pas de compte ; on choisit « qui saisit » dans un sélecteur de joueur.
- **Organisateur** : n'importe quel joueur. Il crée les matchs et saisit les résultats. Il n'y a pas de rôle technique distinct.
- **Appareil de référence [À valider]** : sans synchronisation, chaque appareil a ses propres données. L'usage prévu est **un seul appareil partagé** (le téléphone de l'organisateur ou un ordinateur qu'on se passe). Les joueurs y saisissent leurs pronostics à tour de rôle.

---

## 3. Besoins fonctionnels

Les identifiants `F-xx` servent à relier les besoins aux tests (section 8).

### 3.1 Compétition

- **F-01** — La compétition a un nom modifiable (par défaut : « Ma compétition »).
- **F-02** — Les matchs sont regroupés par journée, numérotée à partir de 1.

### 3.2 Joueurs

- **F-10** — Ajouter un joueur avec un nom de 1 à 30 caractères, espaces de début et de fin retirés.
- **F-11** — Deux joueurs ne peuvent pas avoir le même nom (comparaison sans tenir compte de la casse ni des accents).
- **F-12** — Renommer un joueur, avec les mêmes règles.
- **F-13** — Supprimer un joueur après confirmation. Ses pronostics sont supprimés avec lui et le classement est recalculé.
- **F-14** — Le sélecteur de joueur, dans l'en-tête, indique le joueur actif. Le dernier joueur choisi est mémorisé sur l'appareil.
- **F-15** — Sans joueur, l'application affiche un écran d'accueil qui invite à créer les joueurs.

### 3.3 Matchs

- **F-20** — Créer un match : journée, équipe à domicile, équipe à l'extérieur, date et heure du coup d'envoi.
- **F-21** — Les noms d'équipe font 1 à 40 caractères et les deux équipes d'un match sont différentes.
- **F-22** — Modifier un match tant que son résultat n'est pas saisi.
- **F-23** — Supprimer un match après confirmation. Ses pronostics et son résultat sont supprimés avec lui.
- **F-24** — Les matchs d'une journée sont triés par coup d'envoi, puis par équipe à domicile.

### 3.4 Pronostics

- **F-30** — Le joueur actif saisit un pronostic (buts domicile, buts extérieur) pour un match.
- **F-31** — Un score est un entier de 0 à 99.
- **F-32** — Un joueur a au plus un pronostic par match. Une nouvelle saisie remplace la sienne, jamais celle d'un autre joueur.
- **F-33** — **Verrouillage [À valider]** : un pronostic ne peut plus être créé ni modifié dès que l'heure du coup d'envoi est atteinte, ou dès qu'un résultat est saisi pour ce match.
- **F-34** — Les pronostics des autres joueurs sur un match restent masqués tant que le match n'est pas verrouillé.
- **F-35** — L'écran de la journée indique pour chaque match : « À saisir », « Prono enregistré » ou « Verrouillé », et le temps restant avant clôture.
- **F-36** — L'en-tête indique le nombre de pronostics saisis par le joueur actif sur la journée (ex. « 7 / 9 »).

### 3.5 Résultats

- **F-40** — Saisir le résultat réel d'un match (mêmes règles de score que F-31).
- **F-41** — Le résultat peut être saisi avant l'heure du coup d'envoi uniquement après confirmation (protection contre une saisie par erreur).
- **F-42** — Un résultat peut être corrigé ou supprimé. Les points sont recalculés à chaque changement.
- **F-43** — Saisir ou corriger un résultat ne modifie jamais un pronostic.

### 3.6 Points

- **F-50** — **Barème [À valider]** :

  | Cas | Points |
  |---|---|
  | Score exact | 3 |
  | Bonne issue (bon vainqueur, ou nul prévu et nul réel) sans score exact | 1 |
  | Mauvaise issue | 0 |

- **F-51** — Aucun point n'est attribué pour un match sans résultat.
- **F-52** — Un joueur sans pronostic sur un match marque 0 point sur ce match.
- **F-53** — Le barème est défini à un seul endroit du code, sous forme de constantes.

### 3.7 Classement

- **F-60** — Le classement liste tous les joueurs avec : rang, nom, total de points, nombre de scores exacts, nombre de matchs pronostiqués ayant un résultat.
- **F-61** — **Départage [À valider]** : tri par total de points décroissant, puis par nombre de scores exacts décroissant. Des joueurs encore à égalité partagent le même rang (classement « 1, 2, 2, 4 ») et sont affichés par ordre alphabétique.
- **F-62** — L'en-tête de la journée affiche le rang et le total du joueur actif, et l'écart avec le joueur qui le précède.
- **F-63** — Le classement se met à jour immédiatement après chaque saisie ou correction de résultat.

### 3.8 Navigation et écrans

L'écran principal suit la maquette réalisée à l'étape 0 (capture à joindre au dépôt dans `docs/maquette-ecran-principal.png`).

- **F-70** — Barre de navigation en bas, trois onglets :
  - **Journée** : pronostics du joueur actif, journée par journée. C'est l'écran d'accueil.
  - **Résultats** : gestion des matchs de la journée et saisie des résultats.
  - **Classement** : classement général.
- **F-71** — On change de journée avec des flèches « précédente / suivante ».
- **F-72** — **Journée affichée par défaut** : la première journée qui contient un match non verrouillé. S'il n'y en a aucune, la dernière journée.
- **F-73** — Gestion des joueurs accessible depuis le sélecteur de joueur (« Gérer les joueurs »).
- **F-74** — Tous les textes affichés sont en français. Dates et heures au format `JJ/MM/AAAA HH:mm` (ex. `15/11/2026 15:00`), fuseau horaire de l’appareil.

---

## 4. Architecture et stack

### 4.1 Stack

| Élément | Choix |
|---|---|
| Langage | TypeScript, mode strict |
| Framework | Angular, composants standalone, signaux pour l'état |
| Tests | Vitest via Angular CLI (`npm test`) |
| PWA | Service worker Angular (`@angular/service-worker`) |
| Stockage | `localStorage` du navigateur |
| Paquets | npm |

Les versions exactes sont fixées à l'initialisation, après vérification de leur compatibilité. **Toute dépendance, y compris celles de la stack ci-dessus, est soumise à l'accord de l'utilisateur avant ajout** (règle d'`AGENTS.md`). Pas de bibliothèque d'interface externe en version 1 : les composants sont écrits à la main.

### 4.2 Découpage en couches

```
src/app/
  core/
    models/        types du domaine (aucune dépendance Angular)
    scoring/       calcul des points et du classement : fonctions pures
    validation/    règles de validation : fonctions pures
    storage/       lecture / écriture localStorage, migration de schéma
    state/         service d'état de l'application (signaux)
  matchday/        écran Journée et carte de match
  results/         écran Résultats : matchs et résultats
  standings/       écran Classement
  players/         gestion des joueurs et sélecteur de joueur
  shared/          composants réutilisables (champ de score, confirmation, bandeau d'erreur)
```

Règles :

- `core/models`, `core/scoring` et `core/validation` sont du TypeScript pur, sans Angular. Ils sont testés sans `TestBed`.
- Les composants ne lisent ni n'écrivent jamais `localStorage` directement : ils passent par le service d'état, qui passe par `core/storage`.
- Les points et le classement ne sont jamais stockés : ils sont **toujours recalculés** à partir des pronostics et des résultats (signaux `computed`).
- L'heure courante est fournie par un service `Clock` injectable, pour pouvoir la fixer dans les tests.

### 4.3 Routes

| Route | Écran |
|---|---|
| `/` | redirige vers `/journee` |
| `/journee` | journée par défaut (F-72) |
| `/journee/:numero` | journée donnée |
| `/resultats/:numero` | matchs et résultats d'une journée |
| `/classement` | classement général |
| `/joueurs` | gestion des joueurs |
| toute autre route | redirige vers `/journee` |

---

## 5. Données

### 5.1 Modèle

```ts
type Id = string; // généré avec crypto.randomUUID()

interface Score {
  home: number; // entier 0–99
  away: number; // entier 0–99
}

interface Player {
  id: Id;
  name: string;
  createdAt: string; // ISO 8601
}

interface Match {
  id: Id;
  matchday: number;  // entier ≥ 1
  homeTeam: string;
  awayTeam: string;
  kickoff: string;   // ISO 8601, avec fuseau
}

interface Prediction {
  playerId: Id;
  matchId: Id;
  score: Score;
  updatedAt: string; // ISO 8601
}

interface Result {
  matchId: Id;
  score: Score;
  enteredAt: string; // ISO 8601
}

interface AppData {
  schemaVersion: 1;
  competition: { name: string };
  players: Player[];
  matches: Match[];
  predictions: Prediction[]; // unique par (playerId, matchId)
  results: Result[];         // unique par matchId
}
```

Les pronostics et les résultats sont deux collections distinctes : un résultat ne remplace jamais un pronostic et inversement (règle d'`AGENTS.md`).

### 5.2 Types calculés (jamais stockés)

```ts
type Outcome = 'home' | 'draw' | 'away';

interface MatchPoints {
  playerId: Id;
  matchId: Id;
  points: number;
  kind: 'exact' | 'outcome' | 'miss' | 'none'; // none = pas de pronostic
}

interface StandingRow {
  rank: number;
  playerId: Id;
  name: string;
  points: number;
  exactScores: number;
  scoredMatches: number;
}
```

### 5.3 Stockage

- Clé `localStorage` : `prono-entre-potes:data`. Valeur : `AppData` en JSON.
- Clé `prono-entre-potes:active-player` : identifiant du joueur actif.
- Écriture complète du document après chaque modification validée.
- Au chargement : lecture, analyse JSON, validation de la structure, puis migration si `schemaVersion` est inférieur à la version courante.
- Absence de données : on démarre avec un `AppData` vide.

---

## 6. Gestion des erreurs

| Situation | Comportement |
|---|---|
| Saisie invalide (nom vide, doublon, score hors 0–99, équipes identiques…) | Enregistrement refusé. Message en français sous le champ concerné. Les données ne changent pas. |
| Pronostic sur un match verrouillé | Champs désactivés. Si une saisie arrive malgré tout (ex. le coup d'envoi passe pendant la saisie) : refus et message « Ce match a commencé, le pronostic est verrouillé ». |
| Résultat saisi avant le coup d'envoi | Demande de confirmation (F-41). |
| Suppression (joueur, match, résultat) | Demande de confirmation qui précise ce qui sera supprimé. |
| `localStorage` indisponible (navigation privée, stockage bloqué) | L'application fonctionne en mémoire. Bandeau permanent : « Vos données ne seront pas conservées sur cet appareil. » |
| Stockage plein (`QuotaExceededError`) | Modification annulée en mémoire, message d'erreur. Les données déjà stockées restent intactes. |
| Données illisibles (JSON invalide, structure incorrecte) | Les données ne sont **jamais écrasées automatiquement**. Le contenu brut est recopié dans `prono-entre-potes:data-backup`, puis un écran d'erreur propose de repartir de zéro après confirmation. |
| `schemaVersion` plus récent que celui de l'application | Lecture seule, message invitant à mettre à jour l'application. |
| Route ou journée inconnue | Redirection vers la journée par défaut. |

Les erreurs inattendues sont capturées par un `ErrorHandler` Angular qui affiche un message générique et journalise le détail dans la console.

---

## 7. Interface

- Conception mobile d'abord (largeur de référence 390 px), utilisable jusqu'au bureau.
- Zones tactiles de 44 px minimum.
- Champs de score : clavier numérique sur mobile (`inputmode="numeric"`), un champ par équipe, chacun avec un libellé accessible (« Buts de Rennes »).
- Contraste des textes conforme WCAG AA.
- L'état d'un match (à saisir, enregistré, verrouillé, terminé) ne repose pas uniquement sur la couleur : il est toujours écrit.

---

## 8. Plan de tests

Tous les tests sont écrits avec Vitest et lancés par `npm test`. Chaque règle métier est couverte par au moins un test. On ne modifie jamais un test dans le seul but de le faire passer (règle d'`AGENTS.md`).

### 8.1 Tests unitaires du domaine (sans Angular)

**Calcul des points** — `core/scoring/points.spec.ts`

- Score exact → 3 points (`exact`).
- Bon vainqueur à domicile, mauvais score → 1 point (`outcome`).
- Bon vainqueur à l'extérieur, mauvais score → 1 point.
- Nul prévu, nul réel avec un autre score → 1 point.
- Nul prévu, victoire réelle → 0 point (`miss`).
- Victoire prévue, nul réel → 0 point.
- Mauvais vainqueur → 0 point.
- Match sans résultat → aucun point calculé (F-51).
- Joueur sans pronostic → 0 point (`none`) (F-52).
- 0–0 prévu et 0–0 réel → score exact.

**Classement** — `core/scoring/standings.spec.ts`

- Tri par points décroissants.
- Égalité de points départagée par les scores exacts.
- Égalité complète → même rang, rang suivant sauté (1, 2, 2, 4), ordre alphabétique.
- Joueur sans aucun pronostic présent avec 0 point.
- Ajout d'un résultat → classement mis à jour.
- Correction d'un résultat → points recalculés.
- Suppression d'un joueur → disparaît du classement.

**Validation** — `core/validation/*.spec.ts`

- Noms de joueur : vide, espaces seuls, 31 caractères, doublon avec une casse ou des accents différents.
- Scores : -1, 100, 1,5, texte, vide → refusés ; 0 et 99 → acceptés.
- Match : équipes identiques, équipe vide, journée 0 → refusés.

**Verrouillage** — `core/validation/lock.spec.ts`

- Avant le coup d'envoi, sans résultat → modifiable.
- À l'heure exacte du coup d'envoi → verrouillé.
- Avant le coup d'envoi mais avec un résultat → verrouillé.

**Journée par défaut** — `core/scoring/default-matchday.spec.ts`

- Première journée contenant un match non verrouillé.
- Toutes les journées verrouillées → dernière journée.
- Aucun match → journée 1.

### 8.2 Tests du stockage — `core/storage/*.spec.ts`

Avec un faux `localStorage` en mémoire :

- Enregistrer puis relire → données identiques.
- Aucune donnée → `AppData` vide.
- JSON invalide → copie dans la clé de sauvegarde, rien n'est écrasé.
- `schemaVersion` inconnue (plus récente) → lecture seule signalée.
- `setItem` qui lève `QuotaExceededError` → erreur remontée, ancienne valeur intacte.
- `localStorage` inaccessible → mode mémoire signalé.

### 8.3 Tests du service d'état — `core/state/*.spec.ts`

- Enregistrer un pronostic pour le joueur A ne modifie pas celui du joueur B (F-32).
- Saisir puis corriger un résultat ne modifie aucun pronostic (F-43).
- Supprimer un match supprime ses pronostics et son résultat (F-23).
- Supprimer un joueur supprime ses pronostics (F-13).
- Pronostic refusé sur un match verrouillé, avec une horloge fixée dans le test.

### 8.4 Tests de composants

- Carte de match : affiche l'état correct (à saisir, enregistré, verrouillé, terminé avec points).
- Champ de score : refuse une valeur invalide et affiche le message.
- En-tête de journée : compteur « x / y » et rang du joueur actif.
- Écran Classement : ordre et rangs affichés.
- Écran d'accueil sans joueur (F-15).

### 8.5 Vérifications manuelles (PWA)

Après `npm run build` et un service sur un serveur local :

1. L'application propose l'installation.
2. Après un premier chargement, couper le réseau : l'interface s'ouvre et les données sont présentes.
3. Les données survivent à la fermeture et à la réouverture de l'application.

---

## 9. Commandes

- `npm start` : serveur de développement.
- `npm test` : tests Vitest.
- `npm run build` : compilation de production.

---

## 10. Décisions à valider

Valeurs appliquées par défaut. À confirmer ou corriger avant de commencer à coder.

| # | Sujet | Choix par défaut | Alternatives possibles |
|---|---|---|---|
| D1 | Barème (F-50) | 3 pts score exact, 1 pt bonne issue, 0 sinon | Bonus pour le bon écart de buts ; points différents |
| D2 | Verrouillage (F-33) | À l'heure du coup d'envoi | Un délai avant (ex. 1 h) ; verrouillage de toute la journée au premier match |
| D3 | Appareil (§2) | Un seul appareil partagé | Export / import d'un fichier pour passer les données d'un appareil à l'autre (hors périmètre actuel) |
| D4 | Départage (F-61) | Points, puis scores exacts, puis rang partagé | Ajouter le nombre de bonnes issues comme critère |
| D5 | Pronostics des autres (F-34) | Masqués jusqu'au verrouillage | Toujours visibles |
| D6 | Résultat avant le coup d'envoi (F-41) | Autorisé après confirmation | Interdit |
