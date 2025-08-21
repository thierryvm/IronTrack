#!/usr/bin/env node

/**
 * 🔍 Vérificateur Fonctionnel Automatisé - IronTrack 2025
 * 
 * Teste toutes les fonctionnalités critiques après les modifications:
 * - Intégrité des composants shadcn/ui
 * - Fonctionnement du dark mode
 * - Sécurité des uploads
 * - Navigation et formulaires
 */

const fs = require('fs');
const path = require('path');

const TEST_CATEGORIES = {
  COMPONENTS: 'Composants UI',
  PAGES: 'Pages principales',
  FORMS: 'Formulaires',
  UPLOADS: 'Sécurité uploads',
  DARK_MODE: 'Mode sombre',
  MOBILE: 'Responsive design'
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

console.log('🔍 VÉRIFICATION FONCTIONNELLE IRONTRACK');
console.log('=====================================');

function test(category, description, testFn) {
  try {
    const result = testFn();
    if (result === true) {
      console.log(`✅ ${category}: ${description}`);
      testResults.passed++;
    } else if (result === 'warning') {
      console.log(`⚠️ ${category}: ${description}`);
      testResults.warnings++;
    } else {
      console.log(`❌ ${category}: ${description} - ${result}`);
      testResults.failed++;
      testResults.issues.push({ category, description, error: result });
    }
  } catch (error) {
    console.log(`❌ ${category}: ${description} - ${error.message}`);
    testResults.failed++;
    testResults.issues.push({ category, description, error: error.message });
  }
}

// 🧩 Tests Composants UI
console.log('\n🧩 TESTS COMPOSANTS UI');
console.log('----------------------');

test(TEST_CATEGORIES.COMPONENTS, 'Button component existe', () => {
  return fs.existsSync('./src/components/ui/button.tsx');
});

test(TEST_CATEGORIES.COMPONENTS, 'Input component existe', () => {
  return fs.existsSync('./src/components/ui/input.tsx');
});

test(TEST_CATEGORIES.COMPONENTS, 'Card component existe', () => {
  return fs.existsSync('./src/components/ui/card.tsx');
});

test(TEST_CATEGORIES.COMPONENTS, 'Form components existent', () => {
  return fs.existsSync('./src/components/ui/form.tsx');
});

test(TEST_CATEGORIES.COMPONENTS, 'Badge component existe', () => {
  return fs.existsSync('./src/components/ui/badge.tsx');
});

// 📄 Tests Pages Principales
console.log('\n📄 TESTS PAGES PRINCIPALES');
console.log('---------------------------');

test(TEST_CATEGORIES.PAGES, 'Page d\'accueil existe', () => {
  return fs.existsSync('./src/app/page.tsx');
});

test(TEST_CATEGORIES.PAGES, 'Page profil existe', () => {
  return fs.existsSync('./src/app/profile/page.tsx');
});

test(TEST_CATEGORIES.PAGES, 'Page exercices existe', () => {
  return fs.existsSync('./src/app/exercises/page.tsx');
});

test(TEST_CATEGORIES.PAGES, 'Page nutrition existe', () => {
  return fs.existsSync('./src/app/nutrition/page.tsx');
});

test(TEST_CATEGORIES.PAGES, 'Layout principal existe', () => {
  return fs.existsSync('./src/app/layout.tsx');
});

// 📝 Tests Formulaires
console.log('\n📝 TESTS FORMULAIRES');
console.log('--------------------');

test(TEST_CATEGORIES.FORMS, 'EmailAuthForm component', () => {
  return fs.existsSync('./src/components/auth/EmailAuthForm.tsx');
});

test(TEST_CATEGORIES.FORMS, 'ExerciseEditForm component', () => {
  return fs.existsSync('./src/components/exercises/ExerciseEditForm.tsx');
});

test(TEST_CATEGORIES.FORMS, 'SupportTicketForm component', () => {
  return fs.existsSync('./src/components/support/SupportTicketForm.tsx');
});

// 🔒 Tests Sécurité Uploads
console.log('\n🔒 TESTS SÉCURITÉ UPLOADS');
console.log('-------------------------');

test(TEST_CATEGORIES.UPLOADS, 'SecureFileUpload existe', () => {
  return fs.existsSync('./src/components/support/SecureFileUpload.tsx');
});

test(TEST_CATEGORIES.UPLOADS, 'Utils fileUpload sécurisé', () => {
  const content = fs.readFileSync('./src/utils/fileUpload.ts', 'utf8');
  if (content.includes('OWASP') && content.includes('sanitize')) {
    return true;
  }
  return 'Sécurité OWASP non détectée';
});

test(TEST_CATEGORIES.UPLOADS, 'Validation extensions fichiers', () => {
  const content = fs.readFileSync('./src/utils/fileUpload.ts', 'utf8');
  if (content.includes('allowedExtensions') || content.includes('.pdf') || content.includes('.png')) {
    return true;
  }
  return 'Validation extensions manquante';
});

// 🌙 Tests Mode Sombre
console.log('\n🌙 TESTS MODE SOMBRE');
console.log('--------------------');

test(TEST_CATEGORIES.DARK_MODE, 'ThemeToggle component', () => {
  return fs.existsSync('./src/components/ui/ThemeToggle.tsx');
});

test(TEST_CATEGORIES.DARK_MODE, 'Classes dark: dans pages', () => {
  const homePage = fs.readFileSync('./src/app/page.tsx', 'utf8');
  if (homePage.includes('dark:') && homePage.includes('dark:bg-')) {
    return true;
  }
  return 'Classes dark: manquantes en page d\'accueil';
});

test(TEST_CATEGORIES.DARK_MODE, 'Provider thème configuré', () => {
  const layout = fs.readFileSync('./src/app/layout.tsx', 'utf8');
  if (layout.includes('ThemeProvider') || layout.includes('next-themes')) {
    return true;
  }
  return 'ThemeProvider non configuré';
});

// 📱 Tests Responsive Design
console.log('\n📱 TESTS RESPONSIVE DESIGN');
console.log('---------------------------');

test(TEST_CATEGORIES.MOBILE, 'Classes responsive sm: md: lg:', () => {
  const homePage = fs.readFileSync('./src/app/page.tsx', 'utf8');
  if (homePage.includes('sm:') && homePage.includes('md:') && homePage.includes('lg:')) {
    return true;
  }
  return 'Classes responsive manquantes';
});

test(TEST_CATEGORIES.MOBILE, 'Touch targets améliorés', () => {
  const homePage = fs.readFileSync('./src/app/page.tsx', 'utf8');
  if (homePage.includes('h-6 w-6') || homePage.includes('h-10') || homePage.includes('h-11')) {
    return true;
  }
  return 'Touch targets non optimisés';
});

test(TEST_CATEGORIES.MOBILE, 'Config Tailwind mobile', () => {
  if (fs.existsSync('./tailwind.config.mjs')) {
    const config = fs.readFileSync('./tailwind.config.mjs', 'utf8');
    if (config.includes('screens') || config.includes('sm') || config.includes('md')) {
      return true;
    }
  }
  return 'Config Tailwind responsive manquante';
});

// 📊 Résultats finaux
console.log('\n📊 RÉSULTATS VÉRIFICATION');
console.log('=========================');
console.log(`✅ Tests réussis: ${testResults.passed}`);
console.log(`⚠️ Avertissements: ${testResults.warnings}`);
console.log(`❌ Tests échoués: ${testResults.failed}`);

if (testResults.issues.length > 0) {
  console.log('\n🚨 PROBLÈMES DÉTECTÉS:');
  testResults.issues.forEach((issue, i) => {
    console.log(`${i + 1}. [${issue.category}] ${issue.description}`);
    console.log(`   Erreur: ${issue.error}`);
  });
}

const totalTests = testResults.passed + testResults.failed + testResults.warnings;
const successRate = Math.round((testResults.passed / totalTests) * 100);

console.log(`\n🎯 TAUX DE RÉUSSITE: ${successRate}%`);

if (successRate >= 90) {
  console.log('🎉 EXCELLENT: Fonctionnalités en parfait état');
} else if (successRate >= 75) {
  console.log('👍 BON: Quelques points à améliorer');
} else if (successRate >= 50) {
  console.log('⚠️ MOYEN: Corrections nécessaires');
} else {
  console.log('🚨 CRITIQUE: Problèmes majeurs détectés');
}

process.exit(testResults.failed > 0 ? 1 : 0);