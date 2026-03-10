# 🎯 Réponses Questions IronTrack - Pour Claude

**Date** : Janvier 2025  
**Projet** : IronTrack  
**Destinataire** : Claude (Design/UX)

---

## 1️⃣ **C'est quoi exactement Iron Track ?**

**IronTrack** est une **application web de suivi de fitness et musculation** complète et moderne.

### Fonctionnalités principales :
- ✅ **Gestion d'exercices** : Création, modification, suivi de performances avec historique détaillé
- ✅ **Timer de session avancé** : Minuterie multi-étapes personnalisable avec notifications audio
- ✅ **Suivi nutritionnel** : Base de données d'aliments, recettes, calculs de macronutriments
- ✅ **Calendrier et planification** : Planification des séances d'entraînement avec visualisation
- ✅ **Système de partenaires d'entraînement** : Partage de séances et programmes avec autres utilisateurs, notifications temps réel
- ✅ **Analyse et progression** : Graphiques détaillés, statistiques avancées, suivi du volume
- ✅ **Interface admin complète** : Gestion utilisateurs, tickets support, statistiques
- ✅ **PWA** : Installation possible comme application native, mode hors ligne partiel

### Public cible :
Pratiquants de musculation débutants à avancés cherchant un suivi complet et professionnel de leurs entraînements.

---

## 2️⃣ **Stack technique**

### Frontend :
- **Framework** : Next.js 15.3.5 avec App Router
- **UI Library** : React 18.3.1
- **Langage** : TypeScript 5.8.3
- **Styling** : 
  - **Tailwind CSS 4.1.11** (framework principal)
  - **shadcn/ui** (composants UI)
  - **CSS Variables** (design tokens personnalisés dans `src/styles/design-tokens.css`)
- **Animations** : Framer Motion 12.23.0
- **Icons** : Lucide React 0.525.0

### Backend & Base de données :
- **Backend** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Real-time** : Supabase Realtime

### Déploiement & Outils :
- **Déploiement** : Vercel
- **Tests** : Jest + Playwright
- **Validation** : Zod 3.25.76
- **Formulaires** : React Hook Form 7.62.0

**Note** : Pas de Vue, pas de Svelte, pas de CSS pur - c'est 100% **React + Next.js + Tailwind CSS**.

---

## 3️⃣ **Couleurs actuelles**

### Palette principale (3 couleurs + variantes) :

#### 🟠 **Orange - Couleur principale IronTrack**
- **Orange 500** : `#f97316` (principal)
- **Orange 600** : `#ea580c` (hover, CTA)
- **Orange 700** : `#c2410c` (pressed)
- **Usage** : Actions principales, CTA, badges importants

#### 🔵 **Bleu - Navigation & Info**
- **Bleu 500** : `#3b82f6`
- **Bleu 600** : `#2563eb` (navigation)
- **Bleu 700** : `#1d4ed8` (hover)
- **Usage** : Navigation, informations, actions secondaires

#### ⚫ **Gris - Structure & Texte**
- **Gris 50-900** : Palette complète de `#f9fafb` à `#111827`
- **Usage** : Fond, bordures, texte, structure

### Design System :
Le projet utilise un **système de design tokens** avec variables CSS (`src/styles/design-tokens.css`) qui définit :
- Couleurs sémantiques (primary, secondary, accent, muted, destructive)
- Support dark mode complet
- Tokens pour headers, cards, boutons

### Problème actuel :
Il y a une **incohérence** : certains composants utilisent directement les classes Tailwind (`bg-orange-600`, `bg-slate-700`, `bg-blue-600`) au lieu d'utiliser les tokens du design system (`var(--primary)`, `var(--secondary)`).

---

## 4️⃣ **Style visuel souhaité**

### Ambiance actuelle :
**Moderne et minimaliste** avec support **dark mode** complet.

### Caractéristiques :
- ✅ **Design épuré** : Interface claire, focus sur le contenu
- ✅ **Dark mode natif** : Support complet avec variables CSS adaptatives
- ✅ **Responsive mobile-first** : Optimisé pour tous les formats (mobile, tablette, desktop)
- ✅ **Accessibilité** : Conformité WCAG 2.1 AA visée (avec quelques corrections nécessaires)
- ✅ **Animations subtiles** : Framer Motion pour transitions fluides
- ✅ **Glassmorphism** : Utilisé sur la page d'authentification (effet verre dépoli)

### Style visuel :
- **Moderne** : Design 2025 avec breakpoints adaptés aux nouveaux appareils (iPhone 15 Pro Max, Samsung S24 Ultra)
- **Minimaliste** : Pas de surcharge visuelle, focus sur l'essentiel
- **Sombre (dark mode)** : Support complet avec palette adaptée
- **Professionnel** : Interface soignée pour un usage sérieux

**Note** : Le style n'est pas "coloré et dynamique" - c'est plutôt sobre et professionnel avec l'orange comme accent pour les actions importantes.

---

## 5️⃣ **Les erreurs principales d'incohérence**

### 🚨 **Erreur 1 : Boutons qui changent de couleur selon les pages**

**Problème** : Les boutons primaires utilisent différentes couleurs selon les composants :
- Certains utilisent `bg-orange-600` (couleur brand)
- D'autres utilisent `bg-slate-800` ou `bg-slate-700` (gris)
- D'autres encore utilisent `bg-blue-600` (bleu)

**Exemples concrets** :
```typescript
// src/components/ui/button.tsx - Variant "default"
default: "bg-slate-800 dark:bg-slate-700 text-white..."

// src/components/ui/SessionTimerSimple.tsx
className="bg-orange-600 hover:bg-orange-700..." // Timer
className="bg-slate-700 hover:bg-slate-600..." // Autres boutons

// Certains composants utilisent directement bg-blue-600
```

**Impact** : L'utilisateur ne sait pas quelle couleur représente une action primaire vs secondaire.

---

### 🚨 **Erreur 2 : Problèmes de contraste WCAG (orange)**

**Problème** : La couleur orange principale ne respecte pas les standards d'accessibilité WCAG 2.1 AA.

**Exemples concrets** :
- **orange-500/white** : Ratio 2.80 (❌ Échec - requis 3.0+ pour texte large)
- **orange-600/white** : Ratio 3.56 (❌ Échec - requis 4.5+ pour texte normal)

**Impact** :
- Boutons primaires orange illisibles pour utilisateurs malvoyants
- Non-conformité légale (RGPD accessibilité)
- Texte orange sur fond blanc difficile à lire

**Fichiers concernés** :
- Tous les boutons avec `bg-orange-500` ou `bg-orange-600`
- Liens avec `text-orange-600`
- Headers avec fond orange

---

### 🚨 **Erreur 3 : Espacements anarchiques**

**Problème** : Les espacements ne suivent pas systématiquement le design system.

**Exemples concrets** :
- Certains composants utilisent `p-4`, d'autres `p-6`, d'autres `p-8` sans logique
- Gaps inconsistants : `gap-2`, `gap-3`, `gap-4`, `gap-6` mélangés
- Marges variables : `mb-4`, `mb-6`, `mb-8` sans cohérence

**Le design system définit pourtant** :
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

**Impact** : Interface visuellement désorganisée, manque de cohérence visuelle.

---

### 🟡 **Erreur 4 : Utilisation de couleurs hardcodées au lieu des tokens**

**Problème** : Beaucoup de composants utilisent directement les classes Tailwind (`bg-orange-600`, `text-gray-700`) au lieu des variables CSS du design system (`var(--primary)`, `var(--foreground)`).

**Exemples concrets** :
```typescript
// ❌ Au lieu de :
className="bg-orange-600 text-white"

// ✅ Devrait être :
className="bg-primary text-primary-foreground"
// ou utiliser les classes Tailwind configurées avec les tokens
```

**Impact** : Difficile de changer la palette globalement, maintenance compliquée.

---

### 🟡 **Erreur 5 : Headers avec styles différents**

**Problème** : Les headers de pages ont des styles variés :
- Certains avec fond blanc simple
- D'autres avec dégradés orange/rouge (qui ont été partiellement corrigés)
- Bordures inconsistantes

**Le design system définit pourtant** :
```css
--header-bg: #ffffff;
--header-border: var(--gray-200);
--header-text: var(--gray-900);
```

**Impact** : Manque de cohérence dans la navigation, expérience utilisateur fragmentée.

---

## 📊 **Résumé des priorités**

### 🔴 **Critique** :
1. **Harmoniser les couleurs de boutons** : Tous les boutons primaires doivent utiliser la même couleur (orange-600 ou bleu-600 selon la décision)
2. **Corriger les contrastes orange** : Utiliser orange-700 ou orange-800 au lieu de orange-500/600 pour respecter WCAG AA
3. **Standardiser les espacements** : Utiliser systématiquement les tokens du design system

### 🟡 **Important** :
4. **Migrer vers les tokens CSS** : Remplacer les classes hardcodées par les variables du design system
5. **Harmoniser les headers** : Utiliser les classes `.header-pattern` définies dans le design system

---

## 🎨 **Recommandations pour Claude**

1. **Définir une palette claire** : Orange pour CTA uniquement ? Ou orange partout ?
2. **Créer un guide de style** : Quand utiliser orange vs bleu vs gris
3. **Corriger les contrastes** : Proposer des alternatives orange plus foncées (orange-700, orange-800)
4. **Standardiser les composants** : Créer des variantes de boutons cohérentes
5. **Documenter les espacements** : Guide d'utilisation des tokens spacing

---

**Note** : Le projet a déjà un excellent design system en place (`src/styles/design-tokens.css`), mais il n'est pas systématiquement utilisé partout. L'objectif serait de **migrer progressivement** tous les composants vers ce système pour garantir la cohérence.

