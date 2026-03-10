# 🚀 Guide Contribution Pratique - IronTrack

**Manuel Opérationnel pour Développeurs**  
**Version**: 1.0.0  
**Public**: Développeurs junior/senior, contributeurs externes  
**Temps de lecture**: 15 minutes  

---

## 🎯 Quick Start (5 minutes)

### ✅ Checklist Setup Rapide

1. **Clone & Install** (2 min)
   ```bash
   git clone https://github.com/thierryvm/IronTrack.git
   cd irontrack
   npm install
   ```

2. **Test Environnement** (2 min)
   ```bash
   npm run build        # ✅ Build réussi
   npm test            # ✅ Tests passants
   npm run test:contrast # ✅ Contraste conforme
   ```

3. **Premier Démarrage** (1 min)
   ```bash
   npm run dev         # http://localhost:3000
   ```

**🎉 Si tout passe → Vous êtes prêt à contribuer !**

## 🧩 Patterns de Code IronTrack

### 1. 🎨 Composant UI Standard

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "btn-safe-primary",    // ✅ Classe sécurisée
        destructive: "btn-safe-error",
        outline: "btn-safe-outline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 2. 🧪 Test Unitaire Obligatoire

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '../Button'

expect.extend(toHaveNoViolations)

describe('Button', () => {
  it('devrait rendre avec le texte correct', () => {
    render(<Button>Cliquez-moi</Button>)
    expect(screen.getByText('Cliquez-moi')).toBeInTheDocument()
  })

  it('devrait appeler onClick lors du clic', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Action</Button>)
    fireEvent.click(screen.getByText('Action'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('devrait être accessible (axe-core)', async () => {
    const { container } = render(<Button>Accessible</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('devrait supporter la navigation clavier', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clavier</Button>)
    const button = screen.getByText('Clavier')
    
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('devrait utiliser des classes sécurisées', () => {
    const { container } = render(<Button variant="default">Test</Button>)
    const button = container.firstChild as HTMLElement
    expect(button.className).toContain('btn-safe-primary')
  })
})
```

### 3. 🛡️ API Route Sécurisée

```typescript
// src/app/api/exercises/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/utils/rateLimiting'
import { z } from 'zod'

// Validation Zod
const exerciseSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['Musculation', 'Cardio']),
  muscle_group_id: z.number().int().positive()
})

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = checkRateLimit(ip, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    identifier: 'exercises-read'
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      { 
        status: 429,
        headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '900' }
      }
    )
  }

  try {
    const supabase = createServerComponentClient({ cookies })

    // Vérification authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Requête avec RLS automatique
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select(`
        id,
        name,
        type,
        muscle_groups:muscle_group_id (
          id,
          name
        )
      `)
      .order('name')

    if (error) throw error

    return NextResponse.json({ exercises })

  } catch (error) {
    console.error('[API] Erreur récupération exercices:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting plus strict pour écriture
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = checkRateLimit(ip, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,  // Plus restrictif
    identifier: 'exercises-write'
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Limite de création atteinte' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    
    // Validation stricte
    const validation = exerciseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validation.error.format()
        },
        { status: 400 }
      )
    }

    const supabase = createServerComponentClient({ cookies })

    // Auth + vérification rôle
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Insertion avec RLS
    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert(validation.data)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ exercise }, { status: 201 })

  } catch (error) {
    console.error('[API] Erreur création exercice:', error)
    return NextResponse.json(
      { error: 'Impossible de créer l\'exercice' },
      { status: 500 }
    )
  }
}
```

### 4. 🎣 Hook Personnalisé

```typescript
// src/hooks/useWorkouts.ts
import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import type { Workout } from '@/types'

interface UseWorkoutsReturn {
  workouts: Workout[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createWorkout: (data: Partial<Workout>) => Promise<Workout>
}

export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { supabase, user } = useSupabase()

  const fetchWorkouts = async () => {
    if (!user) {
      setError('Utilisateur non authentifié')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('workouts')
        .select(`
          id,
          name,
          date,
          notes,
          user_id,
          workout_exercises (
            id,
            exercise:exercises (
              id,
              name,
              type
            )
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError
      setWorkouts(data || [])

    } catch (err) {
      console.error('[Hook] Erreur fetch workouts:', err)
      setError('Impossible de charger les entraînements')
    } finally {
      setLoading(false)
    }
  }

  const createWorkout = async (workoutData: Partial<Workout>): Promise<Workout> => {
    if (!user) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('workouts')
      .insert({
        ...workoutData,
        user_id: user.id,
        date: workoutData.date || new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Actualiser la liste
    await refetch()
    return data
  }

  const refetch = async () => {
    setLoading(true)
    await fetchWorkouts()
  }

  useEffect(() => {
    fetchWorkouts()
  }, [user?.id])

  return {
    workouts,
    loading,
    error,
    refetch,
    createWorkout
  }
}
```

### 5. 🧪 Test du Hook

```typescript
// src/hooks/__tests__/useWorkouts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useWorkouts } from '../useWorkouts'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

// Mock Supabase
jest.mock('../useSupabase', () => ({
  useSupabase: () => ({
    supabase: createMockSupabaseClient(),
    user: { id: 'user-123', email: 'test@example.com' }
  })
}))

describe('useWorkouts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('devrait charger les workouts au mount', async () => {
    const mockWorkouts = [
      { id: 1, name: 'Push Day', date: '2025-08-06', user_id: 'user-123' }
    ]

    const mockSupabase = createMockSupabaseClient()
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockWorkouts,
            error: null
          })
        })
      })
    })

    const { result } = renderHook(() => useWorkouts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.workouts).toEqual(mockWorkouts)
    expect(result.current.error).toBe(null)
  })

  it('devrait gérer les erreurs de chargement', async () => {
    const mockSupabase = createMockSupabaseClient()
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Erreur réseau' }
          })
        })
      })
    })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Impossible de charger les entraînements')
    expect(result.current.workouts).toEqual([])
  })
})
```

## 🎯 Processus Contribution Step-by-Step

### 🚀 Étape 1: Préparation (5 min)

```bash
# 1. Créer la branche
git checkout -b feature/nom-descriptif

# 2. Vérifier l'état initial
npm test                  # Tous verts ✅
npm run test:contrast    # Conforme ✅
npm run lint            # Clean ✅

# 3. Développement ready !
```

### ✏️ Étape 2: Développement TDD (30-60 min)

```bash
# Pattern TDD IronTrack:
# 1. Écrire le test (fail rouge ❌)
# 2. Écrire le minimum de code (pass vert ✅)
# 3. Refactorer (optimiser 🔄)

# Mode watch pour feedback immédiat
npm run test:watch
```

**Exemple concret** - Créer `formatDuration()`

1. **Test d'abord** (2 min):
   ```typescript
   // src/utils/__tests__/formatDuration.test.ts
   import { formatDuration } from '../formatDuration'

   describe('formatDuration', () => {
     it('devrait formater les secondes en mm:ss', () => {
       expect(formatDuration(125)).toBe('2:05')
       expect(formatDuration(59)).toBe('0:59')
       expect(formatDuration(3661)).toBe('61:01')
     })
   })
   ```

2. **Code minimum** (3 min):
   ```typescript
   // src/utils/formatDuration.ts
   export function formatDuration(seconds: number): string {
     const minutes = Math.floor(seconds / 60)
     const remainingSeconds = seconds % 60
     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
   }
   ```

3. **Refactorer** (2 min):
   ```typescript
   /**
    * Formate une durée en secondes au format mm:ss
    * @param seconds - Durée en secondes (doit être ≥ 0)
    * @returns Durée formatée (ex: "2:05", "10:00")
    * @example
    * formatDuration(125) // "2:05"
    * formatDuration(3600) // "60:00"
    */
   export function formatDuration(seconds: number): string {
     if (seconds < 0) throw new Error('Durée négative non supportée')
     
     const minutes = Math.floor(seconds / 60)
     const remainingSeconds = seconds % 60
     
     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
   }
   ```

### 🧪 Étape 3: Validation Complète (5 min)

```bash
# Suite complète de tests
npm test                    # ✅ Tests unitaires
npm run test:coverage      # ✅ Coverage > 80%
npm run test:contrast      # ✅ Contraste WCAG 2.1 AA
npm run lint              # ✅ ESLint + Prettier
npm run build             # ✅ Build production

# Si tout passe → prêt pour commit !
```

### 📤 Étape 4: Commit & Push (3 min)

```bash
# Staging spécifique (jamais git add .)
git add src/utils/formatDuration.ts
git add src/utils/__tests__/formatDuration.test.ts

# Commit conventionnel
git commit -m "feat(utils): ajout formatDuration avec tests complets

- Fonction formatDuration() pour durée mm:ss
- Validation entrées (no négatives)
- Tests 4/4 passants (100% coverage)
- Documentation JSDoc complète

🧪 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/nom-descriptif
```

### 🔍 Étape 5: Pull Request (2 min)

Le **CI/CD automatique** valide :
- ✅ Tests unitaires (30+ passants)
- ✅ Contraste WCAG 2.1 AA (598 vérifications)
- ✅ Accessibilité axe-core
- ✅ Build production
- ✅ ESLint + TypeScript

**Template PR automatique** :

```markdown
## 🚀 Feature: Format Duration Utility

### 📋 Résumé
Ajout de la fonction `formatDuration()` pour convertir les secondes au format mm:ss.

### ✅ Tests & Validation
- [x] Tests unitaires: 4/4 ✅ 
- [x] Coverage: 100% ✅
- [x] Contraste: Conforme WCAG 2.1 AA ✅
- [x] Build: Réussi ✅
- [x] Documentation: JSDoc complète ✅

### 🎯 Usage
```typescript
import { formatDuration } from '@/utils/formatDuration'

const time = formatDuration(125) // "2:05"
```

### 🧪 CI/CD Status
Tous les checks passent automatiquement ✅
```

## 🚨 Erreurs Fréquentes & Solutions

### ❌ "Tests échouent"
```bash
# Diagnostic
npm test -- --verbose

# Causes communes:
# 1. Mock manquant → Ajouter jest.mock()
# 2. Async mal géré → Utiliser waitFor()
# 3. DOM cleanup → Ajouter afterEach cleanup
```

### ❌ "Contraste non-conforme"
```bash
# Auto-fix rapide
npm run fix:contrast

# Vérifie les corrections
npm run test:contrast

# Causes: text-gray-400, text-blue-500, etc.
# Solution: text-safe-primary, text-safe-error, etc.
```

### ❌ "Build échouant"
```bash
# TypeScript strict
npm run lint

# Causes: any, implicit returns, unused vars
# Solution: Typer strictement, nettoyer
```

### ❌ "Coverage insuffisant"
```bash
# Identifier les gaps
npm run test:coverage

# Manque souvent:
# - Error paths (catch blocks)
# - Edge cases (empty arrays, null values)  
# - Conditional branches (if/else tous couverts)
```

## 🎯 Checklist de Contribution Parfaite

### ✅ Before Code
- [ ] Branch créée depuis `main` à jour
- [ ] Tests existants passent
- [ ] Environnement clean

### ✅ During Code  
- [ ] TDD: Test → Code → Refactor
- [ ] TypeScript strict (pas de `any`)
- [ ] Classes contraste sécurisées uniquement
- [ ] JSDoc sur fonctions publiques

### ✅ Before Commit
- [ ] `npm test` → 100% passant
- [ ] `npm run test:coverage` → > 80%
- [ ] `npm run test:contrast` → Conforme
- [ ] `npm run lint` → Clean
- [ ] `npm run build` → Succès

### ✅ Commit Quality
- [ ] Message conventionnel (feat/fix/docs/...)
- [ ] Description claire et complète
- [ ] Fichiers staged spécifiquement (pas de `git add .`)
- [ ] Co-authored by Claude si applicable

### ✅ PR Ready
- [ ] CI/CD tout vert ✅
- [ ] Description PR complète
- [ ] Captures d'écran si UI
- [ ] Breaking changes documentés

## 📚 Ressources Utiles

### 🔗 Links Rapides
- **Tests**: [Jest docs](https://jestjs.io/docs/getting-started)
- **Accessibilité**: [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- **Contraste**: [WCAG success criteria](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- **TypeScript**: [Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### 🛠️ Outils Recommandés
- **VS Code Extensions**: ESLint, Prettier, Jest Runner
- **Browser**: React DevTools, axe DevTools
- **CLI**: GitHub CLI (`gh pr create`)

### 🆘 Aide & Support
- **Documentation**: `docs/` directory
- **Guidelines**: [GUIDELINES_EQUIPE_2025.md](GUIDELINES_EQUIPE_2025.md)  
- **Architecture**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Sécurité**: [SECURITE_IRONTRACK.md](SECURITE_IRONTRACK.md)

---

## 🎉 Conclusion

**Avec ce guide, vous maîtrisez le workflow IronTrack :**

✅ **Setup en 5 minutes**  
✅ **Développement TDD efficace**  
✅ **Validation automatisée complète**  
✅ **CI/CD zero-friction**  
✅ **Standards production garantis**

**Happy coding avec IronTrack ! 🚀**

---
*Guide maintenu par l'équipe technique - Dernière MàJ: 2025-08-06*