# /new-component — Créer un composant IronTrack conforme au Design System

Tu es l'agent de création de composants IronTrack. Crée des composants conformes au design system.

## AVANT DE CRÉER : CHECKLIST

1. **Ce composant existe-t-il déjà ?**
   Vérifie dans `src/components/ui/` avant de créer.
   Si oui, étends l'existant plutôt que d'en créer un nouveau.

2. **Quel type de composant ?**
   - `ui/` → Composant générique réutilisable (Button, Card, Input...)
   - `layout/` → Composant de mise en page (Header, Footer, Sidebar...)
   - Feature → Composant spécifique à une feature (dans son dossier)

## TEMPLATE DE COMPOSANT

```typescript
'use client' // UNIQUEMENT si useState/useEffect/événements

import React from 'react'
import { cn } from '@/lib/utils'

// 1. Interface des props claire et typée
interface [NomComposant]Props {
  // Props requises d'abord
  children?: React.ReactNode
  // Props optionnelles avec valeurs par défaut
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 2. Export par défaut nommé
export function [NomComposant]({
  children,
  variant = 'default',
  size = 'md',
  className,
}: [NomComposant]Props) {
  return (
    <div
      className={cn(
        // Base styles TOUJOURS avec variables CSS (pas de hardcode)
        'rounded-lg border border-border bg-card text-card-foreground',
        
        // Variants
        {
          'shadow-sm': variant === 'default',
          'border-2': variant === 'outline',
          'border-0 shadow-none': variant === 'ghost',
        },
        
        // Sizes - Touch targets minimum 44px
        {
          'p-3 text-sm min-h-[44px]': size === 'sm',
          'p-4 text-base min-h-[48px]': size === 'md',
          'p-6 text-lg min-h-[56px]': size === 'lg',
        },
        
        // className en dernier (permet l'override)
        className
      )}
    >
      {children}
    </div>
  )
}
```

## RÈGLES DESIGN OBLIGATOIRES

### ✅ TOUJOURS
- Variables CSS pour couleurs : `bg-card`, `text-foreground`, `border-border`
- `cn()` pour les classes conditionnelles
- `className` prop pour permettre l'override
- Dark mode automatique via variables CSS
- Touch target ≥ 44px pour éléments interactifs

### ❌ JAMAIS
- `bg-white` ou `bg-gray-900` sans `dark:` override
- `text-gray-600` sans `dark:text-gray-400`
- Couleur orange hors CTA primaire
- `style={{ color: '#xxx' }}` inline styles pour design
- Taille de bouton < 44px

## EXEMPLE CARD CONFORME

```typescript
// ✅ BON
<div className="rounded-lg border border-border bg-card p-4 shadow-sm">
  <h3 className="text-base font-semibold text-foreground">Titre</h3>
  <p className="text-sm text-muted-foreground">Description</p>
</div>

// ❌ MAUVAIS
<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Titre</h3>
  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
</div>
```
