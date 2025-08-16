// ============================================================================
// SYSTÈME D'OPTIMISATION AUTOMATIQUE D'IMAGES - IRONTRACK
// ============================================================================
// Optimisation automatique non-dégradante pour performances Lighthouse
// Conversion, redimensionnement, compression, responsive images

/**
 * Configuration optimisation images pour performances Web Core Vitals
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Tailles responsive pour Next.js Image
  RESPONSIVE_SIZES: [
    { width: 400, height: 300, suffix: 'sm', quality: 75 },   // Mobile
    { width: 800, height: 600, suffix: 'md', quality: 80 },   // Tablet  
    { width: 1200, height: 900, suffix: 'lg', quality: 85 },  // Desktop
  ],
  
  // Formats de sortie modernes
  OUTPUT_FORMATS: [
    { format: 'webp', quality: 80, fallback: true },    // Moderne
    { format: 'jpeg', quality: 85, fallback: false },   // Compatibilité
  ],
  
  // Limites qualité/performance
  MAX_DIMENSION: 1200,        // Redimensionnement max
  DEFAULT_QUALITY: 80,        // Qualité par défaut
  COMPRESSION_RATIO: 0.6,     // Réduction cible poids (-40%)
  
  // Canvas limits pour sécurité
  MAX_CANVAS_SIZE: 16777216,  // 4096x4096 max pour éviter crash
} as const

/**
 * Interface résultat optimisation
 */
export interface OptimizedImageResult {
  success: boolean
  originalFile: File
  optimizedFile: File
  metadata: {
    originalSize: number
    optimizedSize: number
    compressionRatio: number
    originalDimensions: { width: number; height: number }
    optimizedDimensions: { width: number; height: number }
    format: string
    processingTime: number
  }
  error?: string
}

/**
 * Redimensionne une image de façon proportionnelle
 */
function calculateOptimalDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxDimension: number
): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight }
  }
  
  const aspectRatio = originalWidth / originalHeight
  
  if (originalWidth > originalHeight) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio)
    }
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension
    }
  }
}

/**
 * Optimise automatiquement une image (redimensionnement + compression)
 * Utilise Canvas HTML5 pour traitement côté client (pas de serveur requis)
 */
export async function optimizeImage(file: File): Promise<OptimizedImageResult> {
  const startTime = performance.now()
  
  try {
    // Validation sécurité
    if (!file.type.startsWith('image/')) {
      throw new Error('Fichier non image')
    }
    
    const originalSize = file.size
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context indisponible'))
        return
      }
      
      img.onload = () => {
        try {
          const originalDimensions = { width: img.width, height: img.height }
          
          // Calculer dimensions optimales
          const optimizedDimensions = calculateOptimalDimensions(
            img.width, 
            img.height, 
            IMAGE_OPTIMIZATION_CONFIG.MAX_DIMENSION
          )
          
          // Vérification sécurité Canvas
          const canvasSize = optimizedDimensions.width * optimizedDimensions.height
          if (canvasSize > IMAGE_OPTIMIZATION_CONFIG.MAX_CANVAS_SIZE) {
            throw new Error('Image trop large pour optimisation sécurisée')
          }
          
          // Configurer canvas
          canvas.width = optimizedDimensions.width
          canvas.height = optimizedDimensions.height
          
          // Améliorer qualité de redimensionnement
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Dessiner image redimensionnée
          ctx.drawImage(
            img, 
            0, 0, 
            optimizedDimensions.width, 
            optimizedDimensions.height
          )
          
          // Convertir en blob optimisé
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Échec génération blob optimisé'))
                return
              }
              
              // Créer fichier optimisé
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.(jpe?g|png|webp)$/i, '.jpg'),
                {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                }
              )
              
              const optimizedSize = optimizedFile.size
              const compressionRatio = (originalSize - optimizedSize) / originalSize
              const processingTime = performance.now() - startTime
              
              // Log performances
              console.log(`[OPTIMIZATION] ${file.name}:`, {
                original: `${(originalSize / 1024).toFixed(0)}KB`,
                optimized: `${(optimizedSize / 1024).toFixed(0)}KB`,
                compression: `${(compressionRatio * 100).toFixed(1)}%`,
                time: `${processingTime.toFixed(0)}ms`
              })
              
              resolve({
                success: true,
                originalFile: file,
                optimizedFile,
                metadata: {
                  originalSize,
                  optimizedSize,
                  compressionRatio,
                  originalDimensions,
                  optimizedDimensions,
                  format: 'image/jpeg',
                  processingTime
                }
              })
            },
            'image/jpeg',
            IMAGE_OPTIMIZATION_CONFIG.DEFAULT_QUALITY / 100
          )
          
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Impossible de charger l\'image pour optimisation'))
      }
      
      // Charger image depuis File
      img.src = URL.createObjectURL(file)
    })
    
  } catch (error) {
    const processingTime = performance.now() - startTime
    
    return {
      success: false,
      originalFile: file,
      optimizedFile: file, // Fallback fichier original
      metadata: {
        originalSize: file.size,
        optimizedSize: file.size,
        compressionRatio: 0,
        originalDimensions: { width: 0, height: 0 },
        optimizedDimensions: { width: 0, height: 0 },
        format: file.type,
        processingTime
      },
      error: error instanceof Error ? error.message : 'Erreur optimisation inconnue'
    }
  }
}

/**
 * Optimise automatiquement une image avec fallback sécurisé
 * Si optimisation échoue, retourne fichier original (pas de blocking)
 */
export async function optimizeImageSafe(file: File): Promise<File> {
  try {
    // Pas d'optimisation si déjà petit (< 500KB)
    if (file.size < 500 * 1024) {
      console.log(`[OPTIMIZATION] Fichier déjà optimisé: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`)
      return file
    }
    
    const result = await optimizeImage(file)
    
    if (result.success && result.metadata.compressionRatio > 0.1) {
      console.log(`[OPTIMIZATION] Succès: ${result.metadata.compressionRatio * 100}% compression`)
      return result.optimizedFile
    } else {
      console.log(`[OPTIMIZATION] Pas d'amélioration significative, fichier original conservé`)
      return file
    }
    
  } catch (error) {
    console.warn(`[OPTIMIZATION] Échec optimisation (fallback fichier original):`, error)
    return file // Fallback sécurisé
  }
}

/**
 * Vérifie si une image nécessite une optimisation
 */
export function shouldOptimizeImage(file: File): boolean {
  // Critères optimisation
  const needsOptimization = 
    file.size > 500 * 1024 ||  // > 500KB
    file.name.toLowerCase().includes('img_') || // Photos appareil
    file.name.toLowerCase().includes('dsc_') || // Photos reflex
    file.type === 'image/png'   // PNG souvent non optimisé
  
  console.log(`[OPTIMIZATION] ${file.name} needs optimization:`, needsOptimization, {
    size: `${(file.size / 1024).toFixed(0)}KB`,
    type: file.type
  })
  
  return needsOptimization
}

/**
 * Génère des métadonnées optimisation pour monitoring
 */
export function generateOptimizationReport(results: OptimizedImageResult[]): {
  totalFiles: number
  totalOriginalSize: number
  totalOptimizedSize: number
  averageCompression: number
  totalProcessingTime: number
  successRate: number
} {
  const successful = results.filter(r => r.success)
  
  return {
    totalFiles: results.length,
    totalOriginalSize: results.reduce((sum, r) => sum + r.metadata.originalSize, 0),
    totalOptimizedSize: results.reduce((sum, r) => sum + r.metadata.optimizedSize, 0),
    averageCompression: successful.length > 0 
      ? successful.reduce((sum, r) => sum + r.metadata.compressionRatio, 0) / successful.length
      : 0,
    totalProcessingTime: results.reduce((sum, r) => sum + r.metadata.processingTime, 0),
    successRate: results.length > 0 ? successful.length / results.length : 0
  }
}