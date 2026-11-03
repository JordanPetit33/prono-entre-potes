# Carnet de prompts

Prompts utilisés pendant l'atelier, ce qui a marché, ce qui a coincé, et les versions corrigées.

## Bilan

| Prompt | A marché ? | Ce qui a coincé |
|---|---|---|
| 1 · Affiner l'idée | Sauté | Remplacé par des choix par défaut, signalés **[À valider]** dans `spec.md` et validés à la relecture. |
| 2 · Compiler la spec | ✅ | Le prompt suppose un brainstorming préalable (« Nous avons fini le brainstorming »). Sans lui, l'agent doit inventer des décisions : barème, verrouillage, appareil partagé, départage. |
| 3a · Plan TDD | ✅ | — |
| 4 · todo.md | ✅ | — |
| 5 · Exécution, étape 1 | ⚠️ | Node 20 (paquet Debian) trop ancien pour Angular 22 : installation de Node 24 avec nvm. Le générateur Angular ajoutait `prettier`, non validé : retiré. |
| 5 · Exécution, étapes 3 et 4 | ⚠️ | `ng serve` allumé pendant que l'agent écrit : erreur NG2008 « Could not find template file ». Le `.ts` était compilé avant que son `.html` existe. |
| 5 · Exécution, étape 3 | ⚠️ | Un test des routes vérifiait le titre provisoire de la page. Il a été adapté, avec justification, pour vérifier le composant affiché. |
| 5 · Exécution, étape 4 | ⚠️ | jsdom ne gère pas `showModal()` sur `<dialog>` : ajout de `src/test-setup.ts` pour le simuler pendant les tests. |
| 5 · Exécution, étape 6 | ⚠️ | Les tests partageaient le `localStorage` de jsdom : il est vidé avant chaque test. |

## Leçons

- **Ne pas sauter le prompt 1.** La spec est meilleure quand les décisions viennent de mes réponses plutôt que de choix par défaut de l'agent.
- **Vérifier l'environnement avant d'installer** : version de Node, compatibilité des versions, paquets ajoutés par les générateurs.
- **Arrêter `npm start` pendant que l'agent code**, ou lui demander d'écrire les gabarits avant les composants.
- **Un test qui doit changer, c'est un signal** : vérifier qu'il testait le bon comportement, et faire justifier le changement.

## Versions corrigées

### Prompt 2 · Compiler la spec, sans brainstorming préalable

```text
Compile une spécification complète, prête pour un développeur, à partir de README.md, AGENTS.md, PLAN.md et de la maquette jointe : besoins fonctionnels, choix d'architecture et de stack, données manipulées, gestion des erreurs, et plan de tests.
Pour chaque décision qui n'est pas prise dans ces documents, choisis une valeur par défaut raisonnable, marque-la [À valider] et regroupe-les dans une section « Décisions à valider » à la fin.
Écris-la dans spec.md.
```

### Étape 1 du plan · Initialiser le projet, avec vérification de l'environnement

À ajouter au début du prompt de l'étape 1 de `prompt_plan.md` :

```text
Avant tout, vérifie la version de Node et de npm installées et compare-les aux versions requises par la version d'Angular visée (champ engines). Si elles ne conviennent pas, arrête-toi et propose-moi une solution.
Après la génération du projet, liste tous les paquets ajoutés par le générateur et retire ceux que je n'ai pas validés.
```

### Prompt 5 · Exécuter l'étape suivante, avec le serveur allumé

```text
Lis spec.md, prompt_plan.md et todo.md. Implémente la prochaine étape non cochée de todo.md, en suivant son prompt dans prompt_plan.md. Mon serveur de développement tourne : écris le gabarit et le style d'un composant avant son fichier .ts. Lance les tests et montre-moi leur résultat. Quand ils passent, coche la case dans todo.md et propose un message de commit. Arrête-toi après cette étape.
```
