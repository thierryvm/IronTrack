# 🔧 EXEMPLE D'INTÉGRATION - Nouveaux Composants 2025

> Guide pratique pour remplacer progressivement les composants existants par les nouveaux patterns

---

## 🎯 **MIGRATION PROGRESSIVE - PLAN D'ACTION**

### **Phase 1 : Implémentation Parallèle (Semaine 1)**

Remplacer graduellement les cartes exercices existantes sans casser l'expérience :

```tsx
// src/app/exercises/page.tsx - VERSION HYBRIDE
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ExerciseCard2025 } from '@/components/exercises/ExerciseCard2025'

export default function ExercisesPageNew() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const router = useRouter()

  // Callbacks pour les nouvelles actions hiérarchisées
  const handleAddPerformance = useCallback((exerciseId: number) => {
    router.push(`/exercises/${exerciseId}/add-performance`)
  }, [router])

  const handleViewDetails = useCallback((exerciseId: number) => {
    setSelectedExerciseId(exerciseId.toString())
  }, [])

  const handleEditExercise = useCallback((exerciseId: number) => {
    router.push(`/exercises/${exerciseId}/edit-exercise`)
  }, [router])

  const handleDeleteExercise = useCallback(async (exerciseId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
      
      if (!error) {
        setExercises(prev => prev.filter(ex => ex.id !== exerciseId))
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }, [])

  const handleDuplicateExercise = useCallback(async (exerciseId: number) => {
    try {
      const supabase = createClient()
      const { data: originalExercise } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single()
      
      if (originalExercise) {
        const { data: newExercise } = await supabase
          .from('exercises')
          .insert({
            ...originalExercise,
            id: undefined,
            name: `${originalExercise.name} (Copie)`,
            created_at: undefined
          })
          .select()
          .single()
        
        if (newExercise) {
          setExercises(prev => [newExercise, ...prev])
        }
      }
    } catch (error) {
      console.error('Erreur duplication:', error)
    }
  }, [])

  // Grid responsive avec nouvelles cartes
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header existant conservé */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Mes Exercices</h1>
          <p className="text-orange-100">Nouvelle expérience utilisateur 2025</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NOUVEAU GRID AVEC CARTES 2025 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <ExerciseCard2025
              key={exercise.id}
              exercise={exercise}
              lastPerformance={exercise.lastPerformance}
              onAddPerformance={handleAddPerformance}
              onViewDetails={handleViewDetails}
              onEdit={handleEditExercise}
              onDelete={handleDeleteExercise}
              onDuplicate={handleDuplicateExercise}
              className="transform hover:scale-[1.02] transition-transform duration-200"
              testId={`exercise-card-${exercise.id}`}
            />
          ))}
        </div>
      </div>

      {/* Modal détails existant conservé */}
      {selectedExerciseId && (
        <ExerciseDetailsModal
          exerciseId={selectedExerciseId}
          isOpen={!!selectedExerciseId}
          onClose={() => setSelectedExerciseId(null)}
        />
      )}
    </div>
  )
}
```

---

## 📊 **COMPARAISON AVANT/APRÈS**

### **AVANT - Approche Actuelle**
```tsx
// Actions dispersées et redondantes
<div className="flex space-x-2">
  <button onClick={() => setSelectedExerciseId(exercise.id)} className="flex-1 bg-orange-500">
    <Eye className="h-4 w-4" />
    Détails
  </button>
  <Link href={`/exercises/${exercise.id}/add-performance`} className="flex-1 bg-green-500">
    <Plus className="h-4 w-4" />
    Performance
  </Link>
  <div className="relative group">
    <button className="p-2 text-gray-400">
      <MoreVertical className="h-4 w-4" />
    </button>
    {/* Menu hover problématique */}
    <div className="opacity-0 group-hover:opacity-100">
      <Link href={`/exercises/${exercise.id}/edit-exercise`}>Modifier</Link>
      <button onClick={handleDelete}>Supprimer</button>
    </div>
  </div>
</div>
```

### **APRÈS - Nouvelle Approche 2025**
```tsx
// Actions hiérarchisées avec composant dédié
<ExerciseCard2025
  exercise={exercise}
  lastPerformance={lastPerformance}
  onAddPerformance={handleAddPerformance}      // Action PRIMAIRE (90% usage)
  onViewDetails={handleViewDetails}            // Action SECONDAIRE (15% usage)
  onEdit={handleEditExercise}                  // Action TERTIAIRE (3% usage)
  onDelete={handleDeleteExercise}              // Action TERTIAIRE (2% usage)
  onDuplicate={handleDuplicateExercise}        // Action TERTIAIRE (1% usage)
/>
```

**Avantages immédiats :**
- ✅ **-50% clics** pour ajouter performance (2 → 1 clic)
- ✅ **-40% actions visibles** (5 → 2-3 actions primaires/secondaires)
- ✅ **+100% accessibilité** (navigation clavier + ARIA complet)
- ✅ **Design cohérent** Material Design 3 + IronTrack branding

---

## 🧩 **UTILISATION DES COMPOSANTS UTILITAIRES**

### **1. ActionHierarchy - Actions Standardisées**
```tsx
import { ActionHierarchy, useStandardActions } from '@/components/ui/ActionHierarchy'

function CustomExerciseActions({ exercise }: { exercise: Exercise }) {
  const {
    createAddPerformanceAction,
    createViewDetailsAction,
    createEditAction,
    createDeleteAction
  } = useStandardActions()

  const actions = [
    createAddPerformanceAction(() => router.push(`/exercises/${exercise.id}/add-performance`)),
    createViewDetailsAction(() => setSelectedId(exercise.id)),
    createEditAction(() => router.push(`/exercises/${exercise.id}/edit-exercise`)),
    createDeleteAction(() => handleDelete(exercise.id))
  ]

  return <ActionHierarchy actions={actions} layout="horizontal" />
}
```

### **2. PerformanceDisplay - Métriques Intelligentes**
```tsx
import { PerformanceDisplay } from '@/components/performance/PerformanceDisplay'

function ExercisePerformanceSection({ exercise, lastPerformance }: Props) {
  return (
    <div className="space-y-4">
      {/* Affichage inline pour liste */}
      <PerformanceDisplay
        performance={lastPerformance}
        exerciseType={exercise.exercise_type}
        exerciseName={exercise.name}
        variant="inline"
        maxMetrics={3}
      />
      
      {/* Affichage card pour section dédiée */}
      <PerformanceDisplay
        performance={lastPerformance}
        exerciseType={exercise.exercise_type}
        exerciseName={exercise.name}
        variant="card"
        showDate={true}
        showIcon={true}
      />
      
      {/* Affichage detailed pour modal */}
      <PerformanceDisplay
        performance={lastPerformance}
        exerciseType={exercise.exercise_type}
        exerciseName={exercise.name}
        variant="detailed"
        className="mb-6"
      />
    </div>
  )
}
```

### **3. usePerformanceFormatter - Hook Utilitaire**
```tsx
import { usePerformanceFormatter } from '@/components/performance/PerformanceDisplay'

function QuickPerformanceLabel({ performance, exerciseType, exerciseName }: Props) {
  const { formatQuick } = usePerformanceFormatter()
  
  const formattedText = formatQuick(performance, exerciseType, exerciseName)
  
  return (
    <span className="text-sm font-medium text-gray-700">
      {formattedText}
    </span>
  )
}
```

---

## 🎨 **PERSONNALISATION ET EXTENSIONS**

### **Thème Customisé pour Cartes**
```tsx
// src/styles/exercise-cards.css
.exercise-card-premium {
  @apply bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200;
}

.exercise-card-premium:hover {
  @apply from-orange-100 to-red-100 border-orange-300 shadow-xl;
}

.exercise-card-beginner {
  @apply border-l-4 border-green-500 bg-green-50/30;
}

.exercise-card-advanced {
  @apply border-l-4 border-red-500 bg-red-50/30;
}
```

### **Variantes Contextuelles**
```tsx
function ExerciseGrid({ exercises, context }: { exercises: Exercise[], context: 'homepage' | 'workout' | 'library' }) {
  const getCardVariant = () => {
    switch (context) {
      case 'homepage': return 'compact'
      case 'workout': return 'detailed'
      default: return 'default'
    }
  }

  const getMaxMetrics = () => {
    switch (context) {
      case 'homepage': return 2
      case 'workout': return 4
      default: return 3
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map(exercise => (
        <ExerciseCard2025
          key={exercise.id}
          exercise={exercise}
          variant={getCardVariant()}
          className={`exercise-card-${exercise.difficulty.toLowerCase()}`}
          // Props adaptées selon contexte
        />
      ))}
    </div>
  )
}
```

---

## 🧪 **TESTS D'INTÉGRATION**

### **Test E2E Parcours Utilisateur**
```typescript
// cypress/integration/exercise-refonte.spec.ts
describe('Refonte Exercices 2025', () => {
  beforeEach(() => {
    cy.visit('/exercises')
    cy.login('test@irontrack.com', 'password')
  })

  it('permet ajout performance en 1 clic', () => {
    // NOUVEAU : Action primaire évidente
    cy.get('[data-testid="exercise-card-1"]')
      .find('[data-testid="add-performance-btn"]')
      .should('be.visible')
      .click()
    
    cy.url().should('include', '/exercises/1/add-performance')
    cy.get('[data-testid="performance-form"]').should('be.visible')
  })

  it('navigation menu tertiaire accessible clavier', () => {
    // Test navigation clavier
    cy.get('[data-testid="exercise-card-1"]')
      .find('[data-testid="menu-button"]')
      .focus()
      .type('{enter}')
    
    cy.get('[data-testid="dropdown-menu"]').should('be.visible')
    
    // Navigation avec Tab
    cy.focused().tab().tab() // Modifier → Supprimer
    cy.focused().should('contain', 'Supprimer')
    
    // Test Escape pour fermer
    cy.focused().type('{esc}')
    cy.get('[data-testid="dropdown-menu"]').should('not.exist')
  })

  it('affiche métriques performance contextuelles', () => {
    // Musculation
    cy.get('[data-testid="exercise-card-1"]')
      .should('contain', 'kg')
      .should('contain', 'reps')
    
    // Cardio rameur
    cy.get('[data-testid="exercise-card-2"]')
      .should('contain', 'm') // Distance en mètres
      .should('contain', 'SPM') // Stroke rate
      .should('contain', 'W') // Watts
  })
})
```

### **Test Performance/Accessibilité**
```typescript
// cypress/integration/exercise-a11y.spec.ts
describe('Accessibilité Exercices 2025', () => {
  it('respecte les guidelines WCAG 2.1', () => {
    cy.visit('/exercises')
    cy.injectAxe()
    
    // Audit accessibilité complet
    cy.checkA11y('[data-testid="exercise-card-1"]', {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard': { enabled: true },
        'focus-management': { enabled: true }
      }
    })
  })

  it('navigation clavier complète', () => {
    cy.visit('/exercises')
    
    // Tab navigation
    cy.get('body').tab()
    cy.focused().should('contain', 'Performance') // Action primaire
    
    cy.focused().tab()
    cy.focused().should('contain', 'Détails') // Action secondaire
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'aria-label', 'Plus d\'actions') // Menu tertiaire
  })
})
```

---

## 📈 **MÉTRIQUES ET MONITORING**

### **Analytics Comportementales**
```tsx
// src/utils/exercise-analytics.ts
export function trackExerciseAction(action: 'add_performance' | 'view_details' | 'edit' | 'delete', exerciseId: number) {
  // Google Analytics 4
  gtag('event', 'exercise_action', {
    action_type: action,
    exercise_id: exerciseId,
    design_version: '2025',
    timestamp: Date.now()
  })
  
  // Analytics internes
  if (typeof window !== 'undefined') {
    const analytics = {
      user_id: getCurrentUserId(),
      action,
      exercise_id: exerciseId,
      design_version: '2025',
      session_id: getSessionId()
    }
    
    // Envoi asynchrone
    fetch('/api/analytics/exercise-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analytics)
    }).catch(err => console.warn('Analytics error:', err))
  }
}

// Intégration dans ExerciseCard2025
const handleAddPerformance = (exerciseId: number) => {
  trackExerciseAction('add_performance', exerciseId)
  onAddPerformance(exerciseId)
}
```

### **Performance Monitoring**
```tsx
// src/components/exercises/ExerciseCard2025.tsx
import { useEffect } from 'react'

export function ExerciseCard2025(props: ExerciseCard2025Props) {
  useEffect(() => {
    // Core Web Vitals tracking
    if ('web-vitals' in window) {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = window['web-vitals']
      
      getCLS(console.log)
      getFID(console.log) 
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    }
  }, [])

  // Component render time tracking
  const renderStart = performance.now()
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart
    if (renderTime > 16) { // >16ms = potentiel problème 60fps
      console.warn(`ExerciseCard2025 slow render: ${renderTime}ms`)
    }
  })

  // ... rest of component
}
```

---

## 🚀 **PLAN DE DÉPLOIEMENT PROGRESSIF**

### **Étape 1 : Tests A/B (Semaine 1-2)**
```tsx
// Feature flag pour comparaison
const useNewExerciseDesign = useFeatureFlag('exercise-design-2025')

return useNewExerciseDesign ? (
  <ExerciseCard2025 {...props} />
) : (
  <ExerciseCardLegacy {...props} />
)
```

### **Étape 2 : Rollout Graduel (Semaine 3-4)**
- **25% utilisateurs** → Nouveau design
- **Monitoring** métriques engagement/performance
- **Feedback** collecte via modal in-app
- **Rollback plan** si métriques dégradées

### **Étape 3 : Migration Complète (Semaine 5)**
- **100% utilisateurs** → Nouveau design
- **Suppression** ancien code + feature flags
- **Documentation** mise à jour
- **Formation** équipe sur nouveaux patterns

---

## ✅ **CHECKLIST DE VALIDATION**

### **Avant Déploiement**
- [ ] ✅ Tests unitaires >95% couverture
- [ ] ✅ Tests E2E parcours critiques validés
- [ ] ✅ Audit accessibilité WCAG 2.1 AA passé
- [ ] ✅ Performance Lighthouse >95 points
- [ ] ✅ Bundle size optimisé (<200kB vs 247kB actuel)
- [ ] ✅ Responsive testé iOS/Android/Desktop
- [ ] ✅ Analytics tracking opérationnel

### **Après Déploiement**
- [ ] ✅ Monitoring métriques engagement temps réel
- [ ] ✅ Collecte feedback utilisateurs active
- [ ] ✅ Performance Core Web Vitals surveillée
- [ ] ✅ Taux d'erreur JavaScript sous surveillance
- [ ] ✅ Plan rollback documenté et testé

---

> **🎯 RÉSULTAT ATTENDU** : Réduction significative de la friction utilisateur, amélioration de l'engagement et positionnement d'IronTrack comme référence UX dans le domaine des fitness apps.