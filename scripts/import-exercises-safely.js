#!/usr/bin/env node

/**
 * =============================================
 * IMPORT SÉCURISÉ DU CATALOGUE D'EXERCICES
 * IronTrack - Script Node.js avec validation
 * Date: 2025-01-29
 * =============================================
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utilise les variables d'environnement)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================
// CATALOGUE COMPLET D'EXERCICES
// =============================================

const newExercises = [
  // 🏋️ MUSCULATION - PECTORAUX (12 exercices)
  {
    name: 'Développé couché haltères',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 4,
    difficulty: 2,
    description: 'Développé couché avec haltères, mouvement de base pour les pectoraux'
  },
  {
    name: 'Développé incliné barre',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 3,
    difficulty: 3,
    description: 'Développé sur banc incliné, cible le haut des pectoraux'
  },
  {
    name: 'Écarté haltères',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 4,
    difficulty: 2,
    description: 'Mouvement d\'isolation pour les pectoraux, amplitude maximale'
  },
  {
    name: 'Pompes diamant',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 1,
    difficulty: 4,
    description: 'Pompes avec mains en forme de diamant, très exigeant'
  },
  {
    name: 'Dips pectoraux',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 17,
    difficulty: 3,
    description: 'Dips avec inclinaison avant pour cibler les pectoraux'
  },
  {
    name: 'Pull-over haltère',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 4,
    difficulty: 3,
    description: 'Extension thoracique, étire et contracte les pectoraux'
  },
  {
    name: 'Pompes déclinées',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 1,
    difficulty: 3,
    description: 'Pompes pieds surélevés, plus difficile que les pompes classiques'
  },
  {
    name: 'Développé serré',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 3,
    difficulty: 3,
    description: 'Développé couché prise serrée, travaille aussi les triceps'
  },
  {
    name: 'Écarté poulie vis-à-vis',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 9,
    difficulty: 2,
    description: 'Écarté aux poulies, contraction constante'
  },
  {
    name: 'Pompes archer',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 1,
    difficulty: 5,
    description: 'Pompes asymétriques très avancées'
  },
  {
    name: 'Développé décliné',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 3,
    difficulty: 3,
    description: 'Développé sur banc décliné, cible le bas des pectoraux'
  },
  {
    name: 'Pompes claquées',
    exercise_type: 'Musculation',
    muscle_group: 'Pectoraux',
    equipment_id: 1,
    difficulty: 4,
    description: 'Pompes explosives avec claquement, pliométriques'
  },

  // 🏋️ MUSCULATION - DOS (15 exercices essentiels)
  {
    name: 'Soulevé de terre roumain',
    exercise_type: 'Musculation',
    muscle_group: 'Dos',
    equipment_id: 3,
    difficulty: 3,
    description: 'Mouvement de charnière de hanche, excellent pour les ischio-jambiers'
  },
  {
    name: 'Rowing barre penché',
    exercise_type: 'Musculation',
    muscle_group: 'Dos',
    equipment_id: 3,
    difficulty: 3,
    description: 'Tirage horizontal à la barre, développe la largeur du dos'
  },
  {
    name: 'Tractions prise large',
    exercise_type: 'Musculation',
    muscle_group: 'Dos',
    equipment_id: 17,
    difficulty: 4,
    description: 'Tractions pour développer la largeur du dos'
  },
  {
    name: 'Tractions prise neutre',
    exercise_type: 'Musculation',
    muscle_group: 'Dos',
    equipment_id: 17,
    difficulty: 3,
    description: 'Tractions prise parallèle, moins stressante pour les épaules'
  },
  {
    name: 'Rowing T-bar',
    exercise_type: 'Musculation',
    muscle_group: 'Dos',
    equipment_id: 3,
    difficulty: 3,
    description: 'Rowing à la barre en T, excellent pour l\'épaisseur du dos'
  },
  {
    name: 'Squat bulgare',
    exercise_type: 'Musculation',
    muscle_group: 'Jambes',
    equipment_id: 4,
    difficulty: 3,
    description: 'Squat unilatéral pied arrière surélevé, excellent pour les quadriceps'
  },
  {
    name: 'Hip thrust barre',
    exercise_type: 'Musculation',
    muscle_group: 'Fessiers',
    equipment_id: 3,
    difficulty: 3,
    description: 'Extension de hanche avec barre, roi des exercices fessiers'
  },

  // ⚡ FITNESS FONCTIONNEL (15 exercices essentiels)
  {
    name: 'Burpees complets',
    exercise_type: 'Fitness',
    muscle_group: 'Corps entier',
    equipment_id: 1,
    difficulty: 3,
    description: 'Exercice complet combinant squat, pompe et saut'
  },
  {
    name: 'Mountain climbers',
    exercise_type: 'Fitness',
    muscle_group: 'Abdominaux',
    equipment_id: 1,
    difficulty: 2,
    description: 'Course sur place en position planche'
  },
  {
    name: 'Jump squats',
    exercise_type: 'Fitness',
    muscle_group: 'Jambes',
    equipment_id: 1,
    difficulty: 2,
    description: 'Squats avec saut explosif'
  },
  {
    name: 'Thrusters',
    exercise_type: 'Fitness',
    muscle_group: 'Corps entier',
    equipment_id: 4,
    difficulty: 3,
    description: 'Squat + développé militaire en un mouvement'  
  },
  {
    name: 'Box jumps',
    exercise_type: 'Fitness',
    muscle_group: 'Jambes',
    equipment_id: 14,
    difficulty: 3,
    description: 'Sauts sur box, développe la puissance'
  },
  {
    name: 'Turkish get-up',
    exercise_type: 'Fitness',
    muscle_group: 'Corps entier',
    equipment_id: 4,
    difficulty: 4,
    description: 'Mouvement complexe de relevé avec charge'
  },
  {
    name: 'Planche standard',
    exercise_type: 'Fitness',
    muscle_group: 'Abdominaux',
    equipment_id: 1,
    difficulty: 2,
    description: 'Gainage frontal isométrique'
  },
  {
    name: 'Bear crawl',
    exercise_type: 'Fitness',
    muscle_group: 'Corps entier',
    equipment_id: 1,
    difficulty: 2,
    description: 'Déplacement quadrupédique'
  },
  {
    name: 'Burpee box jump',
    exercise_type: 'Fitness',
    muscle_group: 'Corps entier',
    equipment_id: 14,
    difficulty: 4,
    description: 'Burpee suivi d\'un saut sur box'
  },
  {
    name: 'Battle ropes',
    exercise_type: 'Fitness',
    muscle_group: 'Corps entier',
    equipment_id: 22,
    difficulty: 3,
    description: 'Ondulations avec cordes lourdes'
  },
  {
    name: 'Planche latérale',
    exercise_type: 'Fitness',
    muscle_group: 'Obliques',
    equipment_id: 1,
    difficulty: 2,
    description: 'Gainage latéral isométrique'
  },
  {
    name: 'Dead bug',
    exercise_type: 'Fitness',
    muscle_group: 'Abdominaux',
    equipment_id: 1,
    difficulty: 1,
    description: 'Exercice de stabilité du tronc'
  },
  {
    name: 'Broad jumps',
    exercise_type: 'Fitness',
    muscle_group: 'Jambes',
    equipment_id: 1,
    difficulty: 2,
    description: 'Sauts en longueur'
  },
  {
    name: 'V-ups',
    exercise_type: 'Fitness',
    muscle_group: 'Abdominaux',
    equipment_id: 1,
    difficulty: 3,
    description: 'Relevés de buste et jambes'
  },
  {
    name: 'Russian twists',
    exercise_type: 'Fitness',
    muscle_group: 'Obliques',
    equipment_id: 1,
    difficulty: 2,
    description: 'Rotations du tronc assis'
  },

  // 🏃 CARDIO (10 exercices essentiels)
  {
    name: 'Interval training',
    exercise_type: 'Cardio',
    muscle_group: 'Cardio',
    equipment_id: 1,
    difficulty: 3,
    description: 'Alternance haute et basse intensité'
  },
  {
    name: 'Rameur interval',
    exercise_type: 'Cardio',
    muscle_group: 'Dos',
    equipment_id: 12,
    difficulty: 3,
    description: 'Intervalles sur rameur'
  },
  {
    name: 'Spinning HIIT',
    exercise_type: 'Cardio',
    muscle_group: 'Cardio',
    equipment_id: 11,
    difficulty: 3,
    description: 'Cours de spinning haute intensité'
  },
  {
    name: 'Rameur 2000m',
    exercise_type: 'Cardio',
    muscle_group: 'Dos',
    equipment_id: 12,
    difficulty: 3,
    description: 'Test standard de 2000 mètres'
  },
  {
    name: 'Course fractionnée',
    exercise_type: 'Cardio',
    muscle_group: 'Cardio',
    equipment_id: 1,
    difficulty: 4,
    description: 'Répétitions courtes haute intensité'
  },
  {
    name: 'Saut à la corde',
    exercise_type: 'Cardio',
    muscle_group: 'Mollets',
    equipment_id: 16,
    difficulty: 2,
    description: 'Corde à sauter classique'
  },
  {
    name: 'Elliptique',
    exercise_type: 'Cardio',
    muscle_group: 'Cardio',
    equipment_id: 13,
    difficulty: 1,
    description: 'Cardio sur machine elliptique'
  },
  {
    name: 'Tapis incliné',
    exercise_type: 'Cardio',
    muscle_group: 'Cardio',
    equipment_id: 8,
    difficulty: 2,
    description: 'Course sur tapis avec inclinaison'
  },
  {
    name: 'Circuit cardio',
    exercise_type: 'Cardio',
    muscle_group: 'Corps entier',
    equipment_id: 1,
    difficulty: 3,
    description: 'Enchaînement d\'exercices cardio'
  },
  {
    name: 'Double unders',
    exercise_type: 'Cardio',
    muscle_group: 'Mollets',
    equipment_id: 16,
    difficulty: 4,
    description: 'Corde à sauter double tour'
  },

  // 🧘 ÉTIREMENT/MOBILITÉ (10 exercices essentiels)
  {
    name: 'Étirement ischio-jambiers',
    exercise_type: 'Étirement',
    muscle_group: 'Ischio-jambiers',
    equipment_id: 1,
    difficulty: 1,
    description: 'Étirement des muscles arrière de la cuisse'
  },
  {
    name: 'Étirement quadriceps',
    exercise_type: 'Étirement',
    muscle_group: 'Quadriceps',
    equipment_id: 1,
    difficulty: 1,
    description: 'Étirement des muscles avant de la cuisse'
  },
  {
    name: 'Étirement fléchisseurs hanches',
    exercise_type: 'Étirement',
    muscle_group: 'Hanches',
    equipment_id: 1,
    difficulty: 2,
    description: 'Étirement des fléchisseurs de hanche'
  },
  {
    name: 'Chat-vache',
    exercise_type: 'Étirement',
    muscle_group: 'Dos',
    equipment_id: 1,
    difficulty: 1,
    description: 'Mobilité dynamique de la colonne'
  },
  {
    name: 'Étirement dorsaux',
    exercise_type: 'Étirement',
    muscle_group: 'Dos',
    equipment_id: 1,
    difficulty: 1,
    description: 'Étirement suspendu pour le grand dorsal'
  },
  {
    name: 'Étirement pectoraux',
    exercise_type: 'Étirement',
    muscle_group: 'Pectoraux',
    equipment_id: 1,
    difficulty: 1,
    description: 'Étirement contre un mur'
  },
  {
    name: 'World greatest stretch',
    exercise_type: 'Étirement',
    muscle_group: 'Corps entier',
    equipment_id: 1,
    difficulty: 2,
    description: 'Étirement multi-articulaire complet'
  },
  {
    name: 'Étirement mollets',
    exercise_type: 'Étirement',
    muscle_group: 'Mollets',
    equipment_id: 1,
    difficulty: 1,
    description: 'Étirement du triceps sural'
  },
  {
    name: 'Cercles de bras',
    exercise_type: 'Étirement',
    muscle_group: 'Épaules',
    equipment_id: 1,
    difficulty: 1,
    description: 'Mobilisation circulaire des épaules'
  },
  {
    name: 'Rotation hanches',
    exercise_type: 'Étirement',
    muscle_group: 'Hanches',
    equipment_id: 1,
    difficulty: 1,
    description: 'Cercles avec les hanches'
  }
];

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

function validateExercise(exercise) {
  const required = ['name', 'exercise_type', 'muscle_group', 'equipment_id', 'difficulty'];
  const validTypes = ['Musculation', 'Cardio', 'Fitness', 'Étirement'];
  
  // Vérifier les champs requis
  for (const field of required) {
    if (!exercise[field]) {
      return `Champ requis manquant: ${field}`;
    }
  }
  
  // Vérifier le type d'exercice
  if (!validTypes.includes(exercise.exercise_type)) {
    return `Type d'exercice invalide: ${exercise.exercise_type}`;
  }
  
  // Vérifier la difficulté (1-5)
  if (exercise.difficulty < 1 || exercise.difficulty > 5) {
    return `Difficulté invalide: ${exercise.difficulty} (doit être entre 1 et 5)`;
  }
  
  return null;
}

async function checkExistingExercise(name) {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name')
    .eq('name', name);
    
  if (error) {
    throw new Error(`Erreur lors de la vérification: ${error.message}`);
  }
  
  return data.length > 0;
}

// =============================================
// FONCTION PRINCIPALE D'IMPORT
// =============================================

async function importExercises(dryRun = false) {
  console.log('🚀 Démarrage de l\'import des exercices...');
  console.log(`📊 Nombre d'exercices à importer: ${newExercises.length}`);
  
  if (dryRun) {
    console.log('⚠️  MODE DRY RUN - Aucune donnée ne sera modifiée');
  }
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const exercise of newExercises) {
    try {
      // Validation de l'exercice
      const validationError = validateExercise(exercise);
      if (validationError) {
        console.error(`❌ Validation échouée pour "${exercise.name}": ${validationError}`);
        errors++;
        continue;
      }
      
      // Vérifier si l'exercice existe déjà
      const exists = await checkExistingExercise(exercise.name);
      if (exists) {
        console.log(`⏭️  Exercice existant ignoré: ${exercise.name}`);
        skipped++;
        continue;
      }
      
      if (!dryRun) {
        // Insérer l'exercice
        const { error } = await supabase
          .from('exercises')
          .insert(exercise);
          
        if (error) {
          console.error(`❌ Erreur insertion "${exercise.name}": ${error.message}`);
          errors++;
          continue;
        }
      }
      
      console.log(`✅ ${dryRun ? 'Validé' : 'Importé'}: ${exercise.name} (${exercise.exercise_type})`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Erreur inattendue pour "${exercise.name}": ${error.message}`);
      errors++;
    }
  }
  
  // Résumé final
  console.log('\n📊 RÉSUMÉ DE L\'IMPORT:');
  console.log(`✅ ${dryRun ? 'Validés' : 'Importés'}: ${imported}`);
  console.log(`⏭️  Ignorés (existants): ${skipped}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📈 Total traités: ${imported + skipped + errors}/${newExercises.length}`);
  
  if (!dryRun && imported > 0) {
    // Statistiques par catégorie
    console.log('\n📈 RÉPARTITION PAR CATÉGORIE:');
    const { data: stats } = await supabase
      .from('exercises')
      .select('exercise_type')
      .neq('exercise_type', null);
      
    if (stats) {
      const counts = stats.reduce((acc, row) => {
        acc[row.exercise_type] = (acc[row.exercise_type] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(counts).forEach(([type, count]) => {
        console.log(`${type}: ${count} exercices`);
      });
    }
  }
  
  return { imported, skipped, errors };
}

// =============================================
// EXÉCUTION DU SCRIPT
// =============================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('-d');
  const isForce = args.includes('--force') || args.includes('-f');
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node import-exercises-safely.js [options]

Options:
  --dry-run, -d    Mode simulation (pas d'insertion réelle)
  --force, -f      Forcer l'import même si des erreurs existent
  --help, -h       Afficher cette aide

Examples:
  node import-exercises-safely.js --dry-run
  node import-exercises-safely.js --force
    `);
    return;
  }
  
  try {
    const results = await importExercises(isDryRun);
    
    if (results.errors > 0 && !isForce && !isDryRun) {
      console.log('\n⚠️  Import arrêté à cause d\'erreurs. Utilisez --force pour ignorer.');
      process.exit(1);
    }
    
    if (!isDryRun) {
      console.log('\n🎉 Import terminé avec succès !');
    } else {
      console.log('\n✅ Validation terminée. Utilisez le script sans --dry-run pour importer.');
    }
    
  } catch (error) {
    console.error('\n💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  main();
}

module.exports = { importExercises, validateExercise };