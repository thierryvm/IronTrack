/**
 * Script d'audit de performance mobile
 * Analyse les Core Web Vitals spécifiquement pour mobile
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 IRONTRACK - AUDIT PERFORMANCE MOBILE 2025');
console.log('=' .repeat(60));

// Analyser le build output
function analyzeBuildOutput() {
  const buildDir = path.join(__dirname, '../.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    return;
  }

  console.log('📊 ANALYSE DU BUILD PRODUCTION');
  console.log('-'.repeat(40));
  
  // Analyser les chunks JavaScript
  const staticDir = path.join(buildDir, 'static/chunks');
  if (fs.existsSync(staticDir)) {
    const chunks = fs.readdirSync(staticDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const stat = fs.statSync(path.join(staticDir, file));
        return { name: file, size: stat.size };
      })
      .sort((a, b) => b.size - a.size);

    console.log('🔍 TOP CHUNKS BY SIZE:');
    chunks.slice(0, 10).forEach((chunk, i) => {
      const sizeKB = (chunk.size / 1024).toFixed(1);
      console.log(`${i+1}. ${chunk.name}: ${sizeKB} KB`);
    });
    
    const totalSize = chunks.reduce((acc, chunk) => acc + chunk.size, 0);
    console.log(`\n📦 TOTAL BUNDLE SIZE: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }
}

// Recommandations performance mobile
function mobilePerformanceRecommendations() {
  console.log('\n🚀 RECOMMANDATIONS PERFORMANCE MOBILE');
  console.log('-'.repeat(40));
  
  const recommendations = [
    '📱 VIEWPORT: viewport-fit=cover pour safe areas',
    '🎯 TOUCH TARGETS: 44px minimum (48px recommandé)', 
    '⚡ 3G PERFORMANCE: < 3s LCP sur 3G Fast',
    '🔋 BATTERY: Éviter animations coûteuses',
    '📶 OFFLINE: Service Worker pour cache strategy',
    '🎨 CONTRAST: 4.5:1 minimum WCAG AA',
    '♿ A11Y: Focus visible sur navigation tactile',
    '🏎️ CODE SPLITTING: Route-based pour réduire FCP'
  ];
  
  recommendations.forEach(rec => console.log(`✅ ${rec}`));
}

// Checklist Core Web Vitals mobile
function mobileWebVitalsChecklist() {
  console.log('\n📊 CORE WEB VITALS MOBILE - CHECKLIST');
  console.log('-'.repeat(40));
  
  const vitals = [
    { metric: 'LCP (Mobile)', target: '< 2.5s', status: '⏱️  À mesurer' },
    { metric: 'FID (Mobile)', target: '< 100ms', status: '⏱️  À mesurer' },
    { metric: 'CLS (Mobile)', target: '< 0.1', status: '✅ Skeleton UI' },
    { metric: 'INP (Mobile)', target: '< 200ms', status: '⏱️  À mesurer' },
    { metric: 'TTFB (Mobile)', target: '< 600ms', status: '✅ Edge Runtime' },
  ];
  
  vitals.forEach(vital => {
    console.log(`${vital.status} ${vital.metric}: ${vital.target}`);
  });
  
  console.log('\n🔧 POUR MESURER EN PRODUCTION:');
  console.log('1. Chrome DevTools > Lighthouse (Mobile)');
  console.log('2. PageSpeed Insights Mobile');
  console.log('3. WebPageTest.org avec device mobile');
  console.log('4. Real User Monitoring (Vercel Analytics)');
}

// Tests automatiques suggérés
function suggestAutomatedTests() {
  console.log('\n🧪 TESTS AUTOMATIQUES MOBILE');
  console.log('-'.repeat(40));
  
  const tests = [
    'npm audit --production (sécurité)',
    'lighthouse-ci --preset=mobile',
    'bundlesize check (< 250KB First Load)',
    'accessibility audit (axe-core)',
    'visual regression (Percy/Chromatic)'
  ];
  
  tests.forEach(test => console.log(`🔬 ${test}`));
}

// Exécuter tous les audits
async function main() {
  analyzeBuildOutput();
  mobilePerformanceRecommendations();
  mobileWebVitalsChecklist();
  suggestAutomatedTests();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 AUDIT TERMINÉ - Prêt pour tests mobiles manuels');
  console.log('💡 Utilisez Chrome DevTools Device Mode pour simuler mobile');
  console.log('🚀 Déployez sur Vercel pour mesures réelles sur appareils');
}

main().catch(console.error);