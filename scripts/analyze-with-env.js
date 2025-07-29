// Script d'analyse des doublons en utilisant les variables d'environnement
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeExerciseDuplicates() {
  console.log('=== ANALYSE COMPLÈTE DES DOUBLONS D\'EXERCICES ===\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service Key présente:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log();
  
  try {
    // 1. Test de connexion simple
    const { data: testData, error: testError } = await supabase
      .from('exercises')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return;
    }
    
    console.log('✅ Connexion Supabase établie');
    console.log();
    
    // 2. Récupérer tous les exercices avec leurs informations complètes
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name, exercise_type, created_at, user_id')
      .order('name', { ascending: true });
    
    if (exercisesError) {
      console.error('❌ Erreur lors de la récupération des exercices:', exercisesError);
      return;
    }
    
    console.log('📊 STATISTIQUES GÉNÉRALES');
    console.log('─'.repeat(50));
    console.log(`Total exercices: ${exercises.length}`);
    
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
    const uniqueExercises = [];
    
    Object.entries(groupedByName).forEach(([normalizedName, exs]) => {
      if (exs.length > 1) {
        duplicates.push({ 
          name: normalizedName, 
          originalName: exs[0].name,
          exercises: exs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        });
      } else {
        uniqueExercises.push(exs[0]);
      }
    });
    
    console.log(`Exercices uniques: ${uniqueExercises.length}`);
    console.log(`Groupes de doublons: ${duplicates.length}`);
    console.log(`Total d'exercices dupliqués: ${duplicates.reduce((sum, dup) => sum + dup.exercises.length, 0)}`);
    console.log();
    
    // 5. Analyser les doublons en détail
    if (duplicates.length > 0) {
      console.log('🔍 DÉTAIL DES DOUBLONS');
      console.log('─'.repeat(50));
      
      for (let i = 0; i < duplicates.length; i++) {
        const dup = duplicates[i];
        console.log(`\n${i + 1}. "${dup.originalName}" (${dup.exercises.length} versions)`);
        
        dup.exercises.forEach((ex, index) => {
          const createdDate = new Date(ex.created_at).toLocaleDateString('fr-FR');
          const isOldest = index === 0;
          const isNewest = index === dup.exercises.length - 1;
          
          let marker = '  ';
          if (isOldest) marker = '📅'; // Plus ancien
          if (isNewest) marker = '🆕'; // Plus récent
          
          console.log(`   ${marker} ID ${ex.id} | ${createdDate} | ${ex.exercise_type} | User: ${ex.user_id}`);
        });
      }
    } else {
      console.log('✅ Aucun doublon détecté dans les exercices !');
    }
    
    // 6. Analyser l'impact sur les performances
    console.log('\n📈 IMPACT SUR LES PERFORMANCES');
    console.log('─'.repeat(50));
    
    const { data: performances, error: perfError } = await supabase
      .from('performance_logs')
      .select(`
        id,
        exercise_id,
        user_id,
        performed_at,
        weight,
        reps,
        sets,
        duration,
        distance
      `)
      .order('performed_at', { ascending: false });
    
    if (perfError) {
      console.error('❌ Erreur lors de la récupération des performances:', perfError);
      return;
    }
    
    console.log(`Total performances: ${performances.length}`);
    
    // Analyser la fragmentation des performances
    const performanceFragmentation = {};
    let totalFragmentedPerformances = 0;
    
    duplicates.forEach(dup => {
      const duplicateIds = dup.exercises.map(ex => ex.id);
      const affectedPerformances = performances.filter(perf => 
        duplicateIds.includes(perf.exercise_id)
      );
      
      if (affectedPerformances.length > 0) {
        performanceFragmentation[dup.originalName] = {
          totalPerformances: affectedPerformances.length,
          exerciseVersions: duplicateIds.length,
          distributionByVersion: {}
        };
        
        duplicateIds.forEach(id => {
          const perfsForThisVersion = affectedPerformances.filter(p => p.exercise_id === id);
          performanceFragmentation[dup.originalName].distributionByVersion[id] = perfsForThisVersion.length;
        });
        
        totalFragmentedPerformances += affectedPerformances.length;
      }
    });
    
    console.log(`Performances fragmentées: ${totalFragmentedPerformances}`);
    if (performances.length > 0) {
      console.log(`Pourcentage de fragmentation: ${((totalFragmentedPerformances / performances.length) * 100).toFixed(1)}%`);
    }
    
    // Détail de la fragmentation
    if (Object.keys(performanceFragmentation).length > 0) {
      console.log('\n🔀 FRAGMENTATION DES PERFORMANCES PAR EXERCICE');
      console.log('─'.repeat(70));
      
      Object.entries(performanceFragmentation).forEach(([exerciseName, data]) => {
        console.log(`\n"${exerciseName}"`);
        console.log(`  📊 ${data.totalPerformances} performances réparties sur ${data.exerciseVersions} versions`);
        
        Object.entries(data.distributionByVersion).forEach(([exerciseId, count]) => {
          const exercise = exercises.find(ex => ex.id === parseInt(exerciseId));
          const createdDate = new Date(exercise.created_at).toLocaleDateString('fr-FR');
          console.log(`    • ID ${exerciseId} (${createdDate}): ${count} performances`);
        });
      });
    }
    
    // 7. Identifier les utilisateurs affectés
    console.log('\n👥 UTILISATEURS AFFECTÉS');
    console.log('─'.repeat(50));
    
    const affectedUsers = new Set();
    const userImpact = {};
    
    Object.values(performanceFragmentation).forEach(fragData => {
      Object.entries(fragData.distributionByVersion).forEach(([exerciseId, count]) => {
        const perfsForExercise = performances.filter(p => p.exercise_id === parseInt(exerciseId));
        perfsForExercise.forEach(perf => {
          affectedUsers.add(perf.user_id);
          if (!userImpact[perf.user_id]) {
            userImpact[perf.user_id] = {
              fragmentedPerformances: 0,
              affectedExercises: new Set()
            };
          }
          userImpact[perf.user_id].fragmentedPerformances++;
          
          // Trouver le nom de l'exercice
          const exercise = exercises.find(ex => ex.id === parseInt(exerciseId));
          if (exercise) {
            userImpact[perf.user_id].affectedExercises.add(exercise.name);
          }
        });
      });
    });
    
    console.log(`Utilisateurs affectés: ${affectedUsers.size}`);
    
    Object.entries(userImpact).forEach(([userId, impact]) => {
      console.log(`  • User ${userId}: ${impact.fragmentedPerformances} performances fragmentées sur ${impact.affectedExercises.size} exercices`);
    });
    
    // 8. Recommandations de stratégie
    console.log('\n💡 STRATÉGIE DE RÉSOLUTION RECOMMANDÉE');
    console.log('─'.repeat(50));
    
    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon détecté. La base de données est propre !');
      console.log('📝 Recommandation : Implémenter un système de prévention pour éviter les futurs doublons.');
    } else {
      console.log('📋 Plan de migration des doublons:');
      console.log('1. Créer une fonction de consolidation intelligente');
      console.log('2. Pour chaque groupe de doublons:');
      console.log('   - Garder la version la plus récente comme référence');
      console.log('   - Migrer toutes les performances vers cette version');
      console.log('   - Supprimer les versions obsolètes');
      console.log('3. Mettre à jour les références dans les autres tables');
      console.log('4. Implémenter un système de déduplication préventive');
      
      console.log('\n🎯 Bénéfices attendus:');
      console.log(`• Consolidation de ${totalFragmentedPerformances} performances fragmentées`);
      console.log(`• Simplification des statistiques pour ${affectedUsers.size} utilisateurs`);
      console.log(`• Réduction de ${duplicates.reduce((sum, dup) => sum + dup.exercises.length - 1, 0)} exercices redondants`);
      console.log(`• Amélioration de la cohérence des données de progression`);
    }
    
    return {
      totalExercises: exercises.length,
      uniqueExercises: uniqueExercises.length,
      duplicateGroups: duplicates.length,
      totalDuplicates: duplicates.reduce((sum, dup) => sum + dup.exercises.length, 0),
      fragmentedPerformances: totalFragmentedPerformances,
      affectedUsers: affectedUsers.size,
      duplicates: duplicates,
      performanceFragmentation: performanceFragmentation
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

// Exécuter l'analyse
analyzeExerciseDuplicates()
  .then(result => {
    if (result) {
      console.log('\n✅ Analyse terminée avec succès');
    }
  })
  .catch(console.error);