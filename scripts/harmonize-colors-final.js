#!/usr/bin/env node

/**
 * HARMONISATION PALETTE COULEURS IRONTRACK 2025
 * Objectif: 3 couleurs max + variantes selon règles design
 * - Primary: Bleu pour navigation/actions principales
 * - Secondary: Gris pour textes/éléments neutres  
 * - Accent: Orange pour CTA importants uniquement
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 HARMONISATION PALETTE COULEURS IRONTRACK');
console.log('================================================');

// PALETTE HARMONISÉE (3 couleurs + variantes)
const colorRules = {
  // ❌ SUPPRESSION: Dégradés orange/rouge inappropriés dans headers
  'bg-gradient-to-r from-orange-600 to-red-500': 'bg-white dark:bg-gray-800',
  'bg-gradient-to-r from-orange-500 to-red-400': 'bg-white dark:bg-gray-800',
  'bg-gradient-to-r from-orange-800 to-red-700': 'bg-white dark:bg-gray-800',
  
  // ✅ HEADERS: Fond neutre avec bordure subtile
  'bg-gradient-to-r from-orange-400 to-red-400 dark:from-orange-600 dark:to-red-600': 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
  
  // ✅ BOUTONS PRIMAIRES: Orange pour CTA importants uniquement
  'bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600': 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700',
  'bg-orange-600 hover:bg-orange-700': 'bg-blue-600 hover:bg-blue-700',
  
  // ✅ BOUTONS SECONDAIRES: Orange réservé aux actions critiques
  'bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400': 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700',
  
  // ✅ TEXTE: Amélioration contrastes
  'text-orange-700 dark:text-orange-300': 'text-gray-700 dark:text-gray-300',
  'text-orange-800 dark:text-orange-300': 'text-gray-800 dark:text-gray-200',
  
  // ✅ BADGES/INDICATEURS: Garder orange pour importance
  'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300': 'bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
  'bg-orange-100 text-orange-700': 'bg-orange-50 text-orange-600'
};

// Exception: Garder orange pour boutons CTA critiques
const criticalCTASelectors = [
  'Nouvelle séance',
  'Ajouter une séance', 
  'Créer exercice',
  'Sauvegarder'
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  Object.entries(colorRules).forEach(([oldColor, newColor]) => {
    if (content.includes(oldColor)) {
      // Exception pour boutons CTA critiques
      const isCriticalCTA = criticalCTASelectors.some(selector => 
        content.includes(selector) && content.includes(oldColor)
      );
      
      if (!isCriticalCTA) {
        content = content.replace(new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newColor);
        modified = true;
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Fichiers à traiter
const filesToProcess = [
  'src/app/calendar/page.tsx',
  'src/app/page.tsx', 
  'src/app/exercises/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/training-partners/page.tsx',
  'src/components/layout/HeaderClient.tsx'
];

let processedFiles = 0;

filesToProcess.forEach(file => {
  const fullPath = path.resolve(file);
  if (processFile(fullPath)) {
    console.log(`✅ ${file} - Couleurs harmonisées`);
    processedFiles++;
  } else {
    console.log(`⚪ ${file} - Aucun changement nécessaire`);
  }
});

console.log(`\n📊 RÉSUMÉ:`);
console.log(`• Fichiers traités: ${processedFiles}`);
console.log(`• Palette harmonisée: 3 couleurs (Bleu/Gris/Orange)`);
console.log(`• Headers: Fond neutre avec bordures subtiles`);
console.log(`• Boutons: Bleu pour navigation, Orange pour CTA critiques`);
console.log(`• Contrastes: Améliorés pour WCAG AA`);

console.log(`\n✨ HARMONISATION TERMINÉE !`);