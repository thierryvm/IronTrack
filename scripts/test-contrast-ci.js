#!/usr/bin/env node
/**
 * 🧪 SCRIPT CI/CD - Tests Contraste Automatisés
 * 
 * Script exécuté dans GitHub Actions pour valider que tous les
 * composants respectent WCAG 2.1 AA avant merge.
 * 
 * Utilisation: npm run test:contrast:ci
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const CONFIG = {
  // Seuils d'acceptation
  MIN_CONTRAST_RATIO: 4.5,
  MIN_UI_CONTRAST_RATIO: 3.0,
  
  // Fichiers à analyser
  SOURCE_DIRS: ['src/app', 'src/components'],
  EXTENSIONS: ['.tsx', '.ts'],
  
  // Classes Tailwind problématiques connues
  UNSAFE_CLASSES: [
    'text-gray-400', 'text-gray-500',
    'text-yellow-400', 'text-yellow-500',
    'text-green-400', 'text-green-500',
    'text-blue-400', 'text-blue-500',
    'text-red-400', 'text-red-500',
    'text-purple-400', 'text-purple-500',
    'text-pink-400', 'text-pink-500'
  ],
  
  // Classes sécurisées approuvées
  SAFE_CLASSES: [
    'text-safe-primary', 'text-safe-secondary', 'text-safe-muted',
    'text-safe-orange', 'text-safe-success', 'text-safe-error',
    'btn-safe-primary', 'btn-safe-secondary', 'btn-safe-outline',
    'status-safe-success', 'status-safe-error', 'status-safe-warning'
  ]
}

class ContrastCIChecker {
  constructor() {
    this.issues = []
    this.fileCount = 0
    this.warnings = []
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('🎨 IRONTRACK - Tests Contraste CI/CD')
    console.log('=====================================\n')

    try {
      // 1. Exécuter les tests unitaires de contraste
      await this.runUnitTests()
      
      // 2. Scanner les fichiers pour classes non-sécurisées
      await this.scanSourceFiles()
      
      // 3. Vérifier la configuration Tailwind
      await this.checkTailwindConfig()
      
      // 4. Générer le rapport
      await this.generateReport()
      
      // 5. Déterminer le statut de sortie
      this.exitWithStatus()

    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution des tests contraste:')
      console.error(error.message)
      process.exit(1)
    }
  }

  /**
   * Exécuter les tests unitaires Jest
   */
  async runUnitTests() {
    console.log('🧪 Exécution des tests unitaires contraste...')
    
    try {
      const result = execSync(
        'npm test -- --testPathPatterns="contrastUtils.test.ts" --passWithNoTests --json',
        { encoding: 'utf8', stdio: 'pipe' }
      )
      
      // Extraire seulement la partie JSON valide (dernière ligne généralement)
      const lines = result.split('\n').filter(line => line.trim())
      const jsonLine = lines[lines.length - 1] || '{}'
      
      const testResults = JSON.parse(jsonLine)
      
      if (testResults.success) {
        console.log(`✅ Tests unitaires: ${testResults.numPassedTests}/${testResults.numTotalTests} passés\n`)
      } else {
        console.log(`❌ Tests unitaires: ${testResults.numFailedTests}/${testResults.numTotalTests} échoués`)
        
        testResults.testResults.forEach(testFile => {
          if (testFile.numFailingTests > 0) {
            this.issues.push({
              type: 'UNIT_TEST_FAILURE',
              file: testFile.name,
              message: `${testFile.numFailingTests} test(s) échoués`,
              severity: 'error'
            })
          }
        })
      }
    } catch (error) {
      this.issues.push({
        type: 'UNIT_TEST_ERROR',
        file: 'contrastUtils.test.ts',
        message: 'Impossible d\'exécuter les tests unitaires',
        severity: 'error',
        details: error.message
      })
    }
  }

  /**
   * Scanner les fichiers source pour classes non-sécurisées
   */
  async scanSourceFiles() {
    console.log('📂 Analyse des fichiers source...')
    
    for (const dir of CONFIG.SOURCE_DIRS) {
      await this.scanDirectory(dir)
    }
    
    console.log(`📊 ${this.fileCount} fichiers analysés\n`)
  }

  /**
   * Scanner un répertoire récursivement
   */
  async scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath)
      } else if (this.shouldAnalyzeFile(entry.name)) {
        await this.analyzeFile(fullPath)
      }
    }
  }

  /**
   * Vérifier si un fichier doit être analysé
   */
  shouldAnalyzeFile(filename) {
    return CONFIG.EXTENSIONS.some(ext => filename.endsWith(ext))
  }

  /**
   * Analyser un fichier pour les problèmes de contraste
   */
  async analyzeFile(filePath) {
    this.fileCount++
    
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Rechercher les classes Tailwind non-sécurisées
      const unsafeMatches = this.findUnsafeClasses(content)
      
      if (unsafeMatches.length > 0) {
        unsafeMatches.forEach(match => {
          this.issues.push({
            type: 'UNSAFE_CLASS',
            file: path.relative(process.cwd(), filePath),
            line: this.getLineNumber(content, match.index),
            message: `Classe non-sécurisée détectée: "${match.className}"`,
            suggestion: this.getSafeSuggestion(match.className),
            severity: 'warning'
          })
        })
      }
      
      // Rechercher les styles inline (potentiellement non-testés)
      const inlineStyles = this.findInlineStyles(content)
      
      if (inlineStyles.length > 0) {
        inlineStyles.forEach(match => {
          this.warnings.push({
            type: 'INLINE_STYLE',
            file: path.relative(process.cwd(), filePath),
            line: this.getLineNumber(content, match.index),
            message: 'Style inline détecté - contraste non-testé automatiquement',
            suggestion: 'Utiliser les classes sécurisées ou createSafeTextClass()',
            severity: 'info'
          })
        })
      }
      
    } catch (error) {
      this.warnings.push({
        type: 'FILE_READ_ERROR',
        file: path.relative(process.cwd(), filePath),
        message: `Impossible de lire le fichier: ${error.message}`,
        severity: 'info'
      })
    }
  }

  /**
   * Rechercher les classes Tailwind non-sécurisées
   */
  findUnsafeClasses(content) {
    const matches = []
    
    // Regex pour trouver className="..." ou className={...}
    const classNameRegex = /className\s*=\s*["{]([^"}]*)["}]/g
    
    let match
    while ((match = classNameRegex.exec(content)) !== null) {
      const classNames = match[1]
      
      // Vérifier chaque classe
      CONFIG.UNSAFE_CLASSES.forEach(unsafeClass => {
        if (classNames.includes(unsafeClass)) {
          matches.push({
            index: match.index,
            className: unsafeClass,
            context: match[0]
          })
        }
      })
    }
    
    return matches
  }

  /**
   * Rechercher les styles inline
   */
  findInlineStyles(content) {
    const matches = []
    const styleRegex = /style\s*=\s*\{[^}]*color[^}]*\}/g
    
    let match
    while ((match = styleRegex.exec(content)) !== null) {
      matches.push({
        index: match.index,
        style: match[0]
      })
    }
    
    return matches
  }

  /**
   * Obtenir le numéro de ligne d'un index dans le contenu
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length
  }

  /**
   * Suggérer une classe sécurisée en remplacement
   */
  getSafeSuggestion(unsafeClass) {
    const suggestions = {
      'text-gray-400': 'text-safe-muted ou createSafeTextClass()',
      'text-gray-500': 'text-safe-muted ou createSafeTextClass()',
      'text-yellow-400': 'text-safe-warning',
      'text-yellow-500': 'text-safe-warning',
      'text-green-400': 'text-safe-success',
      'text-green-500': 'text-safe-success',
      'text-red-400': 'text-safe-error',
      'text-red-500': 'text-safe-error',
      'text-blue-400': 'text-safe-link ou text-safe-info',
      'text-blue-500': 'text-safe-link ou text-safe-info'
    }
    
    return suggestions[unsafeClass] || 'Utiliser une classe text-safe-* appropriée'
  }

  /**
   * Vérifier la configuration Tailwind
   */
  async checkTailwindConfig() {
    console.log('⚙️ Vérification configuration Tailwind...')
    
    const tailwindConfigPath = 'tailwind.config.mjs'
    
    if (fs.existsSync(tailwindConfigPath)) {
      const config = fs.readFileSync(tailwindConfigPath, 'utf8')
      
      if (config.includes('contrastPlugin.js')) {
        console.log('✅ Plugin contraste détecté dans la configuration\n')
      } else {
        this.warnings.push({
          type: 'MISSING_PLUGIN',
          file: tailwindConfigPath,
          message: 'Plugin de contraste non détecté dans tailwind.config.mjs',
          suggestion: 'Vérifier que contrastPlugin.js est bien importé',
          severity: 'warning'
        })
      }
    } else {
      this.issues.push({
        type: 'MISSING_CONFIG',
        file: tailwindConfigPath,
        message: 'Fichier de configuration Tailwind non trouvé',
        severity: 'error'
      })
    }
  }

  /**
   * Générer le rapport final
   */
  async generateReport() {
    console.log('📊 RAPPORT DE CONTRASTE')
    console.log('=======================\n')

    // Statistiques générales
    console.log('📈 Statistiques:')
    console.log(`   Fichiers analysés: ${this.fileCount}`)
    console.log(`   Erreurs trouvées: ${this.issues.filter(i => i.severity === 'error').length}`)
    console.log(`   Avertissements: ${this.issues.filter(i => i.severity === 'warning').length + this.warnings.length}`)
    console.log('')

    // Erreurs critiques
    const errors = this.issues.filter(i => i.severity === 'error')
    if (errors.length > 0) {
      console.log('❌ ERREURS CRITIQUES:')
      errors.forEach(error => {
        console.log(`   ${error.file}: ${error.message}`)
        if (error.details) {
          console.log(`      Détails: ${error.details}`)
        }
      })
      console.log('')
    }

    // Avertissements
    const warnings = [
      ...this.issues.filter(i => i.severity === 'warning'),
      ...this.warnings
    ]
    
    if (warnings.length > 0) {
      console.log('⚠️  AVERTISSEMENTS:')
      warnings.forEach(warning => {
        console.log(`   ${warning.file}:${warning.line || '?'} - ${warning.message}`)
        if (warning.suggestion) {
          console.log(`      💡 Suggestion: ${warning.suggestion}`)
        }
      })
      console.log('')
    }

    // Recommandations
    if (errors.length === 0 && warnings.length === 0) {
      console.log('🎉 EXCELLENT! Aucun problème de contraste détecté.')
      console.log('   Tous les composants respectent WCAG 2.1 AA.')
    } else if (errors.length === 0) {
      console.log('✅ CONFORME. Quelques améliorations possibles:')
      console.log('   - Remplacer les classes non-sécurisées par text-safe-*')
      console.log('   - Éviter les styles inline pour le texte coloré')
    } else {
      console.log('🚨 ÉCHEC. Corrections requises avant merge:')
      console.log('   - Corriger les erreurs critiques listées ci-dessus')
      console.log('   - Exécuter: npm run test:contrast pour plus de détails')
    }

    console.log('')
  }

  /**
   * Sortir avec le code approprié
   */
  exitWithStatus() {
    const criticalErrors = this.issues.filter(i => i.severity === 'error').length
    
    if (criticalErrors > 0) {
      console.log(`💥 CI/CD ÉCHEC: ${criticalErrors} erreur(s) critique(s)`)
      process.exit(1)
    } else {
      console.log('✅ CI/CD SUCCÈS: Contraste conforme WCAG 2.1 AA')
      process.exit(0)
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const checker = new ContrastCIChecker()
  checker.run()
}

module.exports = ContrastCIChecker