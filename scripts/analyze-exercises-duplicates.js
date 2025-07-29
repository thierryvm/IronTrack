const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://taspdceblvmpvdjixyit.supabase.co',
  '***REDACTED_SERVICE_ROLE_KEY***'
);

async function analyzeDuplicates() {
  console.log('=== ANALYSE TABLE EXERCISES - DOUBLONS ===\n');
  
  // Récupérer tous les exercices triés par nom
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    console.log('❌ Erreur:', error.message);
    return;
  }
  
  console.log('📊 Total exercices:', exercises.length);
  
  // Regrouper par nom pour identifier les doublons
  const groupedByName = {};
  exercises.forEach(ex => {
    const normalizedName = ex.name.trim().toLowerCase();
    if (!groupedByName[normalizedName]) {
      groupedByName[normalizedName] = [];
    }
    groupedByName[normalizedName].push(ex);
  });
  
  // Identifier les doublons
  const duplicates = [];
  Object.entries(groupedByName).forEach(([name, exs]) => {
    if (exs.length > 1) {
      duplicates.push({ name, exercises: exs });
    }
  });
  
  console.log('🔍 Doublons identifiés:', duplicates.length);
  console.log();
  
  duplicates.forEach((dup, index) => {
    console.log('🔄 Doublon', index + 1, ':', dup.name);
    dup.exercises.forEach(ex => {
      console.log('  - ID:', ex.id, '| Créé le:', ex.created_at, '| Type:', ex.type, '| Équipement:', ex.equipment_id);
    });
    console.log();
  });
  
  // Afficher quelques exercices uniques pour comparaison
  const uniques = Object.entries(groupedByName).filter(([_, exs]) => exs.length === 1).slice(0, 5);
  console.log('✅ Exemples d\'exercices uniques:');
  uniques.forEach(([name, exs]) => {
    console.log('  -', exs[0].name, '(ID:', exs[0].id + ')');
  });
  
  return { total: exercises.length, duplicates, uniques: Object.keys(groupedByName).length - duplicates.length };
}

analyzeDuplicates().catch(console.error);