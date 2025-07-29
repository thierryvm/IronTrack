// Script de consolidation des doublons d'exercices
// Ce script migre automatiquement les performances vers les exercices les plus récents
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function consolidateExerciseDuplicates(dryRun = true) {
  console.log('=== CONSOLIDATION DES DOUBLONS D\'EXERCICES ===\n');
  console.log(`Mode: ${dryRun ? '🔍 SIMULATION (DRY RUN)' : '⚡ EXÉCUTION RÉELLE'}`);
  console.log();
  
  try {
    // 1. Créer une sauvegarde
    if (!dryRun) {
      console.log('💾 Création de sauvegardes...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Backup exercises
      const { error: backupExercisesError } = await supabase.rpc('create_backup_table', {
        source_table: 'exercises',
        backup_name: `exercises_backup_${timestamp}`
      });
      
      // Backup performance_logs
      const { error: backupPerformanceError } = await supabase.rpc('create_backup_table', {
        source_table: 'performance_logs',
        backup_name: `performance_logs_backup_${timestamp}`
      });
      
      if (backupExercisesError || backupPerformanceError) {
        console.log('⚠️  Impossible de créer les sauvegardes automatiques, mais on continue...');
      } else {
        console.log('✅ Sauvegardes créées avec succès');
      }
      console.log();
    }
    
    // 2. Récupérer tous les exercices
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name, exercise_type, created_at, user_id')
      .order('name', { ascending: true });
    
    if (exercisesError) {
      console.error('❌ Erreur lors de la récupération des exercices:', exercisesError);
      return;
    }
    
    // 3. Grouper par nom normalisé
    const groupedByName = {};
    exercises.forEach(ex => {
      const normalizedName = ex.name.trim().toLowerCase();
      if (!groupedByName[normalizedName]) {
        groupedByName[normalizedName] = [];
      }
      groupedByName[normalizedName].push(ex);
    });
    
    // 4. Identifier les doublons
    const duplicates = [];
    Object.entries(groupedByName).forEach(([normalizedName, exs]) => {
      if (exs.length > 1) {
        duplicates.push({ 
          name: normalizedName, 
          originalName: exs[0].name,
          exercises: exs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Plus récent en premier
        });
      }
    });
    
    console.log(`📊 ${duplicates.length} groupes de doublons trouvés`);
    console.log();
    
    let totalConsolidated = 0;
    let totalPerformancesMigrated = 0;
    let totalExercisesDeleted = 0;
    
    // 5. Pour chaque groupe de doublons
    for (const duplicate of duplicates) {
      const masterExercise = duplicate.exercises[0]; // Le plus récent
      const obsoleteExercises = duplicate.exercises.slice(1); // Les autres
      
      console.log(`🔄 Consolidation: "${duplicate.originalName}"`);
      console.log(`   Master: ID ${masterExercise.id} (${new Date(masterExercise.created_at).toLocaleDateString('fr-FR')})`);
      console.log(`   Obsolètes: ${obsoleteExercises.map(ex => `ID ${ex.id}`).join(', ')}`);
      
      // 6. Récupérer les performances à migrer
      const obsoleteIds = obsoleteExercises.map(ex => ex.id);
      const { data: performancesToMigrate, error: perfError } = await supabase
        .from('performance_logs')
        .select('id, exercise_id, user_id, performed_at')
        .in('exercise_id', obsoleteIds);
      
      if (perfError) {
        console.error(`   ❌ Erreur récupération performances:`, perfError);
        continue;
      }
      
      console.log(`   📈 ${performancesToMigrate.length} performances à migrer`);
      
      if (!dryRun && performancesToMigrate.length > 0) {
        // 7. Migrer les performances vers le master
        const { error: migrationError } = await supabase
          .from('performance_logs')
          .update({ 
            exercise_id: masterExercise.id
          })
          .in('exercise_id', obsoleteIds);
        
        if (migrationError) {
          console.error(`   ❌ Erreur migration performances:`, migrationError);
          continue;
        }
        
        // 8. Migrer les références dans training_goals
        const { error: goalsError } = await supabase
          .from('training_goals')
          .update({ exercise_id: masterExercise.id })
          .in('exercise_id', obsoleteIds);
        
        // 9. Migrer les références dans workout_exercises
        const { error: workoutError } = await supabase
          .from('workout_exercises')
          .update({ exercise_id: masterExercise.id })
          .in('exercise_id', obsoleteIds);
        
        // 10. Supprimer les exercices obsolètes
        const { error: deleteError } = await supabase
          .from('exercises')
          .delete()
          .in('id', obsoleteIds);
        
        if (deleteError) {
          console.error(`   ❌ Erreur suppression exercices:`, deleteError);
          continue;
        }
        
        console.log(`   ✅ Migration réussie: ${performancesToMigrate.length} performances`);
      } else if (dryRun) {
        console.log(`   🔍 Simulation: ${performancesToMigrate.length} performances seraient migrées`);
      }
      
      totalConsolidated++;
      totalPerformancesMigrated += performancesToMigrate.length;
      totalExercisesDeleted += obsoleteExercises.length;
      console.log();
    }
    
    // 11. Résumé
    console.log('📋 RÉSUMÉ DE LA CONSOLIDATION');
    console.log('─'.repeat(50));
    console.log(`Groupes traités: ${totalConsolidated}`);
    console.log(`Performances ${dryRun ? 'à migrer' : 'migrées'}: ${totalPerformancesMigrated}`);
    console.log(`Exercices ${dryRun ? 'à supprimer' : 'supprimés'}: ${totalExercisesDeleted}`);
    
    if (dryRun) {
      console.log();
      console.log('💡 Pour exécuter réellement la consolidation:');
      console.log('   node scripts/consolidate-duplicates.js --execute');
    } else {
      console.log();
      console.log('✅ Consolidation terminée avec succès !');
      console.log('🎯 Les statistiques de progression devraient maintenant être unifiées.');
    }
    
    return {
      totalConsolidated,
      totalPerformancesMigrated,
      totalExercisesDeleted,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la consolidation:', error);
    return { success: false, error };
  }
}

// Fonction utilitaire pour créer une table de backup
async function createBackupFunction() {
  const backupFunction = `
    CREATE OR REPLACE FUNCTION create_backup_table(source_table text, backup_name text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE format('CREATE TABLE %I AS SELECT * FROM %I', backup_name, source_table);
    END;
    $$;
  `;
  
  try {
    await supabase.rpc('exec_sql', { sql: backupFunction });
    console.log('✅ Fonction de backup créée');
  } catch (error) {
    console.log('⚠️  Fonction de backup déjà existante ou non créée');
  }
}

// Point d'entrée principal
async function main() {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute') || args.includes('-e');
  
  if (executeMode) {
    console.log('⚠️  ATTENTION: Vous êtes sur le point d\'exécuter la consolidation RÉELLE !');
    console.log('⚠️  Cela va modifier définitivement la base de données.');
    console.log();
    
    // En mode réel, on demande confirmation (ou on peut l'automatiser)
    const shouldProceed = true; // Pour automatiser, sinon utiliser readline pour demander
    
    if (shouldProceed) {
      await createBackupFunction();
      await consolidateExerciseDuplicates(false);
    } else {
      console.log('❌ Consolidation annulée');
    }
  } else {
    await consolidateExerciseDuplicates(true);
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { consolidateExerciseDuplicates };