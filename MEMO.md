# Mémo — travailler avec une IA sur ce projet

## Les fichiers .md

| Fichier | Rôle |
|---|---|
| `README.md` | Vision : quoi, pour qui, ce qu'on ne fera pas. |
| `AGENTS.md` | Règles de l'agent : stack, commandes, conventions, interdits. Prime sur tout. |
| `spec.md` | Référence détaillée : besoins `F-xx`, données, barème, erreurs, interface. À mettre à jour si une règle change. |
| `PLAN.md` | Grandes étapes, avec leur test de réussite. |
| `prompt_plan.md` | 16 étapes TDD, un prompt prêt à l'emploi par étape. |
| `todo.md` | Suivi : l'agent coche son travail, moi « Vérifié » et « Commit ». |
| `PROMPTS.md` | Carnet de bord : ce qui a marché, ce qui a coincé, leçons. |
| `.claude/skills/*/SKILL.md` | Commandes perso (`/prochaine-etape`) qui automatisent une boucle de travail. |

Chaîne : README (pourquoi) → spec (quoi) → plan / prompt_plan (comment) → todo (où on en est).

## Arbre de travail et worktree

- **Arbre de travail** : le dossier courant. « Propre » = rien en attente dans `git status`. On part toujours d'un arbre propre pour ne pas mélanger deux étapes.
- **Worktree** (`git worktree add ../dossier -b branche`) : un deuxième dossier sur le même dépôt, avec sa propre branche.
  - L'agent code à part, mon `npm start` sur `main` n'est pas perturbé.
  - Plusieurs agents en parallèle sans conflit.
  - Résultat décevant : je supprime le worktree, `main` n'a jamais bougé.
  - Résultat bon : je relis, je teste, je fusionne.

## Sous-agents pour relire le code

- Un sous-agent démarre **sans le contexte** de la conversation : il ne connaît que ce qu'on lui donne.
- Avantage pour une relecture : un regard neuf, pas influencé par les choix de l'agent qui a codé.
- Bonne pratique : lui donner **le code ou le diff, pas la conclusion** (« vérifie que c'est correct » biaise vers « oui »).
- Outils : `/code-review` (bugs), `/simplify` (qualité, simplification), `/security-review`.
- Coût : chaque sous-agent consomme des jetons ; à réserver aux relectures utiles (fin d'étape, règle métier sensible).
