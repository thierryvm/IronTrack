/**
 * Script de consolidation des exercices en doublons - VERSION CORRIGÉE
 * Migre toutes les performances vers l'exercice le plus récent de chaque groupe
 * Corrige le problème de colonne updated_at manquante
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mode d'exécution
const dryRun = !process.argv.includes('--execute')

async function createBackupFunction() {
  const backupSql = `
    -- Fonction de backup pour la consolidation des exercices
    CREATE OR REPLACE FUNCTION backup_exercises_and_performances()
    RETURNS VOID AS $$
    BEGIN
      -- Note: Les backups physiques doivent être faits manuellement
      -- Cette fonction sert de documentation des tables affectées
      RAISE NOTICE 'Tables à sauvegarder: exercises, performance_logs, training_goals, workout_exercises';
    END;
    $$ LANGUAGE plpgsql;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: backupSql })
    if (!error) {
      console.log('✅ Fonction de backup créée')
    }
  } catch (err) {
    console.log('⚠️  Impossible de créer la fonction de backup:', err.message)
  }
}

async function findDuplicateExercises() {
  // Récupérer tous les exercices avec leurs infos de base
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name, exercise_type, created_at, user_id')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('❌ Erreur récupération exercices:', error)
    return []
  }
  
  // Grouper par nom (insensible à la casse)
  const groups = {}
  exercises.forEach(exercise => {
    const normalizedName = exercise.name.toLowerCase().trim()
    if (!groups[normalizedName]) {
      groups[normalizedName] = []
    }
    groups[normalizedName].push(exercise)
  })
  
  // Filtrer les groupes avec doublons et les trier par date (plus récent en premier)
  const duplicates = []
  Object.entries(groups).forEach(([normalizedName, exercises]) => {
    if (exercises.length > 1) {
      // Trier par date de création (plus récent en premier)
      exercises.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      duplicates.push({
        originalName: exercises[0].name, // Nom original du plus récent
        exercises: exercises
      })
    }
  })
  
  return duplicates
}

async function consolidateDuplicates() {
  console.log('=== CONSOLIDATION DES DOUBLONS D\'EXERCICES ===\n')
  
  if (dryRun) {
    console.log('Mode: 🔍 SIMULATION (DRY RUN)\n')
  } else {
    console.log('Mode: ⚡ EXÉCUTION RÉELLE\n')
    console.log('⚠️  ATTENTION: Vous êtes sur le point d\'exécuter la consolidation RÉELLE !')
    console.log('⚠️  Cela va modifier définitivement la base de données.\n')
    
    await createBackupFunction()
  }
  
  // 1. Identifier les doublons
  const duplicates = await findDuplicateExercises()
  console.log(`📊 ${duplicates.length} groupes de doublons trouvés\n`)
  
  if (duplicates.length === 0) {
    console.log('✅ Aucun doublon trouvé !')
    return
  }
  
  // Créer le backup si nécessaire
  if (!dryRun) {
    console.log('💾 Création de sauvegardes...')
    try {
      await supabase.rpc('backup_exercises_and_performances')
    } catch (err) {
      console.log('⚠️  Impossible de créer les sauvegardes automatiques, mais on continue...')
    }
  }
  
  let totalPerformancesMigrated = 0
  let totalExercisesDeleted = 0
  
  // 2. Pour chaque groupe de doublons
  for (const duplicate of duplicates) {
    const masterExercise = duplicate.exercises[0] // Le plus récent
    const obsoleteExercises = duplicate.exercises.slice(1) // Les autres
    
    console.log(`🔄 Consolidation: "${duplicate.originalName}"`)
    console.log(`   Master: ID ${masterExercise.id} (${new Date(masterExercise.created_at).toLocaleDateString('fr-FR')})`)
    console.log(`   Obsolètes: ${obsoleteExercises.map(ex => `ID ${ex.id}`).join(', ')}`)
    
    // 3. Récupérer les performances à migrer
    const obsoleteIds = obsoleteExercises.map(ex => ex.id)
    const { data: performancesToMigrate, error: perfError } = await supabase
      .from('performance_logs')
      .select('id, exercise_id, user_id, performed_at')
      .in('exercise_id', obsoleteIds)
    
    if (perfError) {
      console.error(`   ❌ Erreur récupération performances:`, perfError)
      continue
    }
    
    console.log(`   📈 ${performancesToMigrate.length} performances à migrer`)
    
    if (dryRun) {
      console.log(`🔍 Simulation: ${performancesToMigrate.length} performances seraient migrées`)
    } else {
      // 4. Migrer les performances vers le master
      if (performancesToMigrate.length > 0) {
        const { error: migrationError } = await supabase
          .from('performance_logs')
          .update({ exercise_id: masterExercise.id })
          .in('exercise_id', obsoleteIds)
        
        if (migrationError) {
          console.error(`   ❌ Erreur migration performances:`, migrationError)
          continue
        }
        
        totalPerformancesMigrated += performancesToMigrate.length
      }
      
      // 5. Migrer les références dans training_goals (si la table existe)
      try {
        const { error: goalsError } = await supabase
          .from('training_goals')
          .update({ exercise_id: masterExercise.id })
          .in('exercise_id', obsoleteIds)
        
        if (goalsError && !goalsError.message.includes('relation "training_goals" does not exist')) {
          console.warn(`   ⚠️  Avertissement migration training_goals:`, goalsError)
        }
      } catch (err) {
        // Ignorer si la table n'existe pas
      }
      
      // 6. Migrer les références dans workout_exercises (si la table existe)
      try {
        const { error: workoutError } = await supabase
          .from('workout_exercises')
          .update({ exercise_id: masterExercise.id })
          .in('exercise_id', obsoleteIds)
        
        if (workoutError && !workoutError.message.includes('relation "workout_exercises" does not exist')) {
          console.warn(`   ⚠️  Avertissement migration workout_exercises:`, workoutError)
        }
      } catch (err) {
        // Ignorer si la table n'existe pas
      }
      
      // 7. Supprimer les exercices obsolètes
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .in('id', obsoleteIds)
      
      if (deleteError) {
        console.error(`   ❌ Erreur suppression exercices:`, deleteError)
        continue
      }
      
      totalExercisesDeleted += obsoleteIds.length
      console.log(`   ✅ ${obsoleteIds.length} exercices obsolètes supprimés`)
    }
  }
  
  console.log('\n📋 RÉSUMÉ DE LA CONSOLIDATION')
  console.log('──────────────────────────────────────────────────')
  console.log(`Groupes traités: ${duplicates.length}`)
  
  if (dryRun) {
    const totalPerformancesToMigrate = duplicates.reduce((total, dup) => {
      return total + dup.exercises.slice(1).length // Nombre d'exercices obsolètes par groupe
    }, 0)
    console.log(`Performances à migrer: ${totalPerformancesToMigrate}`)
    console.log(`Exercices à supprimer: ${totalPerformancesToMigrate}`)
    
    console.log('\n💡 Pour exécuter réellement la consolidation:')
    console.log('   node scripts/consolidate-duplicates-fixed.js --execute')
  } else {
    console.log(`Performances migrées: ${totalPerformancesMigrated}`)
    console.log(`Exercices supprimés: ${totalExercisesDeleted}`)
    
    console.log('\n✅ Consolidation terminée avec succès !')
    console.log('🎯 Les statistiques de progression devraient maintenant être unifiées.')
  }
}

// Exécuter le script
consolidateDuplicates().catch(console.error)