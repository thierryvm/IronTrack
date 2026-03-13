#!/usr/bin/env node
/**
 * 🧠 ULTRAHARDCORE ANTI-REGRESSION SUITE
 * Tests automatiques pour éviter les erreurs critiques récurrentes
 * 
 * Objectif: Détecter AVANT déploiement les problèmes de:
 * - Service Worker conflits
 * - Google Fonts 404/network errors
 * - CSS syntax errors
 * - Bundle corruption
 * - Configuration Next.js problématique
 * 
 * Usage: npm run test:regression
 * Exit codes: 0=OK, 1=CRITICAL_ERROR, 2=WARNING
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ================== CONFIGURATION CRITIQUE ==================
const CRITICAL_CHECKS = {
  SERVICE_WORKER: {
    allowedFiles: [], // Aucun SW autorisé pendant stabilité
    forbiddenPatterns: ['sw.js', 'sw-dev.js', 'service-worker.js'],
    criticalImports: ['register-sw', 'RegisterSW']
  },
  GOOGLE_FONTS: {
    forbiddenDomains: ['fonts.googleapis.com', 'fonts.gstatic.com'],
    forbiddenImports: ['next/font/google', '@next/font/google'],
    allowedFallbacks: ['system-ui', '-apple-system', 'sans-serif']
  },
  CSS_INTEGRITY: {
    forbiddenSyntax: ['@import url(', 'font-face {', '.woff2', 'googleapis'],
    requiredClasses: ['antialiased', 'bg-gray-50', 'text-orange-800']
  },
  BUNDLE_CORRUPTION: {
    maxErrors: 0, // Aucune erreur TypeScript tolérée
    forbiddenWarnings: ['Failed to load resource', 'Module not found', '8548.js']
  }
};

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

// ================== UTILITAIRES CORE ==================
async function log(level, message, details = '') {
  const timestamp = new Date().toISOString();
  const colors = {
    ERROR: COLORS.RED,
    SUCCESS: COLORS.GREEN,
    WARNING: COLORS.YELLOW,
    INFO: COLORS.BLUE
  };
  
  console.log(`${colors[level]}[${level}] ${timestamp} - ${message}${COLORS.RESET}`);
  if (details) {
    console.log(`${COLORS.MAGENTA}${details}${COLORS.RESET}`);
  }
}

async function scanFiles(directory, extensions = ['.tsx', '.ts', '.js', '.css']) {
  const results = [];
  
  async function scanDir(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
          await scanDir(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      await log('WARNING', `Cannot scan directory: ${dir}`, error.message);
    }
  }
  
  await scanDir(directory);
  return results;
}

async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    await log('WARNING', `Cannot read file: ${filePath}`, error.message);
    return '';
  }
}

// ================== TESTS CRITIQUES ==================

/**
 * TEST 1: Vérification Service Worker complètement éliminé
 */
async function testServiceWorkerElimination() {
  await log('INFO', '🧠 ULTRAHARDCORE TEST 1: Service Worker Elimination');
  
  let criticalErrors = 0;
  let warnings = 0;
  
  // 1.1 Vérifier absence fichiers SW dans public/
  const publicFiles = await scanFiles('./public', ['.js']);
  for (const file of publicFiles) {
    const filename = path.basename(file);
    if (CRITICAL_CHECKS.SERVICE_WORKER.forbiddenPatterns.includes(filename)) {
      await log('ERROR', `CRITICAL: Service Worker file detected: ${file}`);
      criticalErrors++;
    }
  }
  
  // 1.2 Vérifier imports SW désactivés
  const sourceFiles = await scanFiles('./src');
  for (const file of sourceFiles) {
    const content = await readFileContent(file);
    
    // Imports actifs interdits
    for (const forbiddenImport of CRITICAL_CHECKS.SERVICE_WORKER.criticalImports) {
      const activeImportPattern = new RegExp(`^\\s*import.*${forbiddenImport}`, 'gm');
      if (activeImportPattern.test(content)) {
        await log('ERROR', `CRITICAL: Active SW import in ${file}: ${forbiddenImport}`);
        criticalErrors++;
      }
    }
    
    // Vérifier que les imports sont bien commentés
    if (content.includes('RegisterSW') && !content.includes('// import RegisterSW')) {
      await log('WARNING', `SW component not properly disabled in: ${file}`);
      warnings++;
    }
  }
  
  // 1.3 Vérifier configuration next.config.ts
  const nextConfigContent = await readFileContent('./next.config.ts');
  if (nextConfigContent.includes('service-worker') || nextConfigContent.includes('workbox')) {
    await log('ERROR', 'CRITICAL: SW configuration detected in next.config.ts');
    criticalErrors++;
  }
  
  await log(criticalErrors === 0 ? 'SUCCESS' : 'ERROR', 
    `Service Worker elimination: ${criticalErrors} critical errors, ${warnings} warnings`);
  
  return { criticalErrors, warnings };
}

/**
 * TEST 2: Vérification Google Fonts complètement éliminé
 */
async function testGoogleFontsElimination() {
  await log('INFO', '🧠 ULTRAHARDCORE TEST 2: Google Fonts Elimination');
  
  let criticalErrors = 0;
  let warnings = 0;
  
  const allFiles = await scanFiles('.');
  
  for (const file of allFiles) {
    const content = await readFileContent(file);
    
    // 2.1 Vérifier domaines Google Fonts interdits
    for (const domain of CRITICAL_CHECKS.GOOGLE_FONTS.forbiddenDomains) {
      if (content.includes(domain) && !content.includes(`// `) && !content.includes(`/* `)) {
        await log('ERROR', `CRITICAL: Active Google Fonts domain in ${file}: ${domain}`);
        criticalErrors++;
      }
    }
    
    // 2.2 Vérifier imports Google Fonts interdits
    for (const importName of CRITICAL_CHECKS.GOOGLE_FONTS.forbiddenImports) {
      const activeImportPattern = new RegExp(`^\\s*import.*${importName}`, 'gm');
      if (activeImportPattern.test(content)) {
        await log('ERROR', `CRITICAL: Active Google Font import in ${file}: ${importName}`);
        criticalErrors++;
      }
    }
    
    // 2.3 Vérifier preconnect/dns-prefetch désactivés
    const fontPreconnect = /rel=["'](?:preconnect|dns-prefetch)["'].*googleapis/;
    if (fontPreconnect.test(content) && !content.includes('/*') && !content.includes('//')) {
      await log('ERROR', `CRITICAL: Active Google Fonts preconnect in ${file}`);
      criticalErrors++;
    }
  }
  
  // 2.4 Vérifier polices système en place
  const layoutContent = await readFileContent('./src/app/layout.tsx');
  if (!layoutContent.includes('system-ui') || !layoutContent.includes('-apple-system')) {
    await log('WARNING', 'System fonts may not be properly configured');
    warnings++;
  }
  
  await log(criticalErrors === 0 ? 'SUCCESS' : 'ERROR', 
    `Google Fonts elimination: ${criticalErrors} critical errors, ${warnings} warnings`);
  
  return { criticalErrors, warnings };
}

/**
 * TEST 3: Intégrité CSS et absence syntax errors
 */
async function testCSSIntegrity() {
  await log('INFO', '🧠 ULTRAHARDCORE TEST 3: CSS Integrity');
  
  let criticalErrors = 0;
  let warnings = 0;
  
  const cssFiles = await scanFiles('.', ['.css', '.tsx', '.ts']);
  
  for (const file of cssFiles) {
    const content = await readFileContent(file);
    
    // 3.1 Syntaxes CSS interdites
    for (const forbiddenSyntax of CRITICAL_CHECKS.CSS_INTEGRITY.forbiddenSyntax) {
      if (content.includes(forbiddenSyntax) && !content.includes('//') && !content.includes('/*')) {
        await log('ERROR', `CRITICAL: Forbidden CSS syntax in ${file}: ${forbiddenSyntax}`);
        criticalErrors++;
      }
    }
    
    // 3.2 Classes essentielles présentes
    if (file.includes('globals.css')) {
      for (const requiredClass of CRITICAL_CHECKS.CSS_INTEGRITY.requiredClasses) {
        if (!content.includes(requiredClass)) {
          await log('WARNING', `Required CSS class missing in ${file}: ${requiredClass}`);
          warnings++;
        }
      }
    }
  }
  
  // 3.3 Test compilation CSS
  try {
    await execAsync('npm run build 2>&1 | grep -i "css\\|style"', { timeout: 30000 });
  } catch (error) {
    if (error.message.includes('error') || error.message.includes('Error')) {
      await log('ERROR', 'CRITICAL: CSS compilation errors detected');
      criticalErrors++;
    }
  }
  
  await log(criticalErrors === 0 ? 'SUCCESS' : 'ERROR', 
    `CSS integrity: ${criticalErrors} critical errors, ${warnings} warnings`);
  
  return { criticalErrors, warnings };
}

/**
 * TEST 4: Vérification absence corruption bundle
 */
async function testBundleIntegrity() {
  await log('INFO', '🧠 ULTRAHARDCORE TEST 4: Bundle Integrity');
  
  let criticalErrors = 0;
  let warnings = 0;
  
  try {
    // 4.1 Test TypeScript compilation
    const { stdout: tscOutput, stderr: tscErrors } = await execAsync('npx tsc --noEmit', { timeout: 60000 });
    
    if (tscErrors && tscErrors.length > 0) {
      const errorCount = (tscErrors.match(/error TS/g) || []).length;
      if (errorCount > CRITICAL_CHECKS.BUNDLE_CORRUPTION.maxErrors) {
        await log('ERROR', `CRITICAL: ${errorCount} TypeScript errors detected`);
        criticalErrors++;
      }
    }
    
    // 4.2 Test build Next.js
    const { stdout: buildOutput, stderr: buildErrors } = await execAsync('timeout 60 npm run build', { timeout: 65000 });
    
    for (const forbiddenWarning of CRITICAL_CHECKS.BUNDLE_CORRUPTION.forbiddenWarnings) {
      if (buildErrors && buildErrors.includes(forbiddenWarning)) {
        await log('ERROR', `CRITICAL: Bundle corruption warning: ${forbiddenWarning}`);
        criticalErrors++;
      }
    }
    
    // 4.3 Vérifier taille bundle raisonnable
    if (buildOutput && buildOutput.includes('First Load JS shared by all')) {
      const sizeMatch = buildOutput.match(/(\d+(?:\.\d+)?)\s*kB.*First Load JS/);
      if (sizeMatch) {
        const firstLoadSize = parseFloat(sizeMatch[1]);
        if (firstLoadSize > 300) { // 300kB max acceptable
          await log('WARNING', `Bundle size high: ${firstLoadSize}kB (target: <300kB)`);
          warnings++;
        } else {
          await log('SUCCESS', `Bundle size acceptable: ${firstLoadSize}kB`);
        }
      }
    }
    
  } catch (error) {
    if (error.message.includes('timeout')) {
      await log('ERROR', 'CRITICAL: Build timeout - potential infinite loop or severe performance issue');
      criticalErrors++;
    } else {
      await log('ERROR', `CRITICAL: Build failed: ${error.message}`);
      criticalErrors++;
    }
  }
  
  await log(criticalErrors === 0 ? 'SUCCESS' : 'ERROR', 
    `Bundle integrity: ${criticalErrors} critical errors, ${warnings} warnings`);
  
  return { criticalErrors, warnings };
}

/**
 * TEST 5: Configuration Next.js sécurisée
 */
async function testNextConfigSafety() {
  await log('INFO', '🧠 ULTRAHARDCORE TEST 5: Next.js Config Safety');
  
  let criticalErrors = 0;
  let warnings = 0;
  
  const nextConfigContent = await readFileContent('./next.config.ts');
  
  // 5.1 Configuration simplifiée recommandée
  const dangerousConfigs = [
    'experimental',
    'webpack: (config)',
    'headers: async',
    'contentSecurityPolicy',
    'compress: false'
  ];
  
  for (const dangerousConfig of dangerousConfigs) {
    if (nextConfigContent.includes(dangerousConfig)) {
      await log('WARNING', `Potentially problematic config: ${dangerousConfig}`);
      warnings++;
    }
  }
  
  // 5.2 Configuration minimale requise
  const requiredConfigs = ['images:', 'remotePatterns'];
  for (const required of requiredConfigs) {
    if (!nextConfigContent.includes(required)) {
      await log('WARNING', `Missing recommended config: ${required}`);
      warnings++;
    }
  }
  
  // 5.3 Absence domaines Google Fonts
  if (nextConfigContent.includes('fonts.googleapis.com') && !nextConfigContent.includes('//')) {
    await log('ERROR', 'CRITICAL: Active Google Fonts domain in next.config.ts');
    criticalErrors++;
  }
  
  await log(criticalErrors === 0 ? 'SUCCESS' : 'ERROR', 
    `Next.js config safety: ${criticalErrors} critical errors, ${warnings} warnings`);
  
  return { criticalErrors, warnings };
}

// ================== RUNNER PRINCIPAL ==================
async function runUltrahardcoreTests() {
  console.log(`${COLORS.BOLD}${COLORS.MAGENTA}`);
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║      🧠 ULTRAHARDCORE ANTI-REGRESSION SUITE      ║');
  console.log('║                                                  ║');
  console.log('║  Tests automatiques pour éviter les régressions ║');  
  console.log('║  critiques de Service Worker, Google Fonts,     ║');
  console.log('║  CSS, Bundle et configuration Next.js           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(COLORS.RESET);
  
  const startTime = Date.now();
  let totalCriticalErrors = 0;
  let totalWarnings = 0;
  
  // Exécuter tous les tests critiques
  const tests = [
    testServiceWorkerElimination,
    testGoogleFontsElimination,
    testCSSIntegrity,
    testBundleIntegrity,
    testNextConfigSafety
  ];
  
  for (const test of tests) {
    try {
      const result = await test();
      totalCriticalErrors += result.criticalErrors;
      totalWarnings += result.warnings;
      
      // Pause entre tests pour éviter surcharge système
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      await log('ERROR', `Test failed: ${test.name}`, error.message);
      totalCriticalErrors++;
    }
  }
  
  // ================== RAPPORT FINAL ==================
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`\n${COLORS.BOLD}${COLORS.BLUE}═══════════════════════════════════════════════════════${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}                    RAPPORT ULTRAHARDCORE${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.BLUE}═══════════════════════════════════════════════════════${COLORS.RESET}\n`);
  
  console.log(`⏱️  Durée d'exécution: ${duration}s`);
  console.log(`🔥 Erreurs critiques: ${totalCriticalErrors}`);
  console.log(`⚠️  Avertissements: ${totalWarnings}`);
  
  if (totalCriticalErrors === 0 && totalWarnings === 0) {
    console.log(`\n${COLORS.GREEN}${COLORS.BOLD}✅ SUCCÈS TOTAL - Application stable et sécurisée${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}   Aucun risque de régression détecté${COLORS.RESET}\n`);
    process.exit(0);
  } else if (totalCriticalErrors === 0) {
    console.log(`\n${COLORS.YELLOW}${COLORS.BOLD}⚠️  SUCCÈS AVEC AVERTISSEMENTS${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}   Application fonctionnelle mais améliorations possibles${COLORS.RESET}\n`);
    process.exit(2);
  } else {
    console.log(`\n${COLORS.RED}${COLORS.BOLD}❌ ÉCHEC CRITIQUE${COLORS.RESET}`);
    console.log(`${COLORS.RED}   ${totalCriticalErrors} problème(s) DOIVENT être résolus avant déploiement${COLORS.RESET}\n`);
    
    // Recommendations de correction
    console.log(`${COLORS.YELLOW}📋 RECOMMANDATIONS DE CORRECTION:${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}   1. Vérifier absence complète Service Workers${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}   2. Éliminer toute référence Google Fonts${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}   3. Corriger erreurs CSS et TypeScript${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}   4. Simplifier configuration Next.js${COLORS.RESET}\n`);
    
    process.exit(1);
  }
}

// Exécution si script appelé directement
if (require.main === module) {
  runUltrahardcoreTests().catch(error => {
    console.error(`${COLORS.RED}FATAL ERROR: ${error.message}${COLORS.RESET}`);
    process.exit(1);
  });
}

module.exports = {
  runUltrahardcoreTests,
  CRITICAL_CHECKS,
  testServiceWorkerElimination,
  testGoogleFontsElimination,
  testCSSIntegrity,
  testBundleIntegrity,
  testNextConfigSafety
};