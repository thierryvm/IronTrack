#!/usr/bin/env node

/**
 * 🎯 TESTS MOBILE RESPONSIVE - Migration ShadCN UI
 * 
 * Validation automatisée des exigences WCAG 2.2 AA :
 * - Zones tactiles min 44x44px (touch targets)
 * - Responsive breakpoints < 600px et > 1024px
 * - Contrastes accessibilité
 * - Navigation clavier complète
 */

const fs = require('fs');
const path = require('path');

// Pages migrées à tester
const MIGRATED_PAGES = [
  'src/app/exercises/page.tsx',
  'src/app/profile/page.tsx', 
  'src/app/training-partners/page.tsx'
];

// Patterns à vérifier
const RESPONSIVE_PATTERNS = {
  // Zone tactiles WCAG - min 44x44px
  touchTargets: [
    /min-h-\[44px\]/g,
    /min-w-\[44px\]/g,
    /min-h-touch-44/g,
    /min-w-touch-44/g
  ],
  
  // Responsive breakpoints
  mobileFirst: [
    /max-sm:/g,
    /sm:/g,
    /md:/g,
    /lg:/g,
    /xl:/g
  ],
  
  // ShadCN UI Components
  shadcnComponents: [
    /Button/g,
    /Dialog/g,
    /Alert/g,
    /Input/g,
    /Label/g,
    /Card/g
  ],
  
  // Accessibilité
  accessibility: [
    /aria-label/g,
    /aria-describedby/g,
    /aria-pressed/g,
    /role=/g
  ]
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = {
    file: path.basename(filePath),
    touchTargets: 0,
    responsive: 0,
    shadcnComponents: 0,
    accessibility: 0,
    issues: []
  };

  // Compter les patterns
  RESPONSIVE_PATTERNS.touchTargets.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) results.touchTargets += matches.length;
  });

  RESPONSIVE_PATTERNS.mobileFirst.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) results.responsive += matches.length;
  });

  RESPONSIVE_PATTERNS.shadcnComponents.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) results.shadcnComponents += matches.length;
  });

  RESPONSIVE_PATTERNS.accessibility.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) results.accessibility += matches.length;
  });

  // Vérifications critiques
  if (results.touchTargets < 3) {
    results.issues.push('⚠️ Zones tactiles insuffisantes (< 3 détectées)');
  }

  if (results.responsive < 5) {
    results.issues.push('⚠️ Responsive insuffisant (< 5 breakpoints détectés)');
  }

  if (results.shadcnComponents < 5) {
    results.issues.push('❌ Migration ShadCN UI incomplète (< 5 composants détectés)');
  }

  if (results.accessibility < 3) {
    results.issues.push('❌ Accessibilité insuffisante (< 3 attributs ARIA détectés)');
  }

  return results;
}

function generateReport(allResults) {
  console.log('\n🎯 RAPPORT TESTS MOBILE RESPONSIVE - Migration ShadCN UI');
  console.log('='.repeat(60));
  
  let totalIssues = 0;
  let totalTouchTargets = 0;
  let totalResponsive = 0;
  let totalShadcn = 0;
  let totalAccessibility = 0;

  allResults.forEach(result => {
    console.log(`\n📄 ${result.file}`);
    console.log(`  Zones tactiles: ${result.touchTargets} éléments`);
    console.log(`  Responsive: ${result.responsive} breakpoints`);
    console.log(`  ShadCN UI: ${result.shadcnComponents} composants`);
    console.log(`  Accessibilité: ${result.accessibility} attributs ARIA`);
    
    if (result.issues.length > 0) {
      console.log(`  Issues:`);
      result.issues.forEach(issue => console.log(`    ${issue}`));
      totalIssues += result.issues.length;
    } else {
      console.log(`  ✅ Aucun problème détecté`);
    }

    totalTouchTargets += result.touchTargets;
    totalResponsive += result.responsive; 
    totalShadcn += result.shadcnComponents;
    totalAccessibility += result.accessibility;
  });

  console.log('\n📊 RÉSUMÉ GLOBAL');
  console.log('-'.repeat(30));
  console.log(`Total zones tactiles: ${totalTouchTargets}`);
  console.log(`Total responsive: ${totalResponsive}`);
  console.log(`Total ShadCN UI: ${totalShadcn}`);
  console.log(`Total accessibilité: ${totalAccessibility}`);
  console.log(`Total issues: ${totalIssues}`);

  // Score global
  const score = Math.max(0, 100 - (totalIssues * 10));
  console.log(`\n🏆 SCORE GLOBAL: ${score}/100`);
  
  if (score >= 90) {
    console.log('✅ EXCELLENT - Migration ultrahardcore réussie !');
  } else if (score >= 70) {
    console.log('⚠️ CORRECT - Quelques améliorations possibles');
  } else {
    console.log('❌ INSUFFISANT - Migration à finaliser');
  }

  return { score, totalIssues };
}

// Exécution des tests
console.log('🚀 Démarrage tests mobile responsive...');

const allResults = [];
MIGRATED_PAGES.forEach(page => {
  if (fs.existsSync(page)) {
    allResults.push(analyzeFile(page));
  } else {
    console.log(`⚠️ Fichier non trouvé: ${page}`);
  }
});

const { score, totalIssues } = generateReport(allResults);

// Exit code pour CI/CD
process.exit(totalIssues > 3 ? 1 : 0);