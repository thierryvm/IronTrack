#!/usr/bin/env node
/**
 * 🔧 SCRIPT AUTO-FIX - Corrections Contraste Automatiques
 * 
 * Script pour corriger automatiquement les classes Tailwind non-sécurisées
 * en les remplaçant par les équivalents sécurisés.
 * 
 * Utilisation: npm run fix:contrast
 */

const fs = require('fs')
const path = require('path')

// Mappings des corrections automatiques
const CONTRAST_FIXES = {
  'text-gray-400': 'text-safe-muted',
  'text-gray-500': 'text-safe-muted', 
  'text-yellow-400': 'text-safe-warning',
  'text-yellow-500': 'text-safe-warning',
  'text-green-400': 'text-safe-success',
  'text-green-500': 'text-safe-success',
  'text-red-400': 'text-safe-error',
  'text-red-500': 'text-safe-error',
  'text-blue-400': 'text-safe-info',
  'text-blue-500': 'text-safe-info',
  'text-purple-400': 'text-safe-primary', // Approximation
  'text-purple-500': 'text-safe-primary'
}

class ContrastFixer {
  constructor() {
    this.fixedFiles = []
    this.totalReplacements = 0
  }

  async run() {
    console.log('🔧 IronTrack - Auto-Fix Contraste')
    console.log('==================================\n')

    const sourceFiles = await this.findSourceFiles()
    
    for (const filePath of sourceFiles) {
      const replacements = await this.fixFile(filePath)
      if (replacements > 0) {
        this.fixedFiles.push({ path: filePath, replacements })
        this.totalReplacements += replacements
      }
    }

    this.generateReport()
  }

  async findSourceFiles() {
    const files = []
    const directories = ['src/app', 'src/components']
    
    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        files.push(...this.scanDirectory(dir))
      }
    }
    
    return files.filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
  }

  scanDirectory(dirPath) {
    const files = []
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        files.push(...this.scanDirectory(fullPath))
      } else {
        files.push(fullPath)
      }
    }
    
    return files
  }

  async fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8')
      let replacements = 0
      
      // Appliquer chaque fix
      for (const [oldClass, newClass] of Object.entries(CONTRAST_FIXES)) {
        const regex = new RegExp(`\\b${oldClass}\\b`, 'g')
        const matches = content.match(regex)
        
        if (matches) {
          content = content.replace(regex, newClass)
          replacements += matches.length
          
          console.log(`  📝 ${path.relative(process.cwd(), filePath)}: ${oldClass} → ${newClass} (${matches.length}x)`)
        }
      }
      
      // Sauvegarder seulement si des changements ont été faits
      if (replacements > 0) {
        fs.writeFileSync(filePath, content, 'utf8')
      }
      
      return replacements
      
    } catch (error) {
      console.warn(`⚠️  Impossible de traiter ${filePath}: ${error.message}`)
      return 0
    }
  }

  generateReport() {
    console.log('\n📊 RAPPORT AUTO-FIX')
    console.log('===================')
    console.log(`📁 Fichiers traités: ${this.fixedFiles.length}`)
    console.log(`🔄 Total remplacements: ${this.totalReplacements}`)
    console.log('')

    if (this.fixedFiles.length > 0) {
      console.log('✅ CORRECTIONS APPLIQUÉES:')
      
      this.fixedFiles.forEach(({ path: filePath, replacements }) => {
        console.log(`   ${path.relative(process.cwd(), filePath)}: ${replacements} correction(s)`)
      })
      
      console.log('')
      console.log('🎉 Auto-fix terminé avec succès!')
      console.log('   Exécutez `npm run test:contrast` pour vérifier.')
    } else {
      console.log('✨ Aucune correction nécessaire - déjà conforme!')
    }

    console.log('')
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const fixer = new ContrastFixer()
  fixer.run().catch(console.error)
}

module.exports = ContrastFixer