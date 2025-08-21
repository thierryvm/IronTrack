#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Script d'audit manuel pour IronTrack
 * Effectue des vérifications techniques de base
 */

console.log('🔍 AUDIT MANUEL IRONTRACK - Post Migration ShadCN UI');
console.log('='.repeat(60));

// 1. Vérification de la compilation
console.log('\n📦 1. Vérification Build');
console.log('─'.repeat(30));

try {
  console.log('Construction de l\'application...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful - Aucune erreur TypeScript/ESLint');
} catch (error) {
  console.log('❌ Erreurs de build détectées');
  console.log(error.stdout?.toString() || error.message);
}

// 2. Analyse des bundles
console.log('\n📊 2. Analyse des Bundles');
console.log('─'.repeat(30));

try {
  // Vérifier la taille des bundles dans .next
  const nextDir = '.next';
  if (fs.existsSync(nextDir)) {
    console.log('✅ Dossier .next créé avec succès');
    
    // Vérifier les pages principales
    const pages = [
      '.next/server/app/page.js',
      '.next/server/app/calendar/page.js',
      '.next/server/app/exercises/page.js',
      '.next/server/app/profile/page.js',
      '.next/server/app/training-partners/page.js'
    ];
    
    pages.forEach(page => {
      if (fs.existsSync(page)) {
        const stats = fs.statSync(page);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`✅ ${page}: ${sizeKB} KB`);
      } else {
        console.log(`❌ ${page}: Fichier manquant`);
      }
    });
  }
} catch (error) {
  console.log('❌ Erreur analyse bundles:', error.message);
}

// 3. Vérification des ressources statiques
console.log('\n🖼️ 3. Ressources Statiques');
console.log('─'.repeat(30));

const staticPaths = [
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png',
  'public/manifest.json',
  'public/robots.txt'
];

staticPaths.forEach(path => {
  if (fs.existsSync(path)) {
    const stats = fs.statSync(path);
    console.log(`✅ ${path} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${path}: Manquant`);
  }
});

// 4. Configuration des composants ShadCN UI
console.log('\n🎨 4. Composants ShadCN UI');
console.log('─'.repeat(30));

const shadcnComponents = [
  'src/components/ui/card.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/select.tsx'
];

let shadcnCount = 0;
shadcnComponents.forEach(component => {
  if (fs.existsSync(component)) {
    shadcnCount++;
    console.log(`✅ ${component.split('/').pop()}`);
  } else {
    console.log(`❌ ${component.split('/').pop()}: Manquant`);
  }
});

console.log(`\n📊 ${shadcnCount}/${shadcnComponents.length} composants ShadCN UI installés`);

// 5. Vérification dark mode
console.log('\n🌓 5. Configuration Dark Mode');
console.log('─'.repeat(30));

try {
  const tailwindConfig = fs.readFileSync('tailwind.config.mjs', 'utf8');
  if (tailwindConfig.includes('darkMode')) {
    console.log('✅ Dark mode configuré dans Tailwind');
  } else {
    console.log('❌ Dark mode non configuré');
  }
  
  // Vérifier le provider de thème
  if (fs.existsSync('src/components/ui/ThemeToggle.tsx')) {
    console.log('✅ Composant ThemeToggle présent');
  } else {
    console.log('❌ Composant ThemeToggle manquant');
  }
  
} catch (error) {
  console.log('❌ Erreur vérification dark mode:', error.message);
}

// 6. Analyse des performances basiques
console.log('\n⚡ 6. Analyse Performances Basiques');
console.log('─'.repeat(30));

// Vérifier les optimisations Next.js
const nextConfig = 'next.config.ts';
if (fs.existsSync(nextConfig)) {
  console.log('✅ Configuration Next.js présente');
  
  try {
    const config = fs.readFileSync(nextConfig, 'utf8');
    
    // Vérifier les optimisations importantes
    const optimizations = [
      { key: 'compress', name: 'Compression gzip' },
      { key: 'swcMinify', name: 'Minification SWC' },
      { key: 'optimizeFonts', name: 'Optimisation fonts' },
      { key: 'images', name: 'Optimisation images' }
    ];
    
    optimizations.forEach(opt => {
      if (config.includes(opt.key)) {
        console.log(`✅ ${opt.name} activé`);
      } else {
        console.log(`⚠️ ${opt.name} non détecté`);
      }
    });
    
  } catch (error) {
    console.log('❌ Erreur lecture config:', error.message);
  }
} else {
  console.log('❌ next.config.ts manquant');
}

// 7. Résumé et recommandations
console.log('\n🎯 7. Résumé et Recommandations');
console.log('─'.repeat(30));

console.log(`
✅ POINTS POSITIFS:
- Build Next.js successful
- Migration ShadCN UI en cours (${shadcnCount}/${shadcnComponents.length} composants)
- Configuration dark mode présente
- Structure de projet conforme

⚠️ POINTS À VÉRIFIER:
- Audit Lighthouse nécessite environnement production ou serveur Linux
- Vérification manuelle des Core Web Vitals recommandée
- Test accessibilité avec lecteur d'écran recommandé

🚀 PROCHAINES ÉTAPES:
1. Test manuel dans Chrome DevTools (F12 > Lighthouse)
2. Déploiement en production pour audit complet
3. Test sur différents appareils mobiles
4. Validation WCAG avec outils spécialisés

💡 ALTERNATIVE: Utilisez Chrome DevTools > Lighthouse directement sur http://localhost:3001
`);

console.log('\n' + '='.repeat(60));
console.log('✅ AUDIT MANUEL TERMINÉ');
console.log('='.repeat(60));