#!/usr/bin/env node

/**
 * ⚡ Vérificateur Performance Final - IronTrack 2025
 * 
 * Évalue les optimisations performance post-migration:
 * - Bundle sizes
 * - Lazy loading
 * - Image optimization
 * - Core Web Vitals readiness
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ AUDIT PERFORMANCE FINAL IRONTRACK');
console.log('===================================');

const PERFORMANCE_CHECKS = [
  {
    name: 'Lazy Loading Components',
    check: () => {
      const files = ['src/app/page.tsx', 'src/app/profile/page.tsx'];
      const lazyComponents = [];
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const dynamicImports = content.match(/dynamic\s*\(\s*\(\)\s*=>\s*import\([^)]+\)/g) || [];
          const suspenseUsage = content.includes('<Suspense');
          
          lazyComponents.push({
            file,
            dynamicImports: dynamicImports.length,
            suspense: suspenseUsage
          });
        }
      });
      
      return lazyComponents;
    }
  },
  {
    name: 'Image Optimization',
    check: () => {
      const imageFiles = [];
      const nextImageUsage = [];
      
      function scanForImages(dir) {
        const entries = fs.readdirSync(dir);
        
        entries.forEach(entry => {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
            scanForImages(fullPath);
          } else if (stat.isFile() && fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('next/image')) {
              nextImageUsage.push(path.relative('.', fullPath));
            }
          }
        });
      }
      
      scanForImages('./src');
      
      return {
        nextImageFiles: nextImageUsage.length,
        optimizedUsage: nextImageUsage
      };
    }
  },
  {
    name: 'CLS Prevention',
    check: () => {
      const clsOptimizations = [];
      const files = ['src/app/page.tsx', 'src/app/profile/page.tsx'];
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          const hasSkeletons = content.includes('animate-pulse') || content.includes('skeleton');
          const hasDimensions = content.includes('min-h-') || content.includes('min-w-');
          const hasPlaceholders = content.includes('placeholder') || content.includes('fallback');
          
          clsOptimizations.push({
            file: path.relative('.', file),
            skeletons: hasSkeletons,
            dimensions: hasDimensions,
            placeholders: hasPlaceholders
          });
        }
      });
      
      return clsOptimizations;
    }
  },
  {
    name: 'Bundle Analysis',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies || {}).length;
      const devDependencies = Object.keys(packageJson.devDependencies || {}).length;
      
      // Vérifier les imports lourds
      const heavyImports = [];
      if (fs.existsSync('./src/app/page.tsx')) {
        const content = fs.readFileSync('./src/app/page.tsx', 'utf8');
        const imports = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
        
        imports.forEach(imp => {
          if (imp.includes('framer-motion') || imp.includes('recharts') || imp.includes('chart')) {
            heavyImports.push(imp);
          }
        });
      }
      
      return {
        dependencies,
        devDependencies,
        heavyImports
      };
    }
  }
];

console.log('🔍 Analyse des optimisations performance...\n');

PERFORMANCE_CHECKS.forEach(check => {
  console.log(`📊 ${check.name}:`);
  const result = check.check();
  
  switch (check.name) {
    case 'Lazy Loading Components':
      result.forEach(comp => {
        console.log(`  📁 ${comp.file}:`);
        console.log(`    ✅ Dynamic imports: ${comp.dynamicImports}`);
        console.log(`    ${comp.suspense ? '✅' : '❌'} Suspense: ${comp.suspense ? 'Oui' : 'Non'}`);
      });
      break;
      
    case 'Image Optimization':
      console.log(`  ✅ Fichiers utilisant next/image: ${result.nextImageFiles}`);
      if (result.nextImageFiles > 0) {
        console.log(`  🎯 Images optimisées détectées`);
      }
      break;
      
    case 'CLS Prevention':
      result.forEach(opt => {
        console.log(`  📁 ${opt.file}:`);
        console.log(`    ${opt.skeletons ? '✅' : '❌'} Skeletons: ${opt.skeletons ? 'Oui' : 'Non'}`);
        console.log(`    ${opt.dimensions ? '✅' : '❌'} Dimensions fixes: ${opt.dimensions ? 'Oui' : 'Non'}`);
        console.log(`    ${opt.placeholders ? '✅' : '❌'} Placeholders: ${opt.placeholders ? 'Oui' : 'Non'}`);
      });
      break;
      
    case 'Bundle Analysis':
      console.log(`  📦 Dependencies: ${result.dependencies}`);
      console.log(`  🛠️ Dev dependencies: ${result.devDependencies}`);
      console.log(`  ⚠️ Heavy imports détectés: ${result.heavyImports.length}`);
      if (result.heavyImports.length > 0) {
        result.heavyImports.forEach(imp => {
          console.log(`    📚 ${imp}`);
        });
      }
      break;
  }
  console.log('');
});

// Vérification des optimisations spécifiques IronTrack
console.log('🎯 OPTIMISATIONS IRONTRACK SPÉCIFIQUES:');

const ironTrackOptimizations = [
  {
    name: 'Critical CSS Extractor',
    file: './src/components/CriticalCSSExtractor.tsx',
    present: fs.existsSync('./src/components/CriticalCSSExtractor.tsx')
  },
  {
    name: 'Performance Image Optimizer',
    file: './src/components/PerformanceImageOptimizer.tsx',
    present: fs.existsSync('./src/components/PerformanceImageOptimizer.tsx')
  },
  {
    name: 'Motion Wrapper Optimisé',
    file: './src/components/ui/MotionWrapper.tsx',
    present: fs.existsSync('./src/components/ui/MotionWrapper.tsx')
  },
  {
    name: 'CLS Container',
    file: './src/components/ui/CLSContainer.tsx',
    present: fs.existsSync('./src/components/ui/CLSContainer.tsx')
  }
];

ironTrackOptimizations.forEach(opt => {
  console.log(`${opt.present ? '✅' : '❌'} ${opt.name}: ${opt.present ? 'Actif' : 'Manquant'}`);
});

console.log('\n⚡ SCORE PERFORMANCE ESTIMÉ:');

let score = 0;
const maxScore = 100;

// Scoring basé sur les optimisations détectées
if (fs.existsSync('./src/components/CriticalCSSExtractor.tsx')) score += 20;
if (fs.existsSync('./src/components/PerformanceImageOptimizer.tsx')) score += 15;
if (fs.existsSync('./src/components/ui/CLSContainer.tsx')) score += 15;

// Bonus pour lazy loading
const pageContent = fs.existsSync('./src/app/page.tsx') ? 
  fs.readFileSync('./src/app/page.tsx', 'utf8') : '';
if (pageContent.includes('dynamic(')) score += 20;
if (pageContent.includes('Suspense')) score += 10;
if (pageContent.includes('animate-pulse')) score += 10;

// Bonus pour optimisations images
if (pageContent.includes('next/image')) score += 10;

console.log(`📊 Score Performance: ${Math.min(score, maxScore)}/100`);

if (score >= 90) {
  console.log('🎉 EXCELLENT - Performance optimale');
} else if (score >= 75) {
  console.log('👍 BON - Performance satisfaisante');
} else if (score >= 60) {
  console.log('⚠️ MOYEN - Améliorations possibles');
} else {
  console.log('🚨 FAIBLE - Optimisations nécessaires');
}

console.log('\n🚀 RECOMMANDATIONS PRODUCTION:');
console.log('✅ Utiliser next build pour production');
console.log('✅ Activer la compression gzip/brotli');
console.log('✅ CDN pour assets statiques');
console.log('✅ Cache headers appropriés');
console.log('✅ Monitoring Core Web Vitals');
console.log('✅ Lighthouse CI dans la pipeline');

const buildExists = fs.existsSync('./.next');
console.log(`\n📦 Build Status: ${buildExists ? '✅ Build présent' : '❌ Pas de build'}`);
if (buildExists) {
  console.log('🎯 Application prête pour déploiement production');
}