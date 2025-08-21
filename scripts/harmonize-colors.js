#!/usr/bin/env node

/**
 * 🎨 SCRIPT HARMONISATION COULEURS IRONTRACK
 * Remplace toutes les variantes orange incohérentes par le dégradé unifié
 * from-orange-600 to-red-500 + hover:from-orange-600 hover:to-red-600
 */

const fs = require('fs');
const path = require('path');

// Couleurs à harmoniser - Schéma unifié IronTrack
const COLOR_HARMONIZATION = {
  // Dégradés orange incohérents → Dégradé unifié
  'from-orange-500 to-orange-600': 'from-orange-600 to-red-500',
  'from-orange-600 to-orange-700': 'from-orange-600 to-red-500',
  
  // Hover incohérents → Hover unifié
  'hover:from-orange-600 hover:to-orange-700': 'hover:from-orange-600 hover:to-red-600',
  'hover:from-orange-500 hover:to-orange-600': 'hover:from-orange-600 hover:to-red-600',
  
  // Focus incohérents → Focus unifié
  'focus:from-orange-600 focus:to-orange-700': 'focus:from-orange-600 focus:to-red-600',
  'focus:from-orange-500 focus:to-orange-600': 'focus:from-orange-600 focus:to-red-600',
  
  // Couleurs solides oranges → Garder mais standardiser les tons
  'bg-orange-500': 'bg-orange-600', // Plus cohérent avec dégradé
  'text-orange-500': 'text-orange-600',
  'border-orange-500': 'border-orange-600',
  
  // Harmoniser les rouges aussi
  'bg-red-600': 'bg-red-500', // Garder red-500 pour cohérence avec dégradé
  'border-red-600': 'border-red-500',
};

// Fichiers à ignorer
const IGNORED_FILES = [
  'node_modules',
  '.next',
  '.git',
  'build',
  'dist',
  'agents',
  '*.min.js',
  '*.map'
];

async function harmonizeColors() {
  console.log('🎨 HARMONISATION COULEURS IRONTRACK');
  console.log('='.repeat(50));
  
  // Trouver tous les fichiers source récursivement
  const files = [];
  function findFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !IGNORED_FILES.includes(entry.name)) {
        findFiles(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  findFiles(srcDir);
  
  console.log(`📁 ${files.length} fichiers à analyser...`);
  
  let totalChanges = 0;
  let filesModified = 0;
  const changesByFile = {};
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;
    
    // Appliquer toutes les harmonisations
    for (const [oldColor, newColor] of Object.entries(COLOR_HARMONIZATION)) {
      const regex = new RegExp(escapeRegExp(oldColor), 'g');
      const matches = newContent.match(regex);
      
      if (matches) {
        newContent = newContent.replace(regex, newColor);
        fileChanges += matches.length;
        
        if (!changesByFile[file]) changesByFile[file] = [];
        changesByFile[file].push(`${oldColor} → ${newColor} (${matches.length}x)`);
      }
    }
    
    // Sauvegarder si modifié
    if (fileChanges > 0) {
      fs.writeFileSync(file, newContent);
      totalChanges += fileChanges;
      filesModified++;
      
      const relativePath = path.relative(process.cwd(), file);
      console.log(`✨ ${relativePath}: ${fileChanges} changements`);
    }
  }
  
  // Rapport final
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 HARMONISATION TERMINÉE`);
  console.log(`📁 Fichiers modifiés: ${filesModified}/${files.length}`);
  console.log(`🎨 Total changements: ${totalChanges}`);
  
  if (filesModified > 0) {
    console.log('\n📋 DÉTAIL DES CHANGEMENTS:');
    for (const [file, changes] of Object.entries(changesByFile)) {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`\n📁 ${relativePath}:`);
      changes.forEach(change => console.log(`  • ${change}`));
    }
    
    console.log('\n🎨 SCHÉMA COULEUR UNIFIÉ:');
    console.log('• Dégradé principal: from-orange-600 to-red-500');
    console.log('• Hover: hover:from-orange-600 hover:to-red-600');
    console.log('• Couleur solide: bg-orange-600, text-orange-600');
    console.log('• Rouge uniforme: bg-red-500, border-red-500');
    
    console.log('\n⚠️  ACTIONS SUIVANTES:');
    console.log('1. Tester visuellement sur http://localhost:3000');
    console.log('2. Vérifier que tous les boutons ont le même style');
    console.log('3. Valider sur page profil, formulaires, cards');
    console.log('4. Lancer agent UI/UX pour validation: node agents/ui-ux-agent.js --audit');
  } else {
    console.log('✅ Aucun changement nécessaire - Couleurs déjà harmonisées!');
  }
}

// Utilitaire escape regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Exécution
if (require.main === module) {
  harmonizeColors().catch(console.error);
}

module.exports = { harmonizeColors };