# Stratégie de Consolidation des Doublons d'Exercices - IronTrack

## 🔍 Problème Identifié

**Symptôme** : Fragmentation des statistiques de progression due à des exercices dupliqués avec des IDs différents mais des noms identiques.

**Impact** :
- Les graphiques de progression montrent des données incomplètes
- Les statistiques "meilleure performance" sont faussées
- L'expérience utilisateur est dégradée dans les pages de progression
- Les recommandations d'exercices peuvent être inexactes

## 📊 Analyse des Composants Affectés

### Composants Critiques Identifiés

1. **`/src/app/progress/page.tsx`** (Lignes 542-593)
   - Récupère les performances par `exercise_id`
   - Fragmentation visible dans `exerciseMap[log.exercise_id]`
   - Impact direct sur les calculs de progression

2. **`/src/app/page.tsx`** (Lignes 184-330)
   - Section "Exercices récents" affiche des doublons
   - Logique de récupération par `exercise_id`
   - Impact sur l'affichage des dernières performances

3. **Hooks potentiellement affectés** :
   - `useProgressionStats.ts`
   - `useBadges.ts` (pour les objectifs de progression)

## 🛠️ Solution Proposée : Consolidation Intelligente

### Phase 1 : Analyse et Préparation

#### 1.1 Script de Diagnostic Complet
```sql
-- Identifier tous les doublons avec impact
WITH exercise_duplicates AS (
  SELECT 
    LOWER(TRIM(name)) as normalized_name,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at) as all_ids,
    ARRAY_AGG(name ORDER BY created_at) as all_names,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
  FROM exercises 
  GROUP BY LOWER(TRIM(name))
  HAVING COUNT(*) > 1
),
performance_impact AS (
  SELECT 
    ed.normalized_name,
    ed.duplicate_count,
    ed.all_ids,
    COUNT(pl.id) as total_performances,
    COUNT(DISTINCT pl.user_id) as affected_users,
    STRING_AGG(DISTINCT pl.user_id::text, ', ') as user_list
  FROM exercise_duplicates ed
  JOIN exercises e ON e.id = ANY(ed.all_ids)
  LEFT JOIN performance_logs pl ON pl.exercise_id = e.id
  GROUP BY ed.normalized_name, ed.duplicate_count, ed.all_ids
)
SELECT * FROM performance_impact ORDER BY total_performances DESC;
```

#### 1.2 Backup de Sécurité
```sql
-- Créer une table de sauvegarde avant migration
CREATE TABLE exercises_backup AS SELECT * FROM exercises;
CREATE TABLE performance_logs_backup AS SELECT * FROM performance_logs;
```

### Phase 2 : Stratégie de Consolidation

#### 2.1 Algorithme de Sélection du "Master"
**Critères de priorité** (dans l'ordre) :
1. **Exercice le plus récent** (`MAX(created_at)`)
2. **Plus grand nombre de performances** associées
3. **Exercice avec le plus de détails** (description, image, etc.)
4. **ID le plus élevé** (comme tie-breaker final)

#### 2.2 Fonction de Consolidation
```sql
CREATE OR REPLACE FUNCTION consolidate_exercise_duplicates()
RETURNS TABLE (
  consolidated_count INTEGER,
  migrated_performances INTEGER,
  report TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  duplicate_group RECORD;
  master_exercise_id INTEGER;
  migration_count INTEGER := 0;
  total_consolidated INTEGER := 0;
  performance_count INTEGER;
BEGIN
  -- Pour chaque groupe de doublons
  FOR duplicate_group IN 
    SELECT 
      LOWER(TRIM(name)) as normalized_name,
      ARRAY_AGG(id ORDER BY created_at DESC) as exercise_ids,
      COUNT(*) as duplicate_count
    FROM exercises 
    GROUP BY LOWER(TRIM(name))
    HAVING COUNT(*) > 1
  LOOP
    -- Sélectionner le master (le plus récent)
    master_exercise_id := duplicate_group.exercise_ids[1];
    
    -- Compter les performances à migrer
    SELECT COUNT(*) INTO performance_count
    FROM performance_logs 
    WHERE exercise_id = ANY(duplicate_group.exercise_ids[2:]);
    
    -- Migrer toutes les performances vers le master
    UPDATE performance_logs 
    SET exercise_id = master_exercise_id,
        updated_at = NOW()
    WHERE exercise_id = ANY(duplicate_group.exercise_ids[2:]);
    
    -- Migrer les références dans les autres tables
    UPDATE training_goals 
    SET exercise_id = master_exercise_id 
    WHERE exercise_id = ANY(duplicate_group.exercise_ids[2:]);
    
    UPDATE workout_exercises 
    SET exercise_id = master_exercise_id 
    WHERE exercise_id = ANY(duplicate_group.exercise_ids[2:]);
    
    -- Supprimer les exercices dupliqués (garder seulement le master)
    DELETE FROM exercises 
    WHERE id = ANY(duplicate_group.exercise_ids[2:]);
    
    total_consolidated := total_consolidated + (duplicate_group.duplicate_count - 1);
    migration_count := migration_count + performance_count;
  END LOOP;
  
  RETURN QUERY SELECT 
    total_consolidated,
    migration_count,
    FORMAT('Consolidés: %s exercices, Performances migrées: %s', 
           total_consolidated, migration_count);
END;
$$;
```

### Phase 3 : Système de Regroupement par Nom

#### 3.1 Vue de Consolidation Virtuelle
```sql
-- Vue qui regroupe automatiquement les performances par nom d'exercice
CREATE OR REPLACE VIEW consolidated_performance_stats AS
SELECT 
  LOWER(TRIM(e.name)) as exercise_name_normalized,
  e.name as display_name,
  e.type,
  e.muscle_group_id,
  COUNT(pl.id) as total_performances,
  COUNT(DISTINCT pl.user_id) as unique_users,
  MAX(pl.weight) as max_weight,
  MAX(pl.distance) as max_distance,
  MAX(pl.duration) as max_duration,
  AVG(pl.weight) FILTER (WHERE pl.weight > 0) as avg_weight,
  MIN(pl.performed_at) as first_performance,
  MAX(pl.performed_at) as last_performance
FROM exercises e
LEFT JOIN performance_logs pl ON e.id = pl.exercise_id
GROUP BY LOWER(TRIM(e.name)), e.name, e.type, e.muscle_group_id;
```

#### 3.2 Fonction de Récupération Consolidée
```sql
-- Fonction pour récupérer les progressions consolidées par nom
CREATE OR REPLACE FUNCTION get_consolidated_progression(p_user_id UUID, p_exercise_name TEXT)
RETURNS TABLE (
  exercise_name TEXT,
  performance_date TIMESTAMP,
  weight DECIMAL,
  reps INTEGER,
  distance DECIMAL,
  duration INTEGER,
  exercise_type TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.name::TEXT,
    pl.performed_at,
    pl.weight,
    pl.reps,
    pl.distance,
    pl.duration,
    e.type::TEXT
  FROM exercises e
  JOIN performance_logs pl ON e.id = pl.exercise_id
  WHERE pl.user_id = p_user_id
    AND LOWER(TRIM(e.name)) = LOWER(TRIM(p_exercise_name))
  ORDER BY pl.performed_at ASC;
END;
$$;
```

### Phase 4 : Mise à Jour des Composants Frontend

#### 4.1 Hook de Consolidation
```typescript
// /src/hooks/useConsolidatedProgression.ts
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ConsolidatedPerformance {
  exercise_name: string;
  performance_date: string;
  weight?: number;
  reps?: number;
  distance?: number;
  duration?: number;
  exercise_type: 'Musculation' | 'Cardio';
}

export function useConsolidatedProgression(userId: string) {
  const [progressions, setProgressions] = useState<Record<string, ConsolidatedPerformance[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConsolidatedData() {
      const supabase = createClient();
      
      // Utiliser la vue consolidée au lieu de requêtes par exercise_id
      const { data: consolidatedStats } = await supabase
        .from('consolidated_performance_stats')
        .select('*')
        .gt('total_performances', 0);

      if (consolidatedStats) {
        const progressionMap: Record<string, ConsolidatedPerformance[]> = {};
        
        // Pour chaque exercice consolidé, récupérer ses performances
        for (const stat of consolidatedStats) {
          const { data: performances } = await supabase
            .rpc('get_consolidated_progression', {
              p_user_id: userId,
              p_exercise_name: stat.display_name
            });
          
          if (performances && performances.length > 0) {
            progressionMap[stat.exercise_name_normalized] = performances;
          }
        }
        
        setProgressions(progressionMap);
      }
      
      setLoading(false);
    }

    if (userId) {
      loadConsolidatedData();
    }
  }, [userId]);

  return { progressions, loading };
}
```

#### 4.2 Mise à Jour du Composant Progress
```typescript
// Modification dans /src/app/progress/page.tsx
// Remplacer la logique actuelle lignes 542-593

const loadProgressData = async () => {
  setLoading(true);
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // ✅ Nouvelle approche : utiliser la consolidation par nom
    const { data: consolidatedData } = await supabase
      .from('consolidated_performance_stats')
      .select('*')
      .gt('total_performances', 0);

    if (!consolidatedData) return;

    const exerciseProgress: ExerciseProgress[] = [];
    
    for (const exercise of consolidatedData) {
      // Récupérer toutes les performances pour cet exercice (par nom, pas par ID)
      const { data: performances } = await supabase
        .rpc('get_consolidated_progression', {
          p_user_id: user.id,
          p_exercise_name: exercise.display_name
        });

      if (performances && performances.length > 1) {
        // Calculer la progression avec toutes les données consolidées
        const firstPerf = performances[0];
        const lastPerf = performances[performances.length - 1];
        
        let improvement = 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (exercise.type === 'Musculation' && firstPerf.weight && lastPerf.weight) {
          improvement = ((lastPerf.weight - firstPerf.weight) / firstPerf.weight) * 100;
          trend = lastPerf.weight > firstPerf.weight ? 'up' : 
                 lastPerf.weight < firstPerf.weight ? 'down' : 'stable';
        }
        // Logique similaire pour cardio...
        
        exerciseProgress.push({
          exercise: exercise.display_name,
          muscle_group: exercise.muscle_group?.name || 'Autre',
          exercise_type: exercise.type,
          improvement: Math.round(improvement * 10) / 10,
          trend,
          // ... autres propriétés
        });
      }
    }
    
    setExerciseProgress(exerciseProgress);
    setLoading(false);
  } catch (error) {
    console.error('Erreur consolidation:', error);
    setLoading(false);
  }
};
```

### Phase 5 : Prévention Future

#### 5.1 Fonction de Déduplication à l'Insertion
```sql
-- Trigger pour empêcher la création de doublons
CREATE OR REPLACE FUNCTION prevent_exercise_duplicates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  existing_id INTEGER;
BEGIN
  -- Vérifier si un exercice avec le même nom existe déjà pour cet utilisateur
  SELECT id INTO existing_id 
  FROM exercises 
  WHERE user_id = NEW.user_id 
    AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.name))
    AND id != COALESCE(NEW.id, 0);
  
  IF existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Un exercice avec le nom "%" existe déjà (ID: %)', NEW.name, existing_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER exercise_duplicate_prevention
  BEFORE INSERT OR UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION prevent_exercise_duplicates();
```

#### 5.2 Interface de Suggestion d'Exercices Existants
```typescript
// Dans le composant ExerciseWizard
const checkForSimilarExercises = async (exerciseName: string) => {
  const supabase = createClient();
  
  const { data: similarExercises } = await supabase
    .from('exercises')
    .select('id, name, type, muscle_group_id')
    .ilike('name', `%${exerciseName}%`)
    .eq('user_id', user.id)
    .limit(5);
  
  if (similarExercises && similarExercises.length > 0) {
    // Afficher modal de suggestion : "Des exercices similaires existent"
    setSimilarExercises(similarExercises);
    setShowSimilarModal(true);
  }
};
```

## 🧪 Plan de Test

### Test 1 : Vérification de l'Intégrité
```sql
-- Vérifier qu'aucune performance n'est orpheline après migration
SELECT COUNT(*) as orphaned_performances
FROM performance_logs pl 
LEFT JOIN exercises e ON pl.exercise_id = e.id 
WHERE e.id IS NULL;
```

### Test 2 : Validation des Progressions
```typescript
// Test avant/après sur les statistiques de progression
const validateProgressionIntegrity = async () => {
  // Comparer les totaux avant/après consolidation
  const beforeStats = await getProgressionStats(); // Version fragmentée
  const afterStats = await getConsolidatedProgressionStats(); // Version consolidée
  
  // Les totaux doivent être identiques ou supérieurs après consolidation
  expect(afterStats.totalPerformances).toBeGreaterThanOrEqual(beforeStats.totalPerformances);
};
```

## 📋 Checklist d'Exécution

- [ ] **Phase 1** : Backup complet de la base de données
- [ ] **Phase 2** : Exécution du script de diagnostic
- [ ] **Phase 3** : Validation manuelle des doublons identifiés
- [ ] **Phase 4** : Exécution de la consolidation sur environnement de test
- [ ] **Phase 5** : Validation des résultats (tests d'intégrité)
- [ ] **Phase 6** : Mise à jour des composants frontend
- [ ] **Phase 7** : Tests complets de l'interface utilisateur
- [ ] **Phase 8** : Déploiement en production
- [ ] **Phase 9** : Monitoring post-déploiement
- [ ] **Phase 10** : Activation des mesures préventives

## 🎯 Résultats Attendus

- **Performance** : Amélioration des temps de chargement des pages de progression
- **UX** : Statistiques cohérentes et complètes pour tous les exercices
- **Données** : Élimination de la fragmentation, vues consolidées
- **Maintenance** : Prévention automatique des futurs doublons
- **Robustesse** : Base de données plus propre et logique métier simplifiée

## ⚠️ Risques et Mitigation

**Risque** : Perte de données lors de la consolidation
**Mitigation** : Backup complet + tests en environnement isolé

**Risque** : Références cassées dans l'application
**Mitigation** : Mise à jour de toutes les tables liées + tests complets

**Risque** : Interruption de service
**Mitigation** : Migration en plusieurs étapes + rollback possible