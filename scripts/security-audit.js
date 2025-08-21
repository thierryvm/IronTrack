#!/usr/bin/env node

/**
 * 🔒 Vérificateur de Sécurité IronTrack 2025
 * 
 * Vérifie que nos modifications n'ont introduit aucune vulnérabilité:
 * - OWASP Top 10 compliance
 * - Secrets exposés
 * - Validation inputs
 * - CSP et XSS
 * - Sécurité uploads
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = './src';

let securityIssues = [];
let filesScanned = 0;

console.log('🔒 AUDIT SÉCURITÉ IRONTRACK 2025');
console.log('===============================');

const SECURITY_CHECKS = [
  {
    name: 'Secrets exposés',
    pattern: /(api_key|secret|password|token)\s*[:=]\s*["'][^"']{10,}/gi,
    severity: 'CRITICAL',
    description: 'Clé API ou secret potentiellement exposé'
  },
  {
    name: 'SQL Injection',
    pattern: /\$\{[^}]*\}/g, // Template literals dangereux
    severity: 'HIGH',
    description: 'Possible injection SQL via template literal',
    excludePattern: /console\.|console\.log|console\.error/
  },
  {
    name: 'XSS - innerHTML direct',
    pattern: /\.innerHTML\s*=\s*[^;]+/g,
    severity: 'HIGH',
    description: 'Utilisation dangereuse d\'innerHTML sans sanitization'
  },
  {
    name: 'eval() usage',
    pattern: /\beval\s*\(/g,
    severity: 'CRITICAL',
    description: 'Utilisation dangereuse d\'eval()'
  },
  {
    name: 'Validation manquante uploads',
    pattern: /accept\s*=\s*["\'][^"']*\*[^"']*["']/g,
    severity: 'MEDIUM',
    description: 'Validation d\'upload trop permissive'
  },
  {
    name: 'URLs externes non validées',
    pattern: /https?:\/\/[^"'\s]+/g,
    severity: 'LOW',
    description: 'URL externe détectée - vérifier la confiance',
    excludePattern: /(localhost|127\.0\.0\.1|supabase\.com|vercel\.app|anthropic\.com)/
  }
];

const SECURE_PATTERNS = [
  {
    name: 'OWASP FileUpload Utils',
    pattern: /OWASP|sanitize|allowedExtensions/,
    file: './src/utils/fileUpload.ts'
  },
  {
    name: 'CSP Headers',
    pattern: /Content-Security-Policy/,
    file: './src/app/layout.tsx'
  },
  {
    name: 'Input Validation',
    pattern: /z\.|zod|schema\.safeParse/,
    file: './src'
  }
];

function checkSecurity(filePath, content) {
  SECURITY_CHECKS.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      // Vérifier si c'est exclu
      if (check.excludePattern && check.excludePattern.test(content)) {
        return;
      }
      
      matches.forEach(match => {
        securityIssues.push({
          file: path.relative('.', filePath),
          issue: check.name,
          severity: check.severity,
          description: check.description,
          match: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
      });
    }
  });
}

function verifySecurePatterns() {
  console.log('\n🛡️ VÉRIFICATION PATTERNS SÉCURISÉS');
  console.log('-----------------------------------');
  
  SECURE_PATTERNS.forEach(pattern => {
    if (fs.existsSync(pattern.file)) {
      const stat = fs.statSync(pattern.file);
      if (stat.isFile()) {
        const content = fs.readFileSync(pattern.file, 'utf8');
        if (pattern.pattern.test(content)) {
          console.log(`✅ ${pattern.name}: Présent`);
        } else {
          console.log(`⚠️ ${pattern.name}: Non détecté`);
          securityIssues.push({
            file: pattern.file,
            issue: `Pattern sécurisé manquant: ${pattern.name}`,
            severity: 'MEDIUM',
            description: 'Pattern de sécurité recommandé non trouvé'
          });
        }
      } else {
        console.log(`📁 ${pattern.name}: Dossier détecté, scan manuel requis`);
      }
    } else {
      console.log(`❌ ${pattern.name}: Fichier non trouvé ${pattern.file}`);
    }
  });
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir);
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      checkSecurity(fullPath, content);
      filesScanned++;
    }
  });
}

console.log(`🔍 Scan sécurité dans ${SRC_DIR}...`);
scanDirectory(SRC_DIR);

verifySecurePatterns();

console.log('\n📊 RÉSULTATS AUDIT SÉCURITÉ');
console.log('============================');
console.log(`📁 Fichiers scannés: ${filesScanned}`);
console.log(`🚨 Issues détectées: ${securityIssues.length}`);

if (securityIssues.length === 0) {
  console.log('✅ AUCUNE VULNÉRABILITÉ DÉTECTÉE');
  console.log('🛡️ Niveau de sécurité: EXCELLENT');
} else {
  const critical = securityIssues.filter(i => i.severity === 'CRITICAL').length;
  const high = securityIssues.filter(i => i.severity === 'HIGH').length;
  const medium = securityIssues.filter(i => i.severity === 'MEDIUM').length;
  const low = securityIssues.filter(i => i.severity === 'LOW').length;
  
  console.log(`🚨 Critiques: ${critical}`);
  console.log(`⚠️ Hautes: ${high}`);
  console.log(`ℹ️ Moyennes: ${medium}`);
  console.log(`💡 Basses: ${low}`);
  
  console.log('\n🔍 DÉTAIL DES ISSUES:');
  securityIssues.forEach((issue, i) => {
    console.log(`\n${i + 1}. [${issue.severity}] ${issue.issue}`);
    console.log(`   📁 ${issue.file}:${issue.line || '?'}`);
    console.log(`   📝 ${issue.description}`);
    if (issue.match) {
      console.log(`   🔍 "${issue.match}"`);
    }
  });
  
  const score = Math.max(0, 100 - (critical * 25 + high * 10 + medium * 5 + low * 1));
  console.log(`\n🛡️ Score sécurité: ${score}/100`);
  
  if (critical > 0) {
    console.log('🚨 CRITIQUE: Vulnérabilités critiques détectées!');
    process.exit(1);
  } else if (high > 0) {
    console.log('⚠️ ATTENTION: Vulnérabilités hautes à corriger');
  } else {
    console.log('👍 BON: Sécurité acceptable');
  }
}

console.log('\n🔐 RECOMMANDATIONS SÉCURITÉ:');
console.log('- Utiliser zod pour validation inputs');
console.log('- Sanitizer toutes les données utilisateur');
console.log('- Headers CSP et sécurité configurés');
console.log('- Uploads OWASP-compliant uniquement');
console.log('- Aucun secret en dur dans le code');
console.log('- HTTPS obligatoire en production');

process.exit(securityIssues.filter(i => i.severity === 'CRITICAL').length > 0 ? 1 : 0);