# 📐 Règles Design — IronTrack Quick Reference

> Ce fichier est la référence RAPIDE. Pour le détail, voir `agents/ui-ux.md`.

## 🎨 COULEURS — Quoi utiliser où

### Orange (brand)
```
✅ Bouton CTA primaire ("Se connecter", "Ajouter", "Enregistrer")
✅ Icônes d'action principale
✅ Indicateurs de progression/succès fitness
❌ Fonds de section
❌ Backgrounds de cards
❌ Texte courant
❌ Bordures décoratives
❌ Plus d'un élément orange par section
```

### Variables CSS à utiliser
```css
/* Fonds */
bg-background       → fond de page
bg-card             → fond card/panel
bg-muted            → zone grisée/subdued
bg-accent           → zone hover/active

/* Texte */
text-foreground         → texte principal
text-muted-foreground   → texte secondaire, labels

/* Bordures */
border-border       → toutes les bordures

/* Boutons */
bg-primary          → bouton CTA (orange)
text-primary-foreground → texte sur bouton orange
```

## 🔘 BOUTONS — Hiérarchie obligatoire

```
Page entière → 1 seul bouton "primary" (orange plein)
Actions secondaires → variant="outline" (bordure, fond transparent)
Actions tertiaires → variant="ghost" (juste le texte)
Actions destructives → variant="destructive" (rouge)
```

**Tailles standard :**
- Actions critiques (submit, save) : `size="lg"` → 48px min
- Actions normales : `size="default"` → 44px min  
- Actions dans tableau/liste : `size="sm"` → 44px min (pas moins !)

## 🌙 DARK MODE — Règles automatiques

Si tu utilises les variables CSS (`bg-card`, `text-foreground`...) → dark mode automatique ✅

Si tu vois `bg-white` → remplace par `bg-card`
Si tu vois `text-gray-900` → remplace par `text-foreground`
Si tu vois `text-gray-600` → remplace par `text-muted-foreground`
Si tu vois `border-gray-200` → remplace par `border-border`

## 📐 ESPACEMENTS — Grille de 4px

```
p-1  = 4px   (très serré)
p-2  = 8px   (serré)
p-3  = 12px  (compact)
p-4  = 16px  (standard)
p-6  = 24px  (spacieux)
p-8  = 32px  (très spacieux)
```
Jamais de valeurs arbitraires comme `p-[17px]` ou `mt-[23px]`.

## 🔠 TYPOGRAPHIE — Scale standard

```
text-xs     = 12px  → labels, badges, captions
text-sm     = 14px  → texte secondaire, descriptions
text-base   = 16px  → texte principal
text-lg     = 18px  → sous-titres de section
text-xl     = 20px  → titres de card
text-2xl    = 24px  → titres de page mobile
text-3xl    = 30px  → titres de page desktop
```

## 🃏 CARDS — Template standard

```tsx
<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
  <h3 className="text-base font-semibold text-foreground">Titre</h3>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

## ✅ CHECKLIST RAPIDE avant tout commit design

- [ ] Pas d'orange hors CTA primaire
- [ ] Pas de `bg-white` ou `bg-gray-*` sans variable CSS
- [ ] Pas de `text-gray-*` sans variable CSS  
- [ ] Un seul bouton primary par vue
- [ ] Tous les éléments cliquables ≥ 44px
- [ ] Test visuel en dark mode
