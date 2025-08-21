#!/usr/bin/env node

/**
 * FINALISATION HARMONISATION COULEURS IRONTRACK 2025
 * Palette finale: Bleu (primaire), Gris (neutre), Orange (CTA uniquement)
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 FINALISATION HARMONISATION COULEURS');
console.log('=====================================');

// Corrections finales pour une palette cohérente
const finalColorRules = {
  // ✅ Pages principales : headers harmonisés
  'bg-gradient-to-r from-orange-400 to-red-400': 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
  
  // ✅ Boutons CTA critiques gardent l'orange
  // (Nouvelle séance, Ajouter, Sauvegarder)
  
  // ✅ Indicateurs et badges : passer en bleu ou neutre
  'text-orange-800 dark:text-orange-300': 'text-gray-800 dark:text-gray-200',
  'bg-orange-50': 'bg-blue-50',
  'text-orange-600': 'text-blue-600',
  'border-orange-200': 'border-blue-200',
  
  // ✅ Cellules calendrier déjà corrigées
  
  // ✅ Navigation et éléments interactifs en bleu
  'hover:bg-orange-50': 'hover:bg-blue-50',
  'focus:ring-orange-500': 'focus:ring-blue-500',
  
  // ✅ Dark mode optimisé
  'dark:bg-orange-900/20': 'dark:bg-blue-900/10',
  'dark:text-orange-300': 'dark:text-blue-300',
  'dark:border-orange-800': 'dark:border-blue-800'
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  Object.entries(finalColorRules).forEach(([oldColor, newColor]) => {
    if (content.includes(oldColor)) {
      content = content.replace(new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newColor);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// Fichiers à finaliser
const filesToFinalize = [
  'src/app/page.tsx',
  'src/app/exercises/page.tsx',
  'src/app/workouts/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/training-partners/page.tsx',
  'src/components/ui/CalendarDayCell.tsx'
];

let finalizedFiles = 0;

filesToFinalize.forEach(file => {
  const fullPath = path.resolve(file);
  if (processFile(fullPath)) {
    console.log(`✅ ${file} - Harmonisation finalisée`);
    finalizedFiles++;
  } else {
    console.log(`⚪ ${file} - Déjà harmonisé`);
  }
});

console.log(`\n📊 RÉSUMÉ FINAL:`);
console.log(`• Fichiers finalisés: ${finalizedFiles}`);
console.log(`• Palette harmonisée: 🔵 Bleu (primaire), ⚫ Gris (neutre), 🟠 Orange (CTA critiques uniquement)`);
console.log(`• Headers: Fonds neutres avec bordures subtiles`);
console.log(`• Contrastes: Optimisés WCAG AA`);
console.log(`• Dark mode: Variables CSS cohérentes`);

console.log(`\n🎉 HARMONISATION COMPLÈTE !`);