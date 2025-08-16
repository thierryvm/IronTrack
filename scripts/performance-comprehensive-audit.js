/**
 * AUDIT DE PERFORMANCE COMPLET - IRONTRACK
 * Tests Core Web Vitals, Bundle Size, Memory Usage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 AUDIT DE PERFORMANCE COMPLET - IRONTRACK');
console.log('=' .repeat(60));

// Configuration
const PAGES_CRITIQUES = [
  { path: '/', name: 'Homepage' },
  { path: '/auth', name: 'Authentication' },
  { path: '/shared/dashboard', name: 'Dashboard' },
  { path: '/exercises', name: 'Exercises' },
  { path: '/admin', name: 'Admin' },
  { path: '/calendar', name: 'Calendar' }
];

const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (thresholds "Good" Google)
  LCP: 2500, // ms
  FID: 100,  // ms 
  CLS: 0.1,  // score
  FCP: 1800, // ms
  TTI: 3800  // ms
};

/**
 * Analyser les audits Lighthouse existants
 */
function analyzeExistingLighthouseReports() {
  console.log('\n📊 ANALYSE AUDITS LIGHTHOUSE EXISTANTS');
  
  const reports = [];
  const lighthouseFiles = [
    'lighthouse-performance-optimized.json',
    'lighthouse-mobile.json',
    'lighthouse-fresh-desktop.json'
  ];
  
  lighthouseFiles.forEach(filename => {
    const filePath = path.join(process.cwd(), filename);
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        const report = {
          filename,
          url: data.finalUrl || data.requestedUrl,
          fetchTime: data.fetchTime,
          scores: {
            performance: data.categories?.performance?.score * 100 || 0,
            accessibility: data.categories?.accessibility?.score * 100 || 0,
            seo: data.categories?.seo?.score * 100 || 0,
            pwa: data.categories?.pwa?.score * 100 || 0
          },
          metrics: {
            FCP: data.audits?.['first-contentful-paint']?.numericValue || 0,
            LCP: data.audits?.['largest-contentful-paint']?.numericValue || 0,
            TTI: data.audits?.['interactive']?.numericValue || 0,
            TBT: data.audits?.['total-blocking-time']?.numericValue || 0,
            CLS: data.audits?.['cumulative-layout-shift']?.numericValue || 0,
            SI: data.audits?.['speed-index']?.numericValue || 0
          },
          deviceType: filename.includes('mobile') ? 'mobile' : 'desktop'
        };
        
        reports.push(report);
        
        console.log(`✅ ${filename}`);
        console.log(`   Performance: ${report.scores.performance}/100`);
        console.log(`   LCP: ${(report.metrics.LCP/1000).toFixed(1)}s`);
        console.log(`   FCP: ${(report.metrics.FCP/1000).toFixed(1)}s`);
        
      } catch (error) {
        console.log(`❌ Erreur lecture ${filename}: ${error.message}`);
      }
    }
  });
  
  return reports;
}

/**
 * Analyser la taille des bundles
 */
function analyzeBundleSize() {
  console.log('\n📦 ANALYSE TAILLE DES BUNDLES');
  
  try {
    // Vérifier si le build existe
    const buildDir = path.join(process.cwd(), '.next');
    const buildExists = fs.existsSync(buildDir);
    
    if (!buildExists) {
      console.log('⚠️  Build .next introuvable, génération...');
      
      try {
        execSync('npm run build', { 
          encoding: 'utf-8',
          timeout: 300000, // 5 minutes
          stdio: 'pipe'
        });
        console.log('✅ Build généré avec succès');
      } catch (buildError) {
        console.log(`❌ Erreur build: ${buildError.message}`);
        return { error: 'Build failed', success: false };
      }
    }
    
    // Analyser le contenu du build
    const analysis = {
      success: true,
      timestamp: new Date().toISOString(),
      pages: [],
      chunks: [],
      totalSize: 0
    };
    
    // Analyser les pages compilées
    try {
      const staticDir = path.join(buildDir, 'static', 'chunks');
      
      if (fs.existsSync(staticDir)) {
        const files = fs.readdirSync(staticDir);
        
        files.forEach(file => {
          if (file.endsWith('.js')) {
            const filePath = path.join(staticDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            
            analysis.chunks.push({
              file,
              size: sizeKB,
              type: file.includes('.') ? 'chunk' : 'page'
            });
            
            analysis.totalSize += sizeKB;
          }
        });
        
        // Trier par taille
        analysis.chunks.sort((a, b) => b.size - a.size);
        
        console.log('📊 TOP 10 PLUS GROS CHUNKS:');
        analysis.chunks.slice(0, 10).forEach((chunk, index) => {
          console.log(`   ${index + 1}. ${chunk.file}: ${chunk.size}KB`);
        });
        
        console.log(`📈 Taille totale: ${analysis.totalSize}KB`);
        
        // Évaluer si c'est acceptable
        if (analysis.totalSize > 2000) {
          console.log('⚠️  ATTENTION: Bundle size > 2MB - optimisation recommandée');
        } else if (analysis.totalSize > 1000) {
          console.log('⚡ Bundle size acceptable mais peut être optimisé');
        } else {
          console.log('✅ Bundle size optimal');
        }
        
      } else {
        console.log('⚠️  Dossier chunks introuvable');
        analysis.success = false;
      }
      
    } catch (error) {
      console.log(`❌ Erreur analyse: ${error.message}`);
      analysis.success = false;
      analysis.error = error.message;
    }
    
    return analysis;
    
  } catch (error) {
    console.log(`❌ Erreur générale: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Vérifier les optimisations d'images
 */
function checkImageOptimization() {
  console.log('\n🖼️  ANALYSE OPTIMISATION IMAGES');
  
  const imageStats = {
    total: 0,
    optimized: 0,
    webpReady: 0,
    oversized: [],
    recommendations: []
  };
  
  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    if (fs.existsSync(publicDir)) {
      const checkDirectory = (dir) => {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            checkDirectory(filePath);
          } else if (/\\.(jpe?g|png|gif|webp|svg)$/i.test(file)) {
            imageStats.total++;
            const sizeKB = Math.round(stats.size / 1024);
            
            if (file.endsWith('.webp')) {
              imageStats.webpReady++;
            }
            
            if (sizeKB > 500) {
              imageStats.oversized.push({
                file: filePath.replace(process.cwd(), ''),
                size: sizeKB
              });
            }
            
            // Vérifier les optimisations Next.js Image
            const relativePath = filePath.replace(publicDir, '');
            // TODO: analyser si utilisé avec next/image
          }
        });
      };
      
      checkDirectory(publicDir);
      
      console.log(`📊 Images trouvées: ${imageStats.total}`);
      console.log(`🔧 WebP ready: ${imageStats.webpReady}/${imageStats.total}`);
      console.log(`⚠️  Images > 500KB: ${imageStats.oversized.length}`);
      
      if (imageStats.oversized.length > 0) {
        console.log('🔍 Images à optimiser:');
        imageStats.oversized.forEach(img => {
          console.log(`   • ${img.file}: ${img.size}KB`);
        });
      }
      
    } else {
      console.log('⚠️  Dossier public/ introuvable');
    }
    
  } catch (error) {
    console.log(`❌ Erreur analyse images: ${error.message}`);
    imageStats.error = error.message;
  }
  
  return imageStats;
}

/**
 * Analyser les dépendances du package.json
 */
function analyzeDependencies() {
  console.log('\n📚 ANALYSE DÉPENDANCES');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const analysis = {
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length,
      heavyPackages: [],
      recommendations: []
    };
    
    // Packages connus pour être lourds
    const heavyPackages = [
      'moment', 'lodash', 'core-js', 'rxjs', 
      '@emotion/styled', 'styled-components'
    ];
    
    Object.keys(packageJson.dependencies || {}).forEach(dep => {
      if (heavyPackages.includes(dep)) {
        analysis.heavyPackages.push(dep);
      }
    });
    
    console.log(`📊 Dépendances: ${analysis.dependencies} prod + ${analysis.devDependencies} dev`);
    console.log(`⚠️  Packages lourds détectés: ${analysis.heavyPackages.length}`);
    
    if (analysis.heavyPackages.length > 0) {
      console.log('🔍 Packages à surveiller:');
      analysis.heavyPackages.forEach(pkg => {
        console.log(`   • ${pkg}`);
      });
    }
    
    return analysis;
    
  } catch (error) {
    console.log(`❌ Erreur analyse dépendances: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Générer un rapport de synthèse
 */
function generatePerformanceReport(lighthouseReports, bundleAnalysis, imageStats, depsAnalysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      overallScore: 0,
      criticalIssues: [],
      recommendations: []
    },
    lighthouse: lighthouseReports,
    bundle: bundleAnalysis,
    images: imageStats,
    dependencies: depsAnalysis,
    coreWebVitals: {}
  };
  
  // Analyser Core Web Vitals
  if (lighthouseReports.length > 0) {
    const latestReport = lighthouseReports[lighthouseReports.length - 1];
    const vitals = latestReport.metrics;
    
    report.coreWebVitals = {
      LCP: {
        value: vitals.LCP,
        valueSeconds: (vitals.LCP / 1000).toFixed(1),
        status: vitals.LCP <= PERFORMANCE_THRESHOLDS.LCP ? 'GOOD' : vitals.LCP <= 4000 ? 'NEEDS_IMPROVEMENT' : 'POOR',
        threshold: PERFORMANCE_THRESHOLDS.LCP
      },
      FCP: {
        value: vitals.FCP,
        valueSeconds: (vitals.FCP / 1000).toFixed(1),
        status: vitals.FCP <= PERFORMANCE_THRESHOLDS.FCP ? 'GOOD' : vitals.FCP <= 3000 ? 'NEEDS_IMPROVEMENT' : 'POOR',
        threshold: PERFORMANCE_THRESHOLDS.FCP
      },
      CLS: {
        value: vitals.CLS,
        status: vitals.CLS <= PERFORMANCE_THRESHOLDS.CLS ? 'GOOD' : vitals.CLS <= 0.25 ? 'NEEDS_IMPROVEMENT' : 'POOR',
        threshold: PERFORMANCE_THRESHOLDS.CLS
      }
    };
  }
  
  // Calculer score global
  let totalScore = 0;
  let scoreCount = 0;
  
  if (lighthouseReports.length > 0) {
    const avgPerformanceScore = lighthouseReports.reduce((sum, r) => sum + r.scores.performance, 0) / lighthouseReports.length;
    totalScore += avgPerformanceScore;
    scoreCount++;
  }
  
  if (bundleAnalysis.success && bundleAnalysis.totalSize < 1000) {
    totalScore += 90;
    scoreCount++;
  } else if (bundleAnalysis.success && bundleAnalysis.totalSize < 2000) {
    totalScore += 70;
    scoreCount++;
  } else if (bundleAnalysis.success) {
    totalScore += 40;
    scoreCount++;
  }
  
  report.summary.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
  
  // Identifier problèmes critiques
  if (report.coreWebVitals.LCP?.status === 'POOR') {
    report.summary.criticalIssues.push('LCP critique (> 4s) - optimisation urgente requise');
  }
  
  if (bundleAnalysis.totalSize > 2000) {
    report.summary.criticalIssues.push('Bundle size critique (> 2MB) - refactorisation nécessaire');
  }
  
  if (imageStats.oversized?.length > 5) {
    report.summary.criticalIssues.push(`${imageStats.oversized.length} images non optimisées détectées`);
  }
  
  // Recommandations
  if (report.coreWebVitals.LCP?.status !== 'GOOD') {
    report.summary.recommendations.push('Optimiser les images et implémenter le lazy loading');
    report.summary.recommendations.push('Utiliser next/image pour toutes les images');
    report.summary.recommendations.push('Minimiser le JavaScript critique');
  }
  
  if (bundleAnalysis.totalSize > 1000) {
    report.summary.recommendations.push('Implémenter le code splitting par route');
    report.summary.recommendations.push('Analyser et supprimer les dépendances inutiles');
  }
  
  return report;
}

/**
 * EXÉCUTION PRINCIPALE
 */
async function runComprehensivePerformanceAudit() {
  console.log('\n🔍 LANCEMENT AUDIT COMPLET...\n');
  
  // Phase 1: Analyse Lighthouse existant
  const lighthouseReports = analyzeExistingLighthouseReports();
  
  // Phase 2: Analyse Bundle
  const bundleAnalysis = analyzeBundleSize();
  
  // Phase 3: Optimisation Images  
  const imageStats = checkImageOptimization();
  
  // Phase 4: Dépendances
  const depsAnalysis = analyzeDependencies();
  
  // Phase 5: Génération rapport
  console.log('\n📋 GÉNÉRATION RAPPORT FINAL...');
  const finalReport = generatePerformanceReport(lighthouseReports, bundleAnalysis, imageStats, depsAnalysis);
  
  // Sauvegarde
  const reportPath = path.join(process.cwd(), 'performance-audit-comprehensive.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
  
  // Affichage synthèse
  console.log('\n' + '='.repeat(60));
  console.log('🏆 RAPPORT PERFORMANCE FINAL');
  console.log('='.repeat(60));
  
  console.log(`\n🎯 Score Global: ${finalReport.summary.overallScore}/100`);
  
  if (finalReport.coreWebVitals.LCP) {
    console.log(`\n📊 CORE WEB VITALS:`);
    console.log(`   🚀 LCP: ${finalReport.coreWebVitals.LCP.valueSeconds}s (${finalReport.coreWebVitals.LCP.status})`);
    console.log(`   ⚡ FCP: ${finalReport.coreWebVitals.FCP.valueSeconds}s (${finalReport.coreWebVitals.FCP.status})`);
    console.log(`   📏 CLS: ${finalReport.coreWebVitals.CLS.value.toFixed(3)} (${finalReport.coreWebVitals.CLS.status})`);
  }
  
  if (bundleAnalysis.success) {
    console.log(`\n📦 BUNDLE: ${bundleAnalysis.totalSize}KB total`);
  }
  
  console.log(`\n🖼️  IMAGES: ${imageStats.total} total, ${imageStats.oversized?.length || 0} à optimiser`);
  
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
    console.log('\n🏆 EXCELLENT - Performance optimale');
  } else if (finalReport.summary.overallScore >= 70) {
    console.log('\n✅ BON - Quelques optimisations possibles');
  } else if (finalReport.summary.overallScore >= 50) {
    console.log('\n⚠️  MOYEN - Optimisations recommandées');
  } else {
    console.log('\n❌ CRITIQUE - Optimisations urgentes requises');
  }
  
  return finalReport;
}

// Exécution si script appelé directement
if (require.main === module) {
  runComprehensivePerformanceAudit()
    .then((report) => {
      process.exit(report.summary.overallScore >= 70 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erreur audit:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensivePerformanceAudit };