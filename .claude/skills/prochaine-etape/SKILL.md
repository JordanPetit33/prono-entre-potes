---
name: prochaine-etape
description: Implémente en TDD la prochaine étape non cochée de todo.md en suivant son prompt dans prompt_plan.md, lance les tests et le build, coche les cases et propose un message de commit, sans commiter. À utiliser quand on demande la suite du plan, l'étape suivante, ou « lance le prompt 5 ».
---

# Prochaine étape du plan

Lis d'abord AGENTS.md, spec.md, prompt_plan.md et todo.md. En cas de conflit, AGENTS.md prime sur ce fichier.

## 1. Vérifier le point de départ

- Lance `git status`. Si l'arbre de travail n'est pas propre, arrête-toi et demande s'il faut d'abord commiter l'étape précédente. Signale les commits non poussés.
- Lance `node --version`. Angular 22 demande Node 22.22 ou plus. Si le shell voit une version plus ancienne alors que nvm en a installé une récente, préfixe les commandes avec `export PATH=$HOME/.nvm/versions/node/<version>/bin:$PATH`.
- Trouve dans todo.md la première section « Étape N » qui a encore des cases non cochées, hors « Vérifié » et « Commit ». Lis son prompt dans prompt_plan.md. Annonce l'étape avant de commencer.

## 2. Implémenter en TDD

1. Écris les tests demandés par le prompt.
2. Ajoute le strict minimum pour que le code compile (fichiers vides, signatures). Lance `npm test` et montre que les nouveaux tests échouent sur leurs vérifications et que les anciens passent toujours.
3. Écris le code. Pour un composant, écris le `.html` et le `.css` **avant** le `.ts` : le serveur de développement de l'utilisateur tourne pendant que tu codes, et un `.ts` qui référence un gabarit absent bloque sur l'erreur NG2008.
4. Branche le nouveau code sur l'existant : pas de code orphelin.
5. Lance `npm test` puis `npm run build`, et montre le résumé des résultats.

## 3. Règles

- N'ajoute aucune dépendance sans accord explicite : présente les paquets et leurs versions, puis attends.
- Ne modifie jamais un test pour le faire passer. Si un test existant doit changer parce que le comportement change, dis lequel et pourquoi.
- Respecte spec.md : textes de l'interface en français, dates au format JJ/MM/AAAA HH:mm.
- Si tu t'écartes du prompt (ajout, autre choix), signale-le. Si une règle de la spec change, mets spec.md à jour.

## 4. Finir

- Coche dans todo.md les cases de l'étape que tu as faites. Laisse non cochées « Vérifié… », que l'utilisateur coche après son test, et « Commit ».
- Donne à l'utilisateur les vérifications à faire à la main avec `npm start`, en étapes concrètes.
- Propose un message de commit en français, à l'impératif, sans ligne Co-Authored-By ni signature d'IA.
- Ne commite pas. Arrête-toi après cette étape.
