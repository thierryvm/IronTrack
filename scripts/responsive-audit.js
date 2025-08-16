/**
 * AUDIT RESPONSIVE DESIGN & TOUCH TARGETS - IRONTRACK
 * Validation des viewports et ergonomie mobile
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📱 AUDIT RESPONSIVE DESIGN & TOUCH TARGETS');
console.log('=' .repeat(60));

// Viewports standards à tester
const VIEWPORTS = {
  mobile: {
    small: { width: 375, height: 667, name: 'iPhone SE' },
    medium: { width: 390, height: 844, name: 'iPhone 12' },
    large: { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
  },
  tablet: {
    portrait: { width: 768, height: 1024, name: 'iPad Portrait' },
    landscape: { width: 1024, height: 768, name: 'iPad Landscape' }
  },
  desktop: {
    small: { width: 1200, height: 800, name: 'Desktop Small' },
    medium: { width: 1440, height: 900, name: 'Desktop Medium' },
    large: { width: 1920, height: 1080, name: 'Desktop Large' }
  }
};

// Standards touch targets (WCAG 2.1 AA)
const TOUCH_STANDARDS = {
  minSize: 44, // pixels minimum 
  recommended: 56, // pixels recommandé Android
  spacing: 8 // espacement minimum
};

/**
 * Analyser les classes CSS Tailwind pour responsive
 */
function analyzeResponsiveCSS() {
  console.log('\n🎨 ANALYSE CSS RESPONSIVE (Tailwind)');
  
  const analysis = {
    filesScanned: 0,
    responsiveClasses: {
      sm: 0, // 640px+
      md: 0, // 768px+
      lg: 0, // 1024px+
      xl: 0, // 1280px+
      '2xl': 0 // 1536px+
    },
    potentialIssues: [],
    touchTargets: {
      tooSmall: [],
      appropriate: []
    }
  };
  
  try {
    const srcDir = path.join(process.cwd(), 'src');
    const files = execSync(`find "${srcDir}" -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf-8' }).split('\n');
    
    files.forEach(file => {
      if (!file.trim()) return;
      
      try {
        const content = fs.readFileSync(file, 'utf-8');
        analysis.filesScanned++;
        
        // Analyser les classes responsive
        const responsiveRegex = /(sm:|md:|lg:|xl:|2xl:)[\\w-]+/g;
        const matches = content.match(responsiveRegex) || [];
        
        matches.forEach(match => {
          const prefix = match.split(':')[0];
          if (analysis.responsiveClasses[prefix] !== undefined) {
            analysis.responsiveClasses[prefix]++;
          }
        });
        
        // Détecter les tailles potentiellement problématiques pour le touch
        const smallSizes = [
          'w-4', 'h-4', 'w-6', 'h-6', 'w-8', 'h-8', // 16px, 24px, 32px
          'p-1', 'p-2', 'm-1', 'm-2', // padding/margin trop petits
          'text-xs', 'text-sm' // texte trop petit
        ];
        
        smallSizes.forEach(size => {
          if (content.includes(size)) {
            // Vérifier le contexte (si c'est un bouton/lien)
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes(size) && (line.includes('button') || line.includes('onClick') || line.includes('<a'))) {
                analysis.touchTargets.tooSmall.push({
                  file: file.replace(process.cwd(), ''),
                  line: index + 1,
                  class: size,
                  context: line.trim().substring(0, 100)
                });
              }
            });
          }
        });
        
        // Détecter les bonnes pratiques touch
        const goodSizes = [
          'h-11', 'h-12', 'h-14', // 44px+, 48px+, 56px+ 
          'w-11', 'w-12', 'w-14',
          'p-3', 'p-4', 'px-4', 'py-3' // padding approprié
        ];
        
        goodSizes.forEach(size => {
          if (content.includes(size)) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes(size) && (line.includes('button') || line.includes('onClick'))) {
                analysis.touchTargets.appropriate.push({
                  file: file.replace(process.cwd(), ''),
                  line: index + 1,
                  class: size
                });
              }
            });
          }
        });
        
        // Détecter les media queries custom (non-Tailwind)
        if (content.includes('@media')) {
          analysis.potentialIssues.push({
            file: file.replace(process.cwd(), ''),
            type: 'custom-media-query',
            message: 'Media query custom détectée - préférer Tailwind responsive'
          });
        }
        
        // Détecter les styles inline potentiellement non-responsive
        const inlineStyleRegex = /style={{[^}]+}}/g;
        const inlineMatches = content.match(inlineStyleRegex) || [];
        
        if (inlineMatches.length > 5) {
          analysis.potentialIssues.push({
            file: file.replace(process.cwd(), ''),
            type: 'inline-styles',
            count: inlineMatches.length,
            message: `${inlineMatches.length} styles inline - peuvent causer des problèmes responsive`
          });
        }
        
      } catch (error) {
        // Ignorer erreurs de lecture fichier
      }
    });
    
    console.log(`📊 Fichiers analysés: ${analysis.filesScanned}`);
    console.log('🔍 Classes responsive détectées:');
    Object.entries(analysis.responsiveClasses).forEach(([breakpoint, count]) => {
      console.log(`   ${breakpoint}: ${count} utilisations`);
    });
    
    console.log(`✅ Touch targets appropriés: ${analysis.touchTargets.appropriate.length}`);
    console.log(`⚠️  Touch targets potentiellement trop petits: ${analysis.touchTargets.tooSmall.length}`);
    console.log(`🚨 Problèmes potentiels: ${analysis.potentialIssues.length}`);
    
    if (analysis.touchTargets.tooSmall.length > 0) {
      console.log('\n🔍 TOP 5 TOUCH TARGETS À VÉRIFIER:');
      analysis.touchTargets.tooSmall.slice(0, 5).forEach((target, index) => {
        console.log(`   ${index + 1}. ${target.file}:${target.line} - ${target.class}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Erreur analyse CSS: ${error.message}`);
    analysis.error = error.message;
  }
  
  return analysis;
}

/**
 * Analyser la configuration Tailwind responsive
 */
function analyzeTailwindConfig() {
  console.log('\n⚙️  ANALYSE CONFIGURATION TAILWIND');
  
  const analysis = {
    configFound: false,
    breakpoints: {},
    customizations: [],
    recommendations: []
  };
  
  const configPaths = ['tailwind.config.js', 'tailwind.config.mjs', 'tailwind.config.ts'];
  
  for (const configPath of configPaths) {
    const fullPath = path.join(process.cwd(), configPath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        analysis.configFound = true;
        analysis.configFile = configPath;
        
        console.log(`✅ Configuration trouvée: ${configPath}`);
        
        // Analyser les breakpoints custom
        if (content.includes('screens:')) {
          analysis.customizations.push('Custom breakpoints détectés');
        }
        
        // Analyser les extensions
        if (content.includes('extend:')) {
          analysis.customizations.push('Extensions Tailwind utilisées');
        }
        
        // Vérifier les plugins responsive
        if (content.includes('@tailwindcss/forms')) {
          analysis.customizations.push('Plugin forms (responsive-friendly)');
        }
        
        if (content.includes('@tailwindcss/aspect-ratio')) {
          analysis.customizations.push('Plugin aspect-ratio (utile responsive)');
        }
        
        console.log(`🔧 Personnalisations: ${analysis.customizations.length}`);
        
        break;
        
      } catch (error) {
        console.log(`❌ Erreur lecture ${configPath}: ${error.message}`);
      }
    }
  }
  
  if (!analysis.configFound) {
    console.log('⚠️  Aucune configuration Tailwind trouvée');
    analysis.recommendations.push('Créer tailwind.config.js pour personnaliser les breakpoints');
  }
  
  return analysis;
}

/**
 * Vérifier les composants critiques pour mobile
 */
function checkCriticalComponents() {
  console.log('\n🔍 VÉRIFICATION COMPOSANTS CRITIQUES MOBILE');
  
  const criticalComponents = [
    { name: 'Navigation', patterns: ['nav', 'Navigation', 'NavBar'] },
    { name: 'Formulaires', patterns: ['form', 'Form', 'input', 'Input', 'button', 'Button'] },
    { name: 'Modals', patterns: ['modal', 'Modal', 'dialog', 'Dialog'] },
    { name: 'Cards', patterns: ['card', 'Card'] },
    { name: 'Lists', patterns: ['list', 'List', 'ul', 'li'] }
  ];
  
  const analysis = {
    components: {},
    issues: [],
    recommendations: []
  };
  
  criticalComponents.forEach(component => {
    analysis.components[component.name] = {
      found: 0,
      responsive: 0,
      issues: []
    };
  });
  
  try {
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    
    if (fs.existsSync(componentsDir)) {
      const files = execSync(`find "${componentsDir}" -name "*.tsx"`, { encoding: 'utf-8' }).split('\n');
      
      files.forEach(file => {
        if (!file.trim()) return;
        
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const filename = path.basename(file);
          
          criticalComponents.forEach(component => {
            const found = component.patterns.some(pattern => 
              filename.toLowerCase().includes(pattern.toLowerCase()) ||
              content.includes(pattern)
            );
            
            if (found) {
              analysis.components[component.name].found++;
              
              // Vérifier si responsive
              const hasResponsive = /(?:sm:|md:|lg:|xl:|2xl:)/.test(content);
              if (hasResponsive) {
                analysis.components[component.name].responsive++;
              }
              
              // Vérifier les problèmes spécifiques
              if (component.name === 'Navigation' && !content.includes('hidden') && !content.includes('sm:')) {
                analysis.components[component.name].issues.push('Navigation potentiellement non mobile-friendly');
              }
              
              if (component.name === 'Formulaires' && content.includes('w-full') && !hasResponsive) {
                analysis.components[component.name].issues.push('Formulaire sans breakpoints responsive');
              }
            }
          });
          
        } catch (error) {
          // Ignorer erreurs de lecture
        }
      });
    }
    
    // Analyser les résultats
    Object.entries(analysis.components).forEach(([name, data]) => {
      if (data.found > 0) {
        console.log(`📱 ${name}: ${data.found} trouvé(s), ${data.responsive} responsive`);
        
        if (data.found > data.responsive) {
          analysis.issues.push(`${name}: ${data.found - data.responsive} composant(s) potentiellement non responsive`);
        }
        
        data.issues.forEach(issue => {
          analysis.issues.push(`${name}: ${issue}`);
        });
      }
    });
    
    console.log(`🚨 Problèmes détectés: ${analysis.issues.length}`);
    
    if (analysis.issues.length > 0) {
      console.log('🔍 TOP ISSUES:');
      analysis.issues.slice(0, 5).forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Erreur analyse composants: ${error.message}`);
    analysis.error = error.message;
  }
  
  return analysis;
}

/**
 * Générer le rapport responsive final
 */
function generateResponsiveReport(cssAnalysis, tailwindConfig, componentsAnalysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      overallScore: 0,
      responsiveUsage: 0,
      touchTargetsScore: 0,
      criticalIssues: [],
      recommendations: []
    },
    css: cssAnalysis,
    tailwind: tailwindConfig,
    components: componentsAnalysis,
    viewports: VIEWPORTS
  };
  
  // Calculer score responsive usage
  const totalResponsive = Object.values(cssAnalysis.responsiveClasses || {}).reduce((sum, count) => sum + count, 0);
  report.summary.responsiveUsage = Math.min(100, Math.round((totalResponsive / Math.max(cssAnalysis.filesScanned, 1)) * 10));
  
  // Calculer score touch targets
  const goodTargets = cssAnalysis.touchTargets?.appropriate?.length || 0;
  const badTargets = cssAnalysis.touchTargets?.tooSmall?.length || 0;
  const totalTargets = goodTargets + badTargets;
  
  if (totalTargets > 0) {
    report.summary.touchTargetsScore = Math.round((goodTargets / totalTargets) * 100);
  } else {
    report.summary.touchTargetsScore = 100; // Pas de targets détectés = OK par défaut
  }
  
  // Score global
  report.summary.overallScore = Math.round((report.summary.responsiveUsage + report.summary.touchTargetsScore) / 2);
  
  // Identifier issues critiques
  if (badTargets > 5) {
    report.summary.criticalIssues.push(`${badTargets} touch targets potentiellement trop petits (<44px)`);
  }
  
  if (report.summary.responsiveUsage < 50) {
    report.summary.criticalIssues.push('Usage responsive insuffisant - beaucoup de composants non adaptés mobile');
  }
  
  const componentIssues = componentsAnalysis.issues?.length || 0;
  if (componentIssues > 3) {
    report.summary.criticalIssues.push(`${componentIssues} problèmes détectés dans les composants critiques`);
  }
  
  // Recommandations
  if (report.summary.touchTargetsScore < 80) {
    report.summary.recommendations.push('Augmenter la taille des touch targets à minimum 44px (h-11, w-11)');
    report.summary.recommendations.push('Ajouter plus d\'espacement entre les éléments interactifs');
  }
  
  if (report.summary.responsiveUsage < 70) {
    report.summary.recommendations.push('Implémenter plus de breakpoints responsive (sm:, md:, lg:)');
    report.summary.recommendations.push('Tester sur différents viewports mobile/tablet');
  }
  
  if (!tailwindConfig.configFound) {
    report.summary.recommendations.push('Créer tailwind.config.js pour personnaliser les breakpoints');
  }
  
  if (cssAnalysis.potentialIssues?.length > 0) {
    report.summary.recommendations.push('Remplacer les media queries custom par Tailwind responsive classes');
    report.summary.recommendations.push('Éviter les styles inline pour le responsive design');
  }
  
  return report;
}

/**
 * EXÉCUTION PRINCIPALE
 */
async function runResponsiveAudit() {
  console.log('\n🔍 LANCEMENT AUDIT RESPONSIVE...\n');
  
  // Phase 1: Analyse CSS
  const cssAnalysis = analyzeResponsiveCSS();
  
  // Phase 2: Configuration Tailwind
  const tailwindConfig = analyzeTailwindConfig();
  
  // Phase 3: Composants critiques
  const componentsAnalysis = checkCriticalComponents();
  
  // Phase 4: Rapport final
  console.log('\n📋 GÉNÉRATION RAPPORT RESPONSIVE...');
  const finalReport = generateResponsiveReport(cssAnalysis, tailwindConfig, componentsAnalysis);
  
  // Sauvegarde
  const reportPath = path.join(process.cwd(), 'responsive-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
  
  // Affichage synthèse
  console.log('\n' + '='.repeat(60));
  console.log('📱 RAPPORT RESPONSIVE DESIGN FINAL');
  console.log('='.repeat(60));
  
  console.log(`\n🎯 Score Responsive Global: ${finalReport.summary.overallScore}/100`);
  console.log(`📊 Usage Responsive: ${finalReport.summary.responsiveUsage}/100`);
  console.log(`👆 Score Touch Targets: ${finalReport.summary.touchTargetsScore}/100`);
  
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
    console.log('\n🏆 EXCELLENT - Design parfaitement responsive');
  } else if (finalReport.summary.overallScore >= 75) {
    console.log('\n✅ BON - Quelques améliorations mineures');
  } else if (finalReport.summary.overallScore >= 60) {
    console.log('\n⚠️  MOYEN - Améliorations recommandées');
  } else {
    console.log('\n❌ CRITIQUE - Problèmes majeurs de responsive design');
  }
  
  return finalReport;
}

// Exécution si script appelé directement
if (require.main === module) {
  runResponsiveAudit()
    .then((report) => {
      process.exit(report.summary.overallScore >= 70 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erreur audit responsive:', error);
      process.exit(1);
    });
}

module.exports = { runResponsiveAudit };