# IronTrack - Spécifications Techniques Optimisées

## Restructuration du Système d'Exercices

### Problèmes Identifiés
1. **Architecture complexe** - Réutilisation forcée de composants création pour édition
2. **Navigation confuse** - Deux systèmes d'édition différents
3. **Modal surchargée** - Même modal pour création et consultation
4. **Erreurs SSR** - localStorage accessible côté serveur

### Solutions Implémentées

#### 1. Séparation des Responsabilités
- **ExerciseWizard** : Uniquement pour création d'exercices
- **ExerciseEditForm** : Uniquement pour édition simple
- **ExerciseDetailsModal** : Uniquement pour consultation/gestion performances
- **PerformanceEditForm** : Uniquement pour édition performances individuelles

#### 2. Navigation Unifiée
- Suppression de `ExerciseEditWizard` 
- Suppression route `/exercises/[id]/edit`
- Unification sur `/exercises/[id]/edit-exercise`

#### 3. Corrections Techniques
- Fix SSR dans `useAnalytics` avec vérifications client-side
- Ajout champs cardio dans schema `performance_logs`
- Amélioration styling modals (backdrop-blur)

### Architecture Finale
```
src/components/exercises/
├── ExerciseWizard/ (création uniquement)
├── ExerciseDetailsModal.tsx (consultation uniquement)
├── ExerciseEditForm.tsx (édition uniquement)
└── PerformanceEditForm.tsx (édition perf uniquement)
```

### Sécurité
- Fichiers sensibles ajoutés au .gitignore
- Composants admin/dev exclus du build production
- Migrations SQL non committées (contiennent schema sensible)