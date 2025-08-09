// Script de test de performance - Mesure des améliorations LCP
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Test de Performance IronTrack - Next.js 15.3.5');
console.log('================================================\n');

// 1. Analyser le bundle actuel
console.log('📊 1. Analyse du bundle...');
try {
  execSync('npm run build:analyze', { stdio: 'inherit' });
  console.log('✅ Analyse du bundle terminée. Vérifiez ./bundle-analysis.html\n');
} catch (error) {
  console.log('⚠️  Bundle analyzer non disponible, continuer...\n');
}

// 2. Construire le projet
console.log('🔧 2. Construction du projet...');
try {
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  
  // Extraire les métriques du build
  const sizeRegex = /First Load JS shared by all\s+(\d+(?:\.\d+)?)\s*(\w+)/;
  const match = buildOutput.match(sizeRegex);
  
  if (match) {
    const size = parseFloat(match[1]);
    const unit = match[2];
    console.log(`✅ Build terminé. Taille initiale JS: ${size} ${unit}\n`);
    
    // Avertissement si trop volumineux
    if (unit === 'kB' && size > 250) {
      console.log('⚠️  ATTENTION: Bundle initial > 250kB - Risque LCP élevé');
    } else {
      console.log('✅ Bundle initial optimisé pour LCP rapide');
    }
  }
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}

// 3. Vérifications des optimisations
console.log('\n🔍 3. Vérification des optimisations...');

const optimizations = [
  {
    name: 'Configuration browserslist moderne',
    check: () => fs.existsSync('.browserslistrc'),
    desc: 'Élimine polyfills ES6+ inutiles'
  },
  {
    name: 'Bundle analyzer configuré',
    check: () => {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
      return nextConfig.includes('BundleAnalyzerPlugin');
    },
    desc: 'Analyse des bundles activée'
  },
  {
    name: 'Tree shaking optimisé',
    check: () => {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
      return nextConfig.includes('optimizePackageImports');
    },
    desc: 'Imports optimisés pour libraries lourdes'
  },
  {
    name: 'SWC Minify activé',
    check: () => {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
      return nextConfig.includes('swcMinify: true');
    },
    desc: 'Minification Rust ultra-rapide'
  },
  {
    name: 'Lazy loading implémenté',
    check: () => {
      const homePage = fs.readFileSync('src/app/page.tsx', 'utf8');
      return homePage.includes('lazy(') && homePage.includes('Suspense');
    },
    desc: 'Composants lourds en lazy loading'
  }
];

optimizations.forEach(opt => {
  const status = opt.check() ? '✅' : '❌';
  console.log(`${status} ${opt.name}: ${opt.desc}`);
});

// 4. Recommandations supplémentaires
console.log('\n💡 4. Recommandations supplémentaires pour LCP:');
console.log('   • Utiliser `npm run build:analyze` pour surveiller les bundles');
console.log('   • Tester avec Lighthouse: `npm run perf:lighthouse`');
console.log('   • Vérifier les Core Web Vitals sur https://pagespeed.web.dev/');
console.log('   • Considérer le preloading pour les fonts critiques');
console.log('   • Optimiser les images avec next/image et priority={true}');

// 5. Métriques attendues après optimisation
console.log('\n🎯 5. Objectifs de performance après optimisation:');
console.log('   • LCP: < 2.5s (actuellement 6.3s)');
console.log('   • Bundle initial: < 200kB (réduction de ~250kB attendue)');
console.log('   • Polyfills ES6+: Éliminés (~19kB économisés)');
console.log('   • FCP: < 1.8s');
console.log('   • TTI: < 3.8s');

console.log('\n🚀 Test terminé! Déployez et mesurez avec des outils réels.');
console.log('   Commandes utiles:');
console.log('   - npm run build:analyze  # Analyser les bundles');
console.log('   - npm run perf:lighthouse # Test Lighthouse local');
console.log('   - vercel --prod          # Déployer en production');