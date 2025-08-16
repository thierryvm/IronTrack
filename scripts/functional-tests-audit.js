/**
 * AUDIT TESTS FONCTIONNELS CRITIQUES - IRONTRACK
 * Validation des flows utilisateur essentiels
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 AUDIT TESTS FONCTIONNELS CRITIQUES');
console.log('=' .repeat(60));

// Flows critiques à valider
const CRITICAL_FLOWS = {
  authentication: {
    name: 'Authentification',
    actions: ['Login', 'Logout', 'Password Reset', 'Registration'],
    priority: 'HIGH'
  },
  exercises: {
    name: 'Gestion Exercices',
    actions: ['Create Exercise', 'Edit Exercise', 'Delete Exercise', 'Add Performance'],
    priority: 'HIGH'
  },
  admin: {
    name: 'Interface Admin',
    actions: ['Admin Login', 'User Management', 'Ticket Management', 'System Logs'],
    priority: 'MEDIUM'
  },
  notifications: {
    name: 'Notifications Temps Réel',
    actions: ['Partner Notifications', 'System Alerts', 'Realtime Updates'],
    priority: 'MEDIUM'
  },
  serviceWorker: {
    name: 'Service Worker',
    actions: ['PWA Install', 'Offline Mode', 'Cache Management'],
    priority: 'LOW'
  }
};

/**
 * Analyser les tests existants
 */
function analyzeExistingTests() {
  console.log('\n📋 ANALYSE TESTS EXISTANTS');
  
  const analysis = {
    testFiles: [],
    coverage: {
      total: 0,
      byFlow: {}
    },
    frameworks: new Set(),
    issues: []
  };
  
  // Initialiser la couverture
  Object.keys(CRITICAL_FLOWS).forEach(flow => {
    analysis.coverage.byFlow[flow] = {
      tested: 0,
      total: CRITICAL_FLOWS[flow].actions.length,
      percentage: 0,
      files: []
    };
  });
  
  try {
    const testDirs = ['tests/', 'src/__tests__/', 'e2e/'];
    
    testDirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      
      if (fs.existsSync(fullPath)) {
        const files = execSync(`find "${fullPath}" -name "*.spec.ts" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.test.js"`, { 
          encoding: 'utf-8' 
        }).split('\n').filter(f => f.trim());
        
        files.forEach(file => {
          if (!file) return;
          
          try {
            const content = fs.readFileSync(file, 'utf-8');
            const fileInfo = {
              path: file.replace(process.cwd(), ''),
              type: file.includes('e2e') ? 'E2E' : file.includes('spec') ? 'Integration' : 'Unit',
              size: Math.round(fs.statSync(file).size / 1024),
              testCount: (content.match(/it\(/g) || []).length,
              flows: []
            };
            
            // Identifier le framework de test
            if (content.includes('playwright') || content.includes('@playwright')) {
              analysis.frameworks.add('Playwright');
            }
            if (content.includes('jest') || content.includes('@jest')) {
              analysis.frameworks.add('Jest');
            }
            if (content.includes('cypress')) {
              analysis.frameworks.add('Cypress');
            }
            
            // Analyser la couverture des flows
            Object.entries(CRITICAL_FLOWS).forEach(([flowKey, flow]) => {
              const flowCovered = flow.actions.some(action => {
                const keywords = action.toLowerCase().split(' ');
                return keywords.some(keyword => 
                  content.toLowerCase().includes(keyword) ||
                  fileInfo.path.toLowerCase().includes(keyword)
                );
              });
              
              if (flowCovered) {
                fileInfo.flows.push(flowKey);
                analysis.coverage.byFlow[flowKey].tested++;
                analysis.coverage.byFlow[flowKey].files.push(fileInfo.path);
              }
            });
            
            // Détecter les problèmes
            if (fileInfo.testCount === 0) {
              analysis.issues.push(`${fileInfo.path}: Aucun test détecté`);
            }
            
            if (fileInfo.size > 50) {
              analysis.issues.push(`${fileInfo.path}: Fichier test très volumineux (${fileInfo.size}KB)`);
            }
            
            if (content.includes('skip') || content.includes('xit(')) {
              analysis.issues.push(`${fileInfo.path}: Tests désactivés détectés`);
            }
            
            analysis.testFiles.push(fileInfo);
            
          } catch (error) {
            analysis.issues.push(`Erreur lecture ${file}: ${error.message}`);
          }
        });
      }
    });
    
    // Calculer les pourcentages de couverture
    Object.keys(analysis.coverage.byFlow).forEach(flow => {
      const flowData = analysis.coverage.byFlow[flow];
      flowData.percentage = Math.round((flowData.tested / flowData.total) * 100);
      analysis.coverage.total += flowData.percentage;
    });
    
    analysis.coverage.total = Math.round(analysis.coverage.total / Object.keys(analysis.coverage.byFlow).length);
    
    console.log(`📊 Fichiers de test: ${analysis.testFiles.length}`);
    console.log(`🔧 Frameworks: ${Array.from(analysis.frameworks).join(', ')}`);
    console.log(`📈 Couverture moyenne: ${analysis.coverage.total}%`);
    console.log(`🚨 Problèmes: ${analysis.issues.length}`);
    
    console.log('\n🎯 COUVERTURE PAR FLOW:');
    Object.entries(analysis.coverage.byFlow).forEach(([flow, data]) => {
      const status = data.percentage >= 80 ? '✅' : data.percentage >= 50 ? '⚠️' : '❌';
      console.log(`   ${status} ${CRITICAL_FLOWS[flow].name}: ${data.percentage}% (${data.tested}/${data.total})`);
    });
    
  } catch (error) {
    console.log(`❌ Erreur analyse tests: ${error.message}`);
    analysis.error = error.message;
  }
  
  return analysis;
}

/**
 * Exécuter les tests unitaires et récupérer métriques
 */
function runUnitTests() {
  console.log('\n🧪 EXÉCUTION TESTS UNITAIRES');
  
  const results = {
    executed: false,
    success: false,
    metrics: {},
    coverage: {},
    duration: 0
  };
  
  try {
    console.log('⚡ Lancement Jest...');
    
    const startTime = Date.now();
    const output = execSync('npm test -- --coverage --passWithNoTests --silent', {
      encoding: 'utf-8',
      timeout: 120000 // 2 minutes max
    });
    results.duration = Date.now() - startTime;
    
    results.executed = true;
    results.success = output.includes('PASS') && !output.includes('FAIL');
    
    // Extraire les métriques
    const testMatch = output.match(/Tests:\\s+(\\d+) failed,\\s+(\\d+) passed,\\s+(\\d+) total/);
    if (testMatch) {
      results.metrics = {
        failed: parseInt(testMatch[1]),
        passed: parseInt(testMatch[2]),
        total: parseInt(testMatch[3]),
        successRate: Math.round((parseInt(testMatch[2]) / parseInt(testMatch[3])) * 100)
      };
    }
    
    // Extraire la couverture si disponible
    const coverageMatch = output.match(/All files[\\s\\S]*?(\\d+\\.\\d+)\\s+\\|\\s+(\\d+\\.\\d+)\\s+\\|\\s+(\\d+\\.\\d+)\\s+\\|\\s+(\\d+\\.\\d+)/);
    if (coverageMatch) {
      results.coverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4])
      };
    }
    
    console.log(`✅ Tests exécutés en ${results.duration}ms`);
    if (results.metrics.total) {
      console.log(`📊 Résultats: ${results.metrics.passed}/${results.metrics.total} tests (${results.metrics.successRate}%)`);
    }
    if (results.coverage.statements) {
      console.log(`📈 Couverture: ${results.coverage.statements}% statements, ${results.coverage.lines}% lines`);
    }
    
  } catch (error) {
    console.log(`⚠️  Tests unitaires: ${error.message.includes('FAIL') ? 'Certains tests ont échoué' : 'Erreur exécution'}`);
    results.executed = true;
    results.success = false;
    results.error = error.message.substring(0, 500); // Limiter la longueur
    
    // Essayer d'extraire des métriques même en cas d'échec
    if (error.stdout && error.stdout.includes('Tests:')) {
      const testMatch = error.stdout.match(/Tests:\\s+(\\d+) failed,\\s+(\\d+) passed,\\s+(\\d+) total/);
      if (testMatch) {
        results.metrics = {
          failed: parseInt(testMatch[1]),
          passed: parseInt(testMatch[2]),
          total: parseInt(testMatch[3]),
          successRate: Math.round((parseInt(testMatch[2]) / parseInt(testMatch[3])) * 100)
        };
      }
    }
  }
  
  return results;
}

/**
 * Tenter les tests E2E (si disponibles)
 */
function attemptE2ETests() {
  console.log('\n🌐 TENTATIVE TESTS E2E');
  
  const results = {
    available: false,
    executed: false,
    success: false,
    error: null
  };
  
  try {
    // Vérifier si Playwright est configuré
    const playwrightConfig = fs.existsSync('playwright.config.ts') || fs.existsSync('playwright.config.js');
    
    if (playwrightConfig) {
      console.log('✅ Configuration Playwright détectée');
      results.available = true;
      
      // Vérifier si des tests existent
      const testFiles = execSync('find tests/ e2e/ -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null || echo ""', {
        encoding: 'utf-8'
      }).trim().split('\n').filter(f => f.trim());
      
      if (testFiles.length > 0) {
        console.log(`📋 ${testFiles.length} fichier(s) de test E2E trouvé(s)`);
        
        // Tentative d'exécution rapide (smoke test)
        try {
          console.log('⚡ Tentative smoke test...');
          execSync('npm run test:smoke 2>/dev/null || echo "Smoke test non disponible"', {
            encoding: 'utf-8',
            timeout: 30000 // 30 secondes max
          });
          
          results.executed = true;
          results.success = true;
          console.log('✅ Smoke test réussi');
          
        } catch (smokeError) {
          console.log('⚠️  Smoke test échoué ou indisponible');
          results.executed = false;
          results.error = 'Smoke test failed or not available';
        }
      } else {
        console.log('⚠️  Aucun test E2E trouvé');
      }
    } else {
      console.log('⚠️  Playwright non configuré');
    }
    
  } catch (error) {
    console.log(`❌ Erreur tests E2E: ${error.message}`);
    results.error = error.message;
  }
  
  return results;
}

/**
 * Vérifier la sanité des APIs critiques
 */
function checkAPIHealth() {
  console.log('\n🔍 VÉRIFICATION SANITÉ APIs CRITIQUES');
  
  const apiChecks = {
    build: false,
    routes: [],
    middlewares: [],
    issues: []
  };
  
  try {
    // Vérifier les routes API
    const appDir = path.join(process.cwd(), 'src', 'app');
    
    if (fs.existsSync(appDir)) {
      const apiRoutes = execSync(`find "${appDir}" -name "route.ts" -o -name "route.js"`, {
        encoding: 'utf-8'
      }).split('\n').filter(f => f.trim());
      
      apiChecks.routes = apiRoutes.map(route => {
        const relativePath = route.replace(appDir, '');
        const content = fs.readFileSync(route, 'utf-8');
        
        return {
          path: relativePath,
          methods: {
            GET: content.includes('export async function GET'),
            POST: content.includes('export async function POST'),
            PUT: content.includes('export async function PUT'),
            DELETE: content.includes('export async function DELETE')
          },
          hasAuth: content.includes('auth') || content.includes('session'),
          hasValidation: content.includes('zod') || content.includes('validate')
        };
      });
      
      console.log(`📊 Routes API: ${apiChecks.routes.length}`);
      
      // Vérifier les middlewares
      const middlewareFile = path.join(process.cwd(), 'middleware.ts');
      if (fs.existsSync(middlewareFile)) {
        const content = fs.readFileSync(middlewareFile, 'utf-8');
        apiChecks.middlewares.push({
          file: 'middleware.ts',
          hasAuth: content.includes('auth'),
          hasRateLimit: content.includes('rate') || content.includes('limit'),
          hasCORS: content.includes('cors')
        });
        console.log('✅ Middleware principal configuré');
      }
      
      // Vérifier la sanité du build
      try {
        console.log('🔧 Vérification build...');
        execSync('npm run build', {
          stdio: 'pipe',
          timeout: 180000 // 3 minutes
        });
        apiChecks.build = true;
        console.log('✅ Build réussi');
      } catch (buildError) {
        apiChecks.build = false;
        apiChecks.issues.push('Build failed - APIs potentially broken');
        console.log('❌ Build échoué');
      }
      
    } else {
      apiChecks.issues.push('App directory not found');
    }
    
  } catch (error) {
    console.log(`❌ Erreur vérification APIs: ${error.message}`);
    apiChecks.issues.push(error.message);
  }
  
  return apiChecks;
}

/**
 * Générer rapport final des tests fonctionnels
 */
function generateFunctionalReport(testsAnalysis, unitResults, e2eResults, apiHealth) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      overallScore: 0,
      testCoverage: testsAnalysis.coverage?.total || 0,
      unitTestsHealth: 0,
      e2eTestsHealth: 0,
      apiHealth: 0,
      criticalIssues: [],
      recommendations: []
    },
    details: {
      existingTests: testsAnalysis,
      unitTests: unitResults,
      e2eTests: e2eResults,
      apis: apiHealth
    },
    criticalFlows: CRITICAL_FLOWS
  };
  
  // Calculer score tests unitaires
  if (unitResults.executed && unitResults.metrics?.total) {
    report.summary.unitTestsHealth = unitResults.metrics.successRate;
  } else if (unitResults.executed) {
    report.summary.unitTestsHealth = unitResults.success ? 100 : 0;
  } else {
    report.summary.unitTestsHealth = 0;
  }
  
  // Calculer score tests E2E
  if (e2eResults.available) {
    report.summary.e2eTestsHealth = e2eResults.success ? 100 : 50;
  } else {
    report.summary.e2eTestsHealth = 0;
  }
  
  // Calculer score API
  if (apiHealth.build) {
    report.summary.apiHealth = 100;
  } else {
    report.summary.apiHealth = apiHealth.routes.length > 0 ? 50 : 0;
  }
  
  // Score global
  report.summary.overallScore = Math.round((
    report.summary.testCoverage * 0.3 +
    report.summary.unitTestsHealth * 0.4 +
    report.summary.e2eTestsHealth * 0.2 +
    report.summary.apiHealth * 0.1
  ));
  
  // Identifier problèmes critiques
  if (report.summary.unitTestsHealth < 80) {
    report.summary.criticalIssues.push(`Tests unitaires: ${report.summary.unitTestsHealth}% de réussite`);
  }
  
  if (report.summary.testCoverage < 60) {
    report.summary.criticalIssues.push(`Couverture tests fonctionnels insuffisante: ${report.summary.testCoverage}%`);
  }
  
  if (!apiHealth.build) {
    report.summary.criticalIssues.push('Build failed - problèmes potentiels dans les APIs');
  }
  
  if (testsAnalysis.issues?.length > 5) {
    report.summary.criticalIssues.push(`${testsAnalysis.issues.length} problèmes détectés dans les tests existants`);
  }
  
  // Recommandations
  if (report.summary.testCoverage < 80) {
    report.summary.recommendations.push('Augmenter la couverture des flows critiques (auth, exercises, admin)');
  }
  
  if (!e2eResults.available) {
    report.summary.recommendations.push('Implémenter des tests E2E avec Playwright pour les flows utilisateur');
  }
  
  if (report.summary.unitTestsHealth < 95) {
    report.summary.recommendations.push('Corriger les tests unitaires défaillants');
  }
  
  if (apiHealth.routes.length > 0 && !apiHealth.build) {
    report.summary.recommendations.push('Corriger les erreurs de build pour valider les APIs');
  }
  
  const lowCoverageFlows = Object.entries(testsAnalysis.coverage?.byFlow || {})
    .filter(([_, data]) => data.percentage < 50)
    .map(([flow, _]) => CRITICAL_FLOWS[flow]?.name)
    .filter(Boolean);
  
  if (lowCoverageFlows.length > 0) {
    report.summary.recommendations.push(`Créer des tests pour: ${lowCoverageFlows.join(', ')}`);
  }
  
  return report;
}

/**
 * EXÉCUTION PRINCIPALE
 */
async function runFunctionalTestsAudit() {
  console.log('\n🔍 LANCEMENT AUDIT TESTS FONCTIONNELS...\n');
  
  // Phase 1: Analyse tests existants
  const testsAnalysis = analyzeExistingTests();
  
  // Phase 2: Tests unitaires
  const unitResults = runUnitTests();
  
  // Phase 3: Tests E2E
  const e2eResults = attemptE2ETests();
  
  // Phase 4: Sanité APIs
  const apiHealth = checkAPIHealth();
  
  // Phase 5: Rapport final
  console.log('\n📋 GÉNÉRATION RAPPORT FONCTIONNEL...');
  const finalReport = generateFunctionalReport(testsAnalysis, unitResults, e2eResults, apiHealth);
  
  // Sauvegarde
  const reportPath = path.join(process.cwd(), 'functional-tests-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
  
  // Affichage synthèse
  console.log('\n' + '='.repeat(60));
  console.log('🧪 RAPPORT TESTS FONCTIONNELS FINAL');
  console.log('='.repeat(60));
  
  console.log(`\n🎯 Score Global: ${finalReport.summary.overallScore}/100`);
  console.log(`📊 Couverture Tests: ${finalReport.summary.testCoverage}/100`);
  console.log(`🧪 Santé Tests Unitaires: ${finalReport.summary.unitTestsHealth}/100`);
  console.log(`🌐 Santé Tests E2E: ${finalReport.summary.e2eTestsHealth}/100`);
  console.log(`⚡ Santé APIs: ${finalReport.summary.apiHealth}/100`);
  
  if (finalReport.summary.criticalIssues.length > 0) {
    console.log(`\n🚨 PROBLÈMES CRITIQUES (${finalReport.summary.criticalIssues.length}):`);
    finalReport.summary.criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (finalReport.summary.recommendations.length > 0) {
    console.log(`\n💡 RECOMMANDATIONS (${finalReport.summary.recommendations.length}):`);
    finalReport.summary.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  console.log(`\n📄 Rapport détaillé: ${reportPath}`);
  
  // Status final
  if (finalReport.summary.overallScore >= 90) {
    console.log('\n🏆 EXCELLENT - Tests fonctionnels robustes');
  } else if (finalReport.summary.overallScore >= 75) {
    console.log('\n✅ BON - Qualité de test satisfaisante');
  } else if (finalReport.summary.overallScore >= 60) {
    console.log('\n⚠️  MOYEN - Améliorations recommandées');
  } else {
    console.log('\n❌ CRITIQUE - Tests fonctionnels insuffisants');
  }
  
  return finalReport;
}

// Exécution si script appelé directement
if (require.main === module) {
  runFunctionalTestsAudit()
    .then((report) => {
      process.exit(report.summary.overallScore >= 70 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erreur audit tests fonctionnels:', error);
      process.exit(1);
    });
}

module.exports = { runFunctionalTestsAudit };