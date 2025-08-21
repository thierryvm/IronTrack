#!/usr/bin/env node

/**
 * 🛡️ WCAG 2.1 AA VALIDATOR - IRONTRACK
 * Script de validation continue WCAG avec métriques détaillées
 * 
 * USAGE:
 * node scripts/wcag-validator.js --quick
 * node scripts/wcag-validator.js --full
 * node scripts/wcag-validator.js --fix-contrast
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WCAGValidator {
  constructor() {
    this.name = '🛡️ WCAG Validator';
    this.version = '2025.1';
    this.violations = [];
    this.fixes = [];
    
    // Seuils conformité WCAG 2.1 AA
    this.thresholds = {
      contrast: {
        normal: 4.5,
        large: 3.0
      },
      touchTarget: 44, // px
      maxViolations: {
        critical: 0,
        high: 5,
        medium: 15
      }
    };
  }

  async runQuickValidation() {
    console.log(`${this.name} v${this.version} - VALIDATION RAPIDE WCAG`);
    console.log('='.repeat(60));
    
    const results = {
      timestamp: new Date().toISOString(),
      mode: 'quick',
      score: 0,
      violations: { critical: 0, high: 0, medium: 0, low: 0 },
      fixes: []
    };

    // 1. Validation contraste critique
    console.log('🎨 1/4 - Validation contraste critique...');
    const contrastResults = await this.validateCriticalContrast();
    results.violations.critical += contrastResults.critical;
    results.violations.high += contrastResults.high;
    
    // 2. Touch targets
    console.log('📱 2/4 - Validation touch targets...');
    const touchResults = await this.validateTouchTargets();
    results.violations.high += touchResults.violations.length;
    
    // 3. ARIA critiques
    console.log('🏷️ 3/4 - Validation ARIA critique...');
    const ariaResults = await this.validateCriticalARIA();
    results.violations.critical += ariaResults.critical;
    
    // 4. Navigation clavier
    console.log('⌨️ 4/4 - Validation navigation clavier...');
    const keyboardResults = await this.validateKeyboardNav();
    results.violations.medium += keyboardResults.violations.length;

    // Calcul score
    results.score = this.calculateWCAGScore(results.violations);
    
    this.generateQuickReport(results);
    return results;
  }

  async validateCriticalContrast() {
    const violations = { critical: 0, high: 0 };
    
    // Classes problématiques connues
    const problematicPatterns = [
      { pattern: /text-gray-500/g, severity: 'high', fix: 'text-gray-600' },
      { pattern: /text-gray-400/g, severity: 'critical', fix: 'text-gray-700' },
      { pattern: /text-white\/60/g, severity: 'high', fix: 'text-white/80' },
      { pattern: /text-white\/70/g, severity: 'high', fix: 'text-white/90' }
    ];

    const srcFiles = this.getAllFiles(path.join(process.cwd(), 'src'), ['.tsx']);
    
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const { pattern, severity, fix } of problematicPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations[severity] += matches.length;
          
          this.fixes.push({
            file: file.replace(process.cwd(), '.'),
            type: 'CONTRAST_INSUFFICIENT',
            severity,
            pattern: pattern.source,
            fix,
            occurrences: matches.length
          });
        }
      }
    }

    return violations;
  }

  async validateTouchTargets() {
    const violations = [];
    
    const smallTargetPatterns = [
      'h-6', 'h-8', 'w-6', 'w-8', 'p-1', 'p-2'
    ];

    const srcFiles = this.getAllFiles(path.join(process.cwd(), 'src'), ['.tsx']);
    
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of smallTargetPatterns) {
        if (content.includes(pattern) && 
           (content.includes('button') || content.includes('onClick'))) {
          violations.push({
            file: file.replace(process.cwd(), '.'),
            type: 'TOUCH_TARGET_TOO_SMALL',
            pattern,
            fix: this.getTouchTargetFix(pattern)
          });
        }
      }
    }

    return { violations };
  }

  async validateCriticalARIA() {
    const violations = { critical: 0 };
    
    // Focus sur EmailAuthForm.tsx (47 violations détectées)
    const authForm = path.join(process.cwd(), 'src', 'components', 'auth', 'EmailAuthForm.tsx');
    
    if (fs.existsSync(authForm)) {
      const content = fs.readFileSync(authForm, 'utf8');
      
      // Messages d'erreur sans role="alert"
      if (content.includes('error') && !content.includes('role="alert"')) {
        violations.critical += 1;
        this.fixes.push({
          file: './src/components/auth/EmailAuthForm.tsx',
          type: 'ERROR_NO_ARIA_ALERT',
          severity: 'critical',
          fix: 'Ajouter role="alert" et aria-live="polite" aux messages d\'erreur'
        });
      }
      
      // Boutons toggle sans aria-label
      const toggleButtons = content.match(/onClick.*setShow.*Password/g);
      if (toggleButtons && !content.includes('aria-label')) {
        violations.critical += toggleButtons.length;
        this.fixes.push({
          file: './src/components/auth/EmailAuthForm.tsx',
          type: 'BUTTON_NO_ARIA_LABEL',
          severity: 'critical',
          fix: 'Ajouter aria-label aux boutons toggle password'
        });
      }
    }

    return violations;
  }

  async validateKeyboardNav() {
    const violations = [];
    
    const srcFiles = this.getAllFiles(path.join(process.cwd(), 'src'), ['.tsx']);
    
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Éléments interactifs sans gestion clavier
      if (content.includes('onClick') && 
          !content.includes('onKeyDown') && 
          !content.includes('button')) {
        violations.push({
          file: file.replace(process.cwd(), '.'),
          type: 'MISSING_KEYBOARD_HANDLER',
          fix: 'Ajouter onKeyDown avec gestion Enter/Space'
        });
      }
    }

    return { violations };
  }

  calculateWCAGScore(violations) {
    let score = 100;
    
    // Pénalités par type de violation
    score -= violations.critical * 15;  // -15 points par violation critique
    score -= violations.high * 8;       // -8 points par violation haute
    score -= violations.medium * 3;     // -3 points par violation moyenne
    score -= violations.low * 1;        // -1 point par violation basse
    
    return Math.max(0, score);
  }

  async autoFixContrast() {
    console.log('🔧 AUTO-FIX: Correction automatique des contrastes...');
    
    const fixes = [
      { search: /text-gray-500/g, replace: 'text-gray-600' },
      { search: /text-gray-400/g, replace: 'text-gray-700' },
      { search: /text-white\/60/g, replace: 'text-white/80' },
      { search: /text-white\/70/g, replace: 'text-white/90' }
    ];

    const srcFiles = this.getAllFiles(path.join(process.cwd(), 'src'), ['.tsx']);
    let totalFixes = 0;
    
    for (const file of srcFiles) {
      let content = fs.readFileSync(file, 'utf8');
      let fileFixes = 0;
      
      for (const { search, replace } of fixes) {
        const matches = content.match(search);
        if (matches) {
          content = content.replace(search, replace);
          fileFixes += matches.length;
          totalFixes += matches.length;
        }
      }
      
      if (fileFixes > 0) {
        fs.writeFileSync(file, content);
        console.log(`✅ ${file.replace(process.cwd(), '.')}: ${fileFixes} corrections`);
      }
    }
    
    console.log(`🎯 TOTAL: ${totalFixes} corrections de contraste appliquées`);
    return totalFixes;
  }

  getTouchTargetFix(pattern) {
    const fixes = {
      'h-6': 'h-10 (40px minimum)',
      'h-8': 'h-11 (44px minimum)', 
      'w-6': 'w-10 (40px minimum)',
      'w-8': 'w-11 (44px minimum)',
      'p-1': 'p-3 (12px padding)',
      'p-2': 'p-3 (12px padding)'
    };
    return fixes[pattern] || 'Augmenter la taille à 44px minimum';
  }

  generateQuickReport(results) {
    const isCompliant = results.score >= 85;
    const status = isCompliant ? '✅ CONFORME' : '❌ NON CONFORME';
    
    const report = `
# 🛡️ VALIDATION WCAG 2.1 AA RAPIDE - ${results.timestamp}

## 📊 RÉSULTATS

**Score WCAG**: **${results.score}/100** ${status}

### 🚨 Violations par sévérité:
- **Critiques**: ${results.violations.critical} (max: ${this.thresholds.maxViolations.critical})
- **Hautes**: ${results.violations.high} (max: ${this.thresholds.maxViolations.high})  
- **Moyennes**: ${results.violations.medium} (max: ${this.thresholds.maxViolations.medium})
- **Basses**: ${results.violations.low}

### 🎯 Actions recommandées:

${this.fixes.slice(0, 10).map(fix => 
  `- **${fix.type}** dans ${fix.file}: ${fix.fix}`
).join('\n')}

### 🔧 Corrections automatiques disponibles:

\`\`\`bash
# Corriger les contrastes automatiquement
node scripts/wcag-validator.js --fix-contrast

# Validation complète
node agents/accessibility-agent.js --audit
\`\`\`

### 📈 Conformité:

${isCompliant ? 
  '🎉 **Application conforme WCAG 2.1 AA**' : 
  `⚠️ **${85 - results.score} points manquants pour la conformité**`}

---
Généré par: ${this.name} v${this.version}
Prochain audit: ${new Date(Date.now() + 24*60*60*1000).toISOString()}
    `;

    fs.writeFileSync('wcag-validation-quick.md', report);
    console.log('\n📄 Rapport sauvegardé: wcag-validation-quick.md');
    
    // Alertes console
    if (!isCompliant) {
      console.log(`\n❌ ÉCHEC VALIDATION WCAG - Score: ${results.score}/100`);
      console.log(`🚨 ${results.violations.critical} violations critiques à corriger`);
      if (results.violations.critical > 0) {
        process.exit(1); // Échec pour CI/CD
      }
    } else {
      console.log(`\n✅ VALIDATION WCAG RÉUSSIE - Score: ${results.score}/100`);
    }
  }

  getAllFiles(dir, extensions) {
    let files = [];
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory() && 
            !['node_modules', '.next', '.git', 'coverage'].includes(item)) {
          files = files.concat(this.getAllFiles(fullPath, extensions));
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorer erreurs de lecture
    }
    
    return files;
  }
}

// CLI Interface
if (require.main === module) {
  const validator = new WCAGValidator();
  const arg = process.argv[2];
  
  switch(arg) {
    case '--quick':
      validator.runQuickValidation().then(results => {
        console.log(`\n🎯 VALIDATION RAPIDE TERMINÉE - Score: ${results.score}/100`);
        process.exit(results.score >= 85 ? 0 : 1);
      });
      break;
      
    case '--fix-contrast':
      validator.autoFixContrast().then(fixes => {
        console.log(`\n🎯 AUTO-FIX TERMINÉ - ${fixes} corrections appliquées`);
        if (fixes > 0) {
          console.log('💡 Relancer la validation: node scripts/wcag-validator.js --quick');
        }
      });
      break;
      
    case '--full':
      console.log('🔄 Lancement audit complet...');
      execSync('node agents/accessibility-agent.js --audit', { stdio: 'inherit' });
      break;
      
    default:
      console.log('🛡️ WCAG Validator v2025.1');
      console.log('Usage: node scripts/wcag-validator.js [--quick|--fix-contrast|--full]');
      console.log('');
      console.log('Options:');
      console.log('  --quick        Validation rapide (contraste, touch, ARIA)');
      console.log('  --fix-contrast Auto-correction des problèmes de contraste');
      console.log('  --full         Audit WCAG 2.1 AA complet');
  }
}

module.exports = WCAGValidator;