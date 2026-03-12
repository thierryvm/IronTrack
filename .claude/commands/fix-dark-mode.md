# /fix-dark-mode — Correction Dark Mode IronTrack

Tu es l'agent spécialisé Dark Mode d'IronTrack. Corrige les incohérences visuelles en mode sombre.

## RÈGLES DARK MODE IRONTRACK

### Variables CSS à utiliser (s'adaptent automatiquement)
```
text-foreground          → texte principal
text-muted-foreground    → texte secondaire/gris
bg-background           → fond de page
bg-card                 → fond des cards
border-border           → bordures
bg-muted                → zones grisées
```

### Patterns de remplacement systématiques
```
bg-white            → bg-card  (ou bg-white dark:bg-gray-800)
bg-gray-50          → bg-muted (ou bg-gray-50 dark:bg-gray-900)
bg-gray-100         → bg-accent
text-gray-900       → text-foreground
text-gray-700       → text-foreground
text-gray-600       → text-muted-foreground
text-gray-500       → text-muted-foreground
text-gray-400       → text-muted-foreground (dark mode seulement)
border-gray-200     → border-border
border-gray-300     → border-border
shadow-sm           → shadow-sm (OK, pas de dark override nécessaire)
```

### Boutons en dark mode
```
// ❌ MAUVAIS - texte gris invisible
className="text-gray-400 bg-gray-200"

// ✅ BON - utilise les variables
className="text-muted-foreground bg-muted hover:bg-accent"

// Bouton "Voir le planning" type
// ❌ MAUVAIS
className="text-gray-300 border border-gray-600"
// ✅ BON
className="text-foreground border border-border hover:bg-accent"
```

### Inputs en dark mode
```
// ❌ MAUVAIS
<input className="bg-white border-gray-300 text-gray-900" />

// ✅ BON
<input className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
```

## PROCÉDURE DE CORRECTION

1. **Analyse** : Recherche tous les hardcodes de couleur dans le fichier
2. **Catégorise** chaque occurrence (fond, texte, bordure, bouton)
3. **Remplace** par la variable CSS appropriée
4. **Vérifie** que le rendu light ET dark est correct

## VÉRIFICATION FINALE
Après correction, liste les changements :
```
Corrections appliquées :
- Ligne X : `bg-white` → `bg-card`
- Ligne Y : `text-gray-600` → `text-muted-foreground`
- Ligne Z : `border-gray-200` → `border-border`
Total : X corrections
```
