#!/usr/bin/env node

/**
 * 🌙 SCRIPT IMPLÉMENTATION MODE SOMBRE IRONTRACK
 * Ajoute automatiquement les classes dark: pour un thème sombre cohérent
 * Basé sur les patterns détectés par l'agent UI/UX
 */

const fs = require('fs');
const path = require('path');

// Mappings automatiques pour mode sombre
const DARK_MODE_MAPPINGS = {
  // Fonds clairs → Fonds sombres
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  
  // Textes sombres → Textes clairs
  'text-black': 'text-black dark:text-white',
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  
  // Bordures claires → Bordures sombres
  'border-white': 'border-white dark:border-gray-700',
  'border-gray-100': 'border-gray-100 dark:border-gray-700',
  'border-gray-200': 'border-gray-200 dark:border-gray-600',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  
  // Boutons et états
  'hover:bg-gray-50': 'hover:bg-gray-50 dark:hover:bg-gray-800',
  'hover:bg-gray-100': 'hover:bg-gray-100 dark:hover:bg-gray-700',
  'focus:bg-gray-50': 'focus:bg-gray-50 dark:focus:bg-gray-800',
  
  // Spécifique IronTrack - Adaptation orange
  'bg-orange-50': 'bg-orange-50 dark:bg-orange-900/20',
  'text-orange-800': 'text-orange-800 dark:text-orange-300',
  'border-orange-200': 'border-orange-200 dark:border-orange-800',
};

// Classes à ignorer (déjà sombres ou spéciales)
const IGNORE_PATTERNS = [
  /dark:/,           // Déjà avec dark:
  /bg-gradient-/,    // Dégradés - traitement spécial
  /from-orange-/,    // Dégradés IronTrack
  /to-red-/,         // Dégradés IronTrack  
  /backdrop-blur/,   // Effets spéciaux
  /bg-black/,        // Déjà sombre
  /text-white/,      // Déjà clair
];

// Fichiers à ignorer
const IGNORED_FILES = [
  'node_modules',
  '.next',
  '.git',
  'agents',
  '__tests__',
  '.test.',
  '.spec.'
];

async function implementDarkMode() {
  console.log('🌙 IMPLÉMENTATION MODE SOMBRE IRONTRACK');
  console.log('='.repeat(50));
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = [];
  
  // Trouver tous les fichiers source
  function findFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !IGNORED_FILES.some(ignored => entry.name.includes(ignored))) {
        findFiles(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  findFiles(srcDir);
  console.log(`📁 ${files.length} fichiers à analyser...`);
  
  let totalChanges = 0;
  let filesModified = 0;
  const changesByFile = {};
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let fileChanges = 0;
    
    // Appliquer tous les mappings dark mode
    for (const [lightClass, darkClass] of Object.entries(DARK_MODE_MAPPINGS)) {
      // Vérifier que la classe n'est pas déjà traitée
      const shouldIgnore = IGNORE_PATTERNS.some(pattern => pattern.test(lightClass));
      if (shouldIgnore) continue;
      
      // Créer regex pour matcher la classe exacte (word boundary)
      const regex = new RegExp(`\\b${escapeRegExp(lightClass)}\\b`, 'g');
      const matches = newContent.match(regex);
      
      if (matches) {
        // Vérifier qu'on n'ajoute pas de doublons dark:
        const hasExistingDark = new RegExp(`\\b${escapeRegExp(lightClass)}\\s+dark:`).test(newContent);
        
        if (!hasExistingDark) {
          newContent = newContent.replace(regex, darkClass);
          fileChanges += matches.length;
          
          if (!changesByFile[file]) changesByFile[file] = [];
          changesByFile[file].push(`${lightClass} → ${darkClass} (${matches.length}x)`);
        }
      }
    }
    
    // Traitement spécial pour les dégradés orange
    const gradientOrangeRegex = /bg-gradient-to-r from-orange-600 to-red-500(?!\s+dark:)/g;
    const gradientMatches = newContent.match(gradientOrangeRegex);
    
    if (gradientMatches) {
      newContent = newContent.replace(
        gradientOrangeRegex, 
        'bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400'
      );
      fileChanges += gradientMatches.length;
      
      if (!changesByFile[file]) changesByFile[file] = [];
      changesByFile[file].push(`Dégradé orange + variante dark (${gradientMatches.length}x)`);
    }
    
    // Sauvegarder si modifié
    if (fileChanges > 0) {
      fs.writeFileSync(file, newContent);
      totalChanges += fileChanges;
      filesModified++;
      
      const relativePath = path.relative(process.cwd(), file);
      console.log(`🌙 ${relativePath}: ${fileChanges} améliorations dark mode`);
    }
  }
  
  // Rapport final
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 IMPLÉMENTATION DARK MODE TERMINÉE`);
  console.log(`📁 Fichiers modifiés: ${filesModified}/${files.length}`);
  console.log(`🌙 Total améliorations: ${totalChanges}`);
  
  if (filesModified > 0) {
    console.log('\n📋 DÉTAIL DES AMÉLIORATIONS:');
    for (const [file, changes] of Object.entries(changesByFile)) {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`\n📁 ${relativePath}:`);
      changes.slice(0, 5).forEach(change => console.log(`  • ${change}`));
      if (changes.length > 5) {
        console.log(`  • ... et ${changes.length - 5} autres changements`);
      }
    }
    
    console.log('\n🌙 THÈME SOMBRE CONFIGURÉ:');
    console.log('• Fonds: bg-white → bg-white dark:bg-gray-900');
    console.log('• Textes: text-gray-900 → text-gray-900 dark:text-gray-100');  
    console.log('• Bordures: border-gray-200 → border-gray-200 dark:border-gray-600');
    console.log('• Boutons: Dégradé orange + variante sombre optimisée');
    
    console.log('\n⚠️  ÉTAPES SUIVANTES:');
    console.log('1. Vérifier Tailwind config pour darkMode: "class"');
    console.log('2. Ajouter toggle dark mode dans HeaderClient');
    console.log('3. Tester visuellement sur http://localhost:3000');
    console.log('4. Relancer agent UI/UX: node agents/ui-ux-agent.js --audit');
    
    console.log('\n🔧 CONFIGURATION TAILWIND NÉCESSAIRE:');
    console.log('module.exports = {');
    console.log('  darkMode: "class", // Activation mode sombre par classe');
    console.log('  // ... reste de la config');
    console.log('}');
  } else {
    console.log('✅ Aucune amélioration nécessaire - Dark mode déjà optimisé!');
  }
}

// Utilitaire escape regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Exécution
if (require.main === module) {
  implementDarkMode().catch(console.error);
}

module.exports = { implementDarkMode };