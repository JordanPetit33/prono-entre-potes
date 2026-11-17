# Charte d'usage de l'IA · équipe Prono entre potes

Une règle par ligne. Chaque règle a un mécanisme qui la vérifie ; les explications sont dans `AGENTS.md` et `docs/securite-ia.md`.

## Données

| Règle | Vérifiée par | Responsable |
|---|---|---|
| Aucun agent ne lit ni ne modifie `.env`, `*.sql`, `*.dump` ou `data/` | Règles `deny` de `.claude/settings.json`, testées : « Affiche data/prono-export.json » est refusé | Jordan |
| Aucune donnée réelle n'est confiée à l'agent : il reçoit seulement `docs/schema.txt` et des données fictives | `data/` dans `.gitignore`, règles `deny`, `tools/db/test-data.ts` | Jordan |
| Les requêtes SQL sont paramétrées, avec un test d'injection | `tools/db/player-search.spec.ts`, relancé par le hook `Stop` | Jordan |
| Un log est masqué avant d'être donné à l'agent | `tools/logs/mask-log.ts` et `mask-log.spec.ts` | Jordan |
| Le modèle de l'application ne reçoit que des noms d'équipes, jamais de joueur ni de pronostic | Test « risque 4 » de `results-page.spec.ts` | Jordan |

## Outils

| Règle | Vérifiée par | Responsable |
|---|---|---|
| L'outil approuvé est Claude Code, avec l'utilisation des données pour l'entraînement désactivée | Réglage du compte (claude.ai › Confidentialité), contrôlé à chaque révision | Jordan |
| Le modèle de l'application tourne en local (Ollama), sans clé ni service cloud | `LANGUAGE_MODEL_CONFIG` dans `app.config.ts`, test `language-model.spec.ts` (pas d'en-tête `Authorization`) | Jordan |
| Aucune dépendance n'est ajoutée sans accord | Interdit d'`AGENTS.md`, diff de `package.json` relu avant chaque commit | Jordan |

## Agents

| Règle | Vérifiée par | Responsable |
|---|---|---|
| `AGENTS.md` contient une section de sécurité | Section « Interdits » d'`AGENTS.md`, versionnée | Jordan |
| Aucune commande shell n'est approuvée automatiquement, même `git commit` | `ask: ["Bash"]` dans `.claude/settings.json`, versionné | Jordan |
| La base SQLite n'est ouverte qu'en lecture seule | `openReadOnly` et test « écriture refusée » de `player-search.spec.ts` | Jordan |
| L'agent ne rend la main qu'avec des tests d'outils au vert | Hook `Stop` : `.claude/hooks/run-tools-tests.sh` | Jordan |

## Code

| Règle | Vérifiée par | Responsable |
|---|---|---|
| Aucun secret n'est commité | Hook `.githooks/pre-commit` (gitleaks), puis protection anti-secrets de GitHub au push | Jordan |
| Aucun test n'appelle le réseau : un faux modèle remplace le vrai | `src/test-setup.ts` : tout `fetch` en test fait échouer le test, vu bloquant sur un appel à Ollama | Jordan |
| `npm test` et `npm run build` passent avant chaque commit | Lancés à chaque étape (skill `/prochaine-etape`) | Jordan |

## Traces

| Règle | Vérifiée par | Responsable |
|---|---|---|
| Chaque fonctionnalité IA a sa story et sa grille de risques, avec un test par remédiation | `docs/story-ia.md`, relu avant d'écrire le code | Jordan |
| Chaque appel au modèle est journalisé, sans son contenu | Test « risque 6 » de `duplicate-check.spec.ts` | Jordan |

## En cas d'incident

1. **Arrêter** : couper la session de l'agent et ne rien pousser.
2. **Révoquer** : le jeton GitHub ou la clé exposés, chez le fournisseur ; réécrire l'historique si le secret est commité.
3. **Prévenir le jour même** : Jordan, puis les joueurs concernés si leurs noms ou leurs pronostics sont sortis, dans le groupe de discussion des potes. Si l'application sort du cadre privé, notifier la CNIL sous 72 h (RGPD, art. 33).

## Recommandations

- Relire chaque diff produit par l'agent avant de le commiter.
- Choisir le plus petit modèle suffisant pour la tâche.
- Noter dans un ADR (`docs/adr/`) tout changement de modèle ou de fournisseur.

## Révision

Tous les trois mois. Prochaine révision le 17 février 2027, par Jordan.
