Parfait Thierry, je t’ai repris ton fichier et je l’ai **amélioré en profondeur** pour intégrer les résultats concrets de l’audit Lighthouse mobile + les remarques issues du test manuel + de bonnes pratiques additionnelles modernes.

---

Voici la **version améliorée et à jour** de `CLAUDE_ACCESSIBILITY.md` 👇
Tu peux la copier/coller dans ton dossier `/docs` ou à la racine du repo :

---

````md
# Guide d'accessibilité pour Claude Code — Projet IronTrack

---

## Sommaire

- [1. Objectif général](#1-objectif-général)  
- [2. Contraste des couleurs](#2-contraste-des-couleurs)  
- [3. Boutons et éléments interactifs](#3-boutons-et-éléments-interactifs)  
- [4. Hiérarchie des titres](#4-hiérarchie-des-titres)  
- [5. Navigation clavier](#5-navigation-clavier)  
- [6. Formulaires](#6-formulaires)  
- [7. Images et médias](#7-images-et-médias)  
- [8. Tests et validation](#8-tests-et-validation)  
- [9. Palette de couleurs recommandée](#9-palette-de-couleurs-recommandée)  
- [10. Conseils supplémentaires](#10-conseils-supplémentaires)  
- [11. Actions correctives issues de l’audit 08/2025](#11-actions-correctives-issues-de-laudit-082025)  
- [12. Documentation et mise à jour](#12-documentation-et-mise-à-jour)

---

## 1. Objectif général

Garantir que l’application IronTrack soit accessible au maximum d’utilisateurs, y compris ceux utilisant des technologies d’assistance (lecteurs d’écran, navigation clavier), et conforme aux standards **WCAG 2.1 niveau AA**.

---

## 2. Contraste des couleurs

- Ratio minimum :
  - Texte standard : **≥ 4.5:1**
  - Texte large (≥ 24px ou ≥ 18px en gras) : **≥ 3:1**
- Éviter :
  - `text-orange-100` ou autre texte clair sur fond orange
  - Couleurs pastel trop claires
- Outils recommandés :
  - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- Corriger avec des classes Tailwind : `text-white`, `bg-orange-700`, etc.

---

## 3. Boutons et éléments interactifs

- Tous les boutons doivent avoir un **nom accessible** :
  - Texte visible **ou**
  - `aria-label="Nom du bouton"` si c’est une icône seule
- Vérifier tous les composants interactifs :
  ```tsx
  <button aria-label="Ajouter un exercice">
    <PlusIcon />
  </button>
````

* Ajouter un `title` si nécessaire
* Focus visible sur tous les éléments (`focus:ring`, `focus:outline`)

---

## 4. Hiérarchie des titres

* 1 seul `<h1>` par page
* Suivre une hiérarchie logique : `<h2>`, `<h3>`, etc.
* Ne pas utiliser les titres pour du style uniquement (préférer des classes CSS)

---

## 5. Navigation clavier

* Ajouter un lien "Aller au contenu principal" en haut de chaque page :

  ```html
  <a href="#main-content" className="sr-only focus:not-sr-only">Aller au contenu principal</a>
  ```
* Tous les éléments doivent être accessibles avec `Tab`
* Focus clair et visible : `focus:ring-*` ou équivalent

---

## 6. Formulaires

* Tous les champs doivent avoir un `label` (visible ou `sr-only`)
* Exemple :

  ```jsx
  <label htmlFor="username" className="sr-only">Nom d'utilisateur</label>
  <input id="username" name="username" />
  ```
* Indiquer les erreurs avec :

  * Texte + couleur
  * Attributs ARIA (`aria-invalid`, `aria-describedby`)
* Vérifier les attributs `name`, `id`, `for`, etc.

---

## 7. Images et médias

* `alt=""` pour les images décoratives
* `alt="Texte descriptif"` pour les images importantes
* Pour les vidéos :

  * Ajouter des sous-titres si possible
  * Fournir une transcription si pertinent

---

## 8. Tests et validation

* À chaque changement UI :

  * Lancer `axe-core` :

    ```bash
    npx @axe-core/cli http://localhost:3000 --tags wcag2a,wcag2aa
    ```
  * Compléter avec test clavier et lecteur d’écran
* Documenter toute exception ou limitation

---

## 9. Palette de couleurs recommandée

```css
:root {
  --orange-primary: #d97706;
  --orange-hover: #b45309;
  --orange-bg-light: #fef3c7;
  --gray-dark: #1f2937;
  --gray-light: #f9fafb;
  --text-default: var(--gray-dark);
  --background-default: var(--gray-light);
}
```

* Utiliser cette palette comme base pour tous les composants
* Contraste vérifié → conforme AA

---

## 10. Conseils supplémentaires

* Ne pas compter uniquement sur la couleur pour transmettre une info
* Garder :

  * Texte lisible ≥ 16px
  * Cibles tactiles ≥ 44x44 px
  * Transitions douces (`transition-colors`, `motion-safe`)
* Ajouter une classe conditionnelle pour les utilisateurs sensibles :

  ```tsx
  <div className="motion-safe:animate-fadeIn">...</div>
  ```

---

## 11. Actions correctives issues de l’audit 08/2025

| Problème détecté                  | Page(s) concernées                 | Action requise                                                                  |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| ❌ Contraste insuffisant           | Header, boutons orange, fond clair | Remplacer `text-orange-100` par `text-white` ou `text-gray-200`, assombrir fond |
| ❌ Boutons sans label accessible   | Boutons icônes dans navbar, cards  | Ajouter `aria-label`, `title` explicites                                        |
| ❌ Cibles tactiles trop proches    | Mobile : admin panel, tags         | Ajouter `gap-x-2`, `px-2`, etc. pour augmenter l’espace                         |
| 🔸 Images non lazy-loaded         | Logo, illustrations SVG            | Ajouter `loading="lazy"`                                                        |
| 🔸 Absence de test motion-reduced | Pages avec animations              | Ajouter `motion-safe:` et vérifier comportements                                |

---

## 12. Documentation et mise à jour

* Ce fichier doit être inclus dans les fichiers de référence de Claude (`CLAUDE.md`)
* Mettre à jour après tout changement de structure, UI ou design system
* Peut être lié à un test CI automatisé plus tard (ex : Playwright + axe-core)

---

## Merci Claude Code 🙏

Ta rigueur permet à IronTrack de rester inclusif, pro et agréable à utiliser pour tous, sans compromis sur le style.
Continue comme ça ! 💪

