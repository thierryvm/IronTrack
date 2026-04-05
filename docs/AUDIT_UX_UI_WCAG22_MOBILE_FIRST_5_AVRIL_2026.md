# Audit UX/UI, WCAG 2.2 & Mobile-First

Date: 5 avril 2026
Projet: IronTrack
Epic GitHub: #4

## Objectif

Structurer la refonte UX/UI d'IronTrack en lots livrables, traçables et compatibles avec une exécution propre en PR successives.

## Constat global

IronTrack a déjà une bonne base fonctionnelle, mais l'expérience ressemble encore à une juxtaposition de modules plus qu'à un produit mobile-first cohérent.

Les problèmes principaux se concentrent sur:

- une hiérarchie visuelle trop agressive et trop orange
- un shell applicatif encore très desktop-first
- des parcours critiques trop longs ou trop bavards
- des composants legacy dupliqués (`2025`) qui fragmentent l'interface
- des formulaires et feedbacks pas encore alignés avec WCAG 2.2
- un admin riche mais pas encore pensé comme un outil opérable sur mobile

## Zones critiques auditées

### 1. Authentification

Fichier principal: `src/app/auth/page.tsx`

Points relevés:

- le hero branding disparaît complètement sur mobile, ce qui retire la sensation de confiance et d'identité
- l'écran repose encore sur des styles inline et un visuel de fond très générique
- le `console.error` de login Google est encore présent
- la page reste fonctionnelle, mais pas assez premium ni mobile-first pour un produit fitness

### 2. Onboarding

Fichier principal: `src/app/onboarding/page.tsx`

Points relevés:

- redirection finale vers `/profile?onboarding=success`, sans vraie "première victoire produit"
- `alert()` bloquant encore utilisé en cas d'échec
- flux trop court pour personnaliser correctement entraînement, nutrition et usage mobile
- coexistence de composants onboarding legacy et `2025`

### 3. Calendrier & planification

Fichier principal: `src/app/calendar/page.tsx`

Points relevés:

- page très volumineuse, mélangeant data fetching, logique tactile et présentation
- usage de `next/head` dans l'App Router
- hero visuellement trop agressif pour une surface de productivité
- compteur partenaires obsolète encore visible dans l'UI
- bascule de vues et interactions calendrier/liste encore trop desktop-first
- hiérarchie statistique faible sur mobile

### 4. Création de séance

Fichier principal: `src/app/workouts/new/page.tsx`

Points relevés:

- feedback trop bavard et parfois gimmick, ce qui nuit à la clarté
- mélange de primitives UI et d'éléments HTML bruts
- états d'erreur et de succès trop "bruyants" visuellement
- champs peu regroupés et peu pensés pour une saisie rapide sur téléphone
- classes de couleur encore non harmonisées avec les règles de contraste sécurisées

### 5. Création d'exercice

Fichier principal: `src/app/exercises/new/page.tsx`

Points relevés:

- création côté client directement via Supabase
- messages toast mal formés (`Exercice"..."`)
- logs console encore présents
- expérience potentiellement puissante, mais pas encore assez guidée ni unifiée
- dette technique visible avec plusieurs éditeurs/formulaires legacy dans `src/components/exercises`

### 6. Admin

Fichier principal: `src/app/admin/page.tsx`

Points relevés:

- dashboard encore très orienté cartes/KPI desktop
- plusieurs `console.error` encore présents
- logique de chargement sérieuse mais expérience mobile insuffisamment priorisée
- workflows tickets/utilisateurs/logs pas encore assez orientés action rapide sur petit écran

### 7. Shell global, dark mode et branding

Fichiers concernés:

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/HeaderClient.tsx`
- `src/components/shared/Logo.tsx`
- `src/app/icon.png`

Points relevés:

- le logo peut être conservé tel quel
- le favicon doit être rafraîchi pour être plus propre à petite taille
- le dark mode existe, mais l'ensemble manque encore de cohérence de surfaces, contrastes et états interactifs
- plusieurs zones globales critiques sont actuellement modifiées localement, donc à traiter avec précaution

## Dette structurelle

Doublons visibles:

- `src/components/onboarding/FrequencySelection2025.tsx`
- `src/components/onboarding/GoalSelection2025.tsx`
- `src/components/exercises/ExerciseCard2025.tsx`
- `src/components/exercises/ExerciseEditForm2025.tsx`
- `src/components/exercises/PerformanceEditForm2025.tsx`

Impact:

- rend les évolutions plus lentes
- fragilise la cohérence visuelle
- augmente le risque de divergence fonctionnelle entre variantes

## Baseline WCAG 2.2 ciblée

À imposer sur tous les lots:

- cibles tactiles minimales cohérentes sur mobile
- focus visible systématique
- hiérarchie de titres stable
- feedbacks asynchrones via `aria-live`
- labels explicites sur tous les contrôles
- réduction des contrastes fragiles et des classes non sécurisées
- suppression des `alert()` bloquants et remplacement par feedback inline accessible
- validation d'entrée et erreurs au plus près des champs

## Backlog GitHub créé

- #4 Epic global UX/UI overhaul
- #5 Design system foundation, dark mode and favicon refresh
- #6 WCAG 2.2 baseline and accessibility guardrails
- #7 Mobile-first app shell and admin mobile navigation
- #8 Auth and onboarding redesign
- #9 Calendar, workouts and planning UX redesign
- #10 Exercises UX and creation/edit flows redesign
- #11 Admin dashboard and workflows completion on mobile
- #12 QA, rollout and regression hardening

## Ordre d'exécution recommandé

### Lot 1

Issue: #5

Périmètre:

- consolider la direction visuelle globale
- poser les règles dark mode et surfaces
- définir la hiérarchie CTA
- préparer le refresh favicon

Fichiers probables:

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/HeaderClient.tsx`
- `src/components/shared/Logo.tsx`
- `src/app/icon.png`

Risque:

- élevé, car plusieurs de ces fichiers ont déjà des modifications locales non committées

### Lot 2

Issue: #6

Périmètre:

- poser les garde-fous WCAG 2.2 sur primitives, focus, formulaires et feedback

Fichiers probables:

- composants UI partagés
- pages auth/onboarding/workouts/exercises les plus exposées

Risque:

- moyen, mais transverse

### Lot 3

Issue: #7

Périmètre:

- refonte du shell mobile-first
- navigation mobile admin incluse

Risque:

- élevé, car touche navigation, header, safe areas et layout global

### Lot 4

Issue: #8

Périmètre:

- refonte auth + onboarding général + onboarding exercices

Risque:

- moyen à élevé selon le couplage avec le profil et les redirects existants

### Lot 5

Issue: #9

Périmètre:

- calendrier
- création de séance
- hiérarchie planning/stats/actions

Risque:

- moyen, avec forte dette UI dans un composant de page très volumineux

### Lot 6

Issue: #10

Périmètre:

- découverte, création, édition d'exercices
- consolidation progressive des variantes legacy

Risque:

- élevé, car logique métier cardio et musculation déjà étendue

### Lot 7

Issue: #11

Périmètre:

- finalisation admin mobile
- workflows tickets/utilisateurs/logs

Risque:

- élevé, car plusieurs fichiers admin sont déjà modifiés localement

### Lot 8

Issue: #12

Périmètre:

- tests, vérifications, contraste, accessibilité, checklists de rollout

Risque:

- faible à moyen, mais indispensable pour sécuriser la refonte

## Priorité opérationnelle

Si le worktree local reste dans l'état actuel, le premier lot de code le plus sûr n'est pas le shell global, mais:

1. audit et backlog formalisés
2. auth/onboarding ou calendrier/workouts sur fichiers non modifiés localement
3. shell global et admin mobile une fois les changements locaux stabilisés

## Décision recommandée

Conserver l'ordre métier du programme (#5 à #12), mais démarrer l'implémentation sur un lot qui n'entre pas en collision avec les fichiers déjà modifiés localement.

Le meilleur compromis actuel est:

- préparer le design directionnel du lot 1 dans GitHub et la doc
- lancer ensuite la première PR de code sur `#8` ou `#9`
- traiter `#5` et `#7` juste après, quand le shell global pourra être touché proprement

## Risque résiduel

Le plus gros risque technique immédiat n'est pas la complexité de la refonte elle-même, mais la collision potentielle avec les modifications locales déjà présentes sur:

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/layout/HeaderClient.tsx`
- plusieurs pages admin

Tant que ces fichiers restent modifiés localement, toute refonte globale doit être isolée avec une discipline stricte de staging sélectif et de validation page par page.
