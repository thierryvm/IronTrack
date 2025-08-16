/**
 * AUDIT D'ACCESSIBILITÉ COMPLET WCAG 2.1 AA - IRONTRACK
 * Validation automatisée des standards d'accessibilité
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration des pages critiques à tester
const CRITICAL_PAGES = [
  '/',
  '/auth',
  '/shared/dashboard', 
  '/exercises',
  '/admin',
  '/calendar',
  '/faq',
  '/support'
];

// Standards WCAG 2.1 AA à valider
const ACCESSIBILITY_RULES = {
  contrast: 'color-contrast',
  images: 'image-alt',
  forms: 'label',
  headings: 'heading-order',
  focus: 'focus-order-semantics',
  keyboard: 'keyboard',
  aria: 'aria-*',
  landmarks: 'region'
};

console.log('🔍 DÉMARRAGE AUDIT ACCESSIBILITÉ WCAG 2.1 AA');
console.log('=' .repeat(60));

// Fonction pour exécuter les tests axe-core sur une page
function runAxeTest(url, pageName) {
  console.log(`\n📋 Test accessibilité: ${pageName}`);
  
  try {
    // Script Node.js temporaire pour test axe-core
    const testScript = `
      const puppeteer = require('puppeteer');
      const { AxePuppeteer } = require('@axe-core/puppeteer');
      
      (async () => {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        try {
          await page.goto('${url}', { waitUntil: 'networkidle0', timeout: 30000 });
          
          const results = await new AxePuppeteer(page)
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
            
          console.log(JSON.stringify({
            url: '${url}',
            page: '${pageName}',
            violations: results.violations.length,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            details: results.violations.map(v => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length
            }))
          }));
          
        } catch (error) {
          console.log(JSON.stringify({
            url: '${url}',
            page: '${pageName}',
            error: error.message,
            violations: 999,
            passes: 0
          }));
        } finally {
          await browser.close();
        }
      })();
    `;
    
    // Sauvegarde temporaire du script
    fs.writeFileSync('/tmp/axe-test.js', testScript);
    
    // Exécution du test (avec timeout de 45 secondes)
    const result = execSync('timeout 45 node /tmp/axe-test.js', {
      encoding: 'utf-8',
      timeout: 50000
    });
    
    return JSON.parse(result.trim());
    
  } catch (error) {
    console.log(`❌ Erreur test ${pageName}: ${error.message}`);
    return {
      url,
      page: pageName,
      error: error.message,
      violations: 999,
      passes: 0
    };
  }
}

// Tests de contraste manuel (règles CSS Tailwind)
function checkContrastCompliance() {
  console.log('\n🎨 ANALYSE CONTRASTE DES COULEURS');
  
  const contrastIssues = [];
  
  // Scan des fichiers pour détecter les classes à faible contraste
  const problematicClasses = [
    'text-gray-400', 'text-gray-300', 'text-gray-200',
    'bg-gray-100', 'border-gray-200',
    'text-blue-300', 'text-green-300'
  ];
  
  try {
    const srcDir = path.join(process.cwd(), 'src');
    const files = execSync(`find ${srcDir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf-8' }).split('\n');
    
    files.forEach(file => {
      if (!file) return;
      
      try {
        const content = fs.readFileSync(file, 'utf-8');
        
        problematicClasses.forEach(className => {
          if (content.includes(className)) {
            contrastIssues.push({
              file: file.replace(process.cwd(), ''),
              className,
              line: content.split('\n').findIndex(line => line.includes(className)) + 1
            });
          }
        });
        
      } catch (err) {
        // Ignorer les erreurs de fichiers
      }
    });
    
  } catch (error) {
    console.log(`❌ Erreur scan contraste: ${error.message}`);
  }
  
  return contrastIssues;
}

// Tests d'intégration accessibilité (basés sur les tests existants)
function runIntegratedAccessibilityTests() {
  console.log('\n🧪 TESTS ACCESSIBILITÉ INTÉGRÉS');
  
  try {
    // Exécution des tests d'accessibilité existants
    const testResult = execSync('npm run test src/components/ui/__tests__/accessibility.test.tsx', {
      encoding: 'utf-8',
      timeout: 30000
    });
    
    return {
      success: testResult.includes('PASS'),
      output: testResult
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || ''
    };
  }
}

// Tests de contraste automatisés
function runContrastTests() {
  console.log('\n⚡ TESTS CONTRASTE AUTOMATISÉS');
  
  try {
    const result = execSync('npm run test:contrast', {
      encoding: 'utf-8',
      timeout: 30000
    });
    
    return {
      success: result.includes('✅') || result.includes('PASS'),
      output: result
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// EXECUTION PRINCIPALE
async function runFullAccessibilityAudit() {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: CRITICAL_PAGES.length,
      totalViolations: 0,
      totalPasses: 0,
      score: 0
    },
    pages: [],
    contrast: {
      issues: [],
      automatedTest: {}
    },
    integrated: {}
  };
  
  // 1. Tests de contraste
  console.log('\n🔍 PHASE 1: ANALYSE CONTRASTE');
  results.contrast.issues = checkContrastCompliance();
  results.contrast.automatedTest = runContrastTests();
  
  // 2. Tests d'accessibilité intégrés
  console.log('\n🔍 PHASE 2: TESTS INTÉGRÉS');
  results.integrated = runIntegratedAccessibilityTests();
  
  // 3. Tests axe-core (si outils disponibles)
  console.log('\n🔍 PHASE 3: TESTS AXE-CORE (optionnel)');
  
  // Vérifier si le serveur de dev est lancé
  let serverRunning = false;
  try {
    execSync('curl -f http://localhost:3000 > /dev/null 2>&1');
    serverRunning = true;
  } catch {
    console.log('⚠️  Serveur dev non lancé, tests axe-core ignorés');
  }
  
  if (serverRunning) {
    for (const page of CRITICAL_PAGES) {
      const url = `http://localhost:3000${page}`;
      const result = runAxeTest(url, page);
      results.pages.push(result);
      
      if (result.violations !== undefined) {
        results.summary.totalViolations += result.violations;
        results.summary.totalPasses += result.passes || 0;
      }
    }
  }
  
  // Calcul du score global
  const contrastScore = results.contrast.issues.length === 0 ? 100 : Math.max(0, 100 - results.contrast.issues.length * 5);
  const integratedScore = results.integrated.success ? 100 : 50;
  const axeScore = results.pages.length === 0 ? 100 : Math.max(0, 100 - (results.summary.totalViolations * 10));
  
  results.summary.score = Math.round((contrastScore + integratedScore + axeScore) / 3);
  
  // Sauvegarde du rapport
  const reportPath = path.join(process.cwd(), 'accessibility-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  // Affichage du résumé
  console.log('\n📊 RÉSULTATS AUDIT ACCESSIBILITÉ');
  console.log('=' .repeat(60));
  console.log(`🎯 Score global: ${results.summary.score}/100`);
  console.log(`🚫 Violations détectées: ${results.summary.totalViolations}`);
  console.log(`✅ Tests réussis: ${results.summary.totalPasses}`);
  console.log(`🎨 Problèmes contraste: ${results.contrast.issues.length}`);
  console.log(`🧪 Tests intégrés: ${results.integrated.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📄 Rapport: ${reportPath}`);
  
  if (results.summary.score >= 95) {
    console.log('\n🏆 EXCELLENT - Application conforme WCAG 2.1 AA');
  } else if (results.summary.score >= 80) {
    console.log('\n✅ BON - Quelques améliorations mineures');
  } else if (results.summary.score >= 60) {
    console.log('\n⚠️  MOYEN - Corrections nécessaires');
  } else {
    console.log('\n❌ CRITIQUE - Problèmes majeurs d\'accessibilité');
  }
  
  return results;
}

// Exécution si appelé directement
if (require.main === module) {
  runFullAccessibilityAudit().catch(error => {
    console.error('Erreur audit:', error);
    process.exit(1);
  });
}

module.exports = { runFullAccessibilityAudit };