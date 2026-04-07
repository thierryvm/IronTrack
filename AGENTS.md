# IronTrack — AGENTS.md

## Mission

Tu travailles sur IronTrack.

Ton rôle est de faire avancer le produit de manière disciplinée, incrémentale et reviewable, sans réinventer des surfaces déjà validées.

Tu dois privilégier :
- la continuité,
- la cohérence,
- le respect des issues,
- le respect des PRs validées,
- le respect des choix UI/UX déjà approuvés,
- les changements petits et vérifiables.

---

## Règle absolue

Ne repars jamais de zéro si une direction a déjà été validée.

Si une décision visuelle, UX, structurelle ou produit a déjà été validée :
- elle est considérée comme stable par défaut ;
- tu la prolonges proprement ;
- tu ne la remplaces pas sans raison forte.

Tu peux corriger :
- bugs,
- régressions,
- responsive,
- accessibilité,
- contrastes,
- dette technique locale,
- incohérences ciblées.

Tu ne dois pas :
- redessiner hors scope,
- réouvrir des choix déjà approuvés,
- mélanger plusieurs chantiers sans demande explicite,
- transformer une petite tâche en refonte globale.

---

## Source de vérité

Considère comme sources prioritaires, dans cet ordre :

1. l’issue en cours
2. la PR en cours
3. les choix explicitement validés
4. les surfaces déjà redesignées et approuvées
5. les règles de ce fichier

Tu dois t’aligner sur l’existant validé.

---

## Discipline issue / branche / PR

Règles obligatoires :
- 1 issue = 1 objectif clair
- 1 branche = 1 lot cohérent
- 1 PR = 1 changement validable

Si une issue est large :
- définis un sous-scope concret,
- dis ce que tu traites maintenant,
- dis ce qui reste hors scope,
- n’utilise jamais une issue large comme permission implicite pour toucher tout le produit.

---

## Avant tout changement

Avant de coder, tu dois toujours expliciter :

1. le scope exact traité
2. ce qui est déjà validé et doit être conservé
3. ce que tu modifies
4. ce qui reste hors scope
5. les risques
6. le plan minimal d’implémentation

Ne commence pas directement à coder sans ce cadrage.

---

## Règle UX / UI

Tu dois privilégier :
- cohérence,
- continuité,
- lisibilité,
- accessibilité,
- mobile-first,
- stabilité des patterns,
- amélioration incrémentale.

Tu dois éviter :
- variation gratuite,
- nouveaux patterns inutiles,
- divergence visuelle,
- complexité non nécessaire,
- composants parallèles qui refont la même chose.

Si un pattern validé existe déjà dans le repo :
- réutilise-le,
- étends-le,
- n’en introduis pas un nouveau sans raison forte.

---

## Règle technique

Ne mélange pas dans un même lot :
- refonte UX,
- migration majeure,
- dette dépendances,
- correctifs produit,
- expérimentation visuelle,
- QA large.

Isole les changements.
Un lot doit rester reviewable rapidement.

---

## Accessibilité et contraste — règle bloquante

La conformité contraste est une exigence récurrente sur ce projet.

Si tu touches du texte, des badges, des labels, des helper texts, des placeholders, des états vides, des cartes ou des composants interactifs, tu dois vérifier les contrastes.

### Règles obligatoires
- ne réintroduis pas `text-gray-400` ou `text-gray-500` sur des surfaces concernées par les contrôles d’accessibilité ;
- remplace-les par les classes sûres déjà prévues dans le projet, comme `text-safe-muted` ou autres `text-safe-*` si elles existent ;
- si le contenu est dynamique, utilise `createSafeTextClass()` quand c’est la convention prévue ;
- évite les couleurs custom improvisées pour du texte critique ;
- privilégie les tokens de design sûrs plutôt que des classes ad hoc.

### Si un contrôle contraste échoue
Tu dois traiter cela comme un bug bloquant du lot.

Tu ne dois pas répondre “le style est correct visuellement”.
Tu dois corriger la conformité.

### Réflexe obligatoire avant de finir
Recherche dans le diff et dans les fichiers modifiés :
- `text-gray-400`
- `text-gray-500`
- couleurs custom de texte
- contrastes potentiellement fragiles en dark mode

Puis corrige avant de finaliser.

---

## Vérifications obligatoires

Avant de terminer, tu dois exécuter tous les checks pertinents mentionnés dans le repo ou dans ce fichier.

Minimum attendu selon le lot :
- lint
- typecheck
- build
- tests ciblés
- vérifications accessibilité/contraste si la surface UI est touchée

Si un check casse :
- corrige,
- relance,
- ne termine pas en laissant l’état ambigu.

---

## Réponse attendue avant code

Avant d’implémenter, réponds avec cette structure :

### Résumé du lot
### Ce qui est déjà validé et conservé
### Ce qui est modifié
### Ce qui reste hors scope
### Risques
### Plan minimal
### Vérifications à exécuter

Ensuite seulement, code.

---

## Règle finale

Si tu hésites entre :
- réinventer,
ou
- prolonger proprement l’existant validé,

tu dois choisir :
**prolonger proprement l’existant validé**.

---

## Références

- La documentation projet détaillée reste dans `README.md` et `docs/`.
- Ce fichier sert d’abord de garde-fou global de discipline produit et d’exécution.
