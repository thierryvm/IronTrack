'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Zap, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Download
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface OptimizationStats {
  totalImages: number
  processedImages: number
  optimizedImages: number
  totalSavings: number
  compressionRatio: number
  isRunning: boolean
  currentBatch: number
  totalBatches: number
  errors: Array<{ file: string; error: string }>
  completed: boolean
  results: Array<{
    file: string
    status: 'optimized' | 'skipped' | 'error'
    originalSize?: number
    optimizedSize?: number
    compression?: number
    reason?: string
    error?: string
  }>
}

export default function ImageOptimizationPage() {
  const [stats, setStats] = useState<OptimizationStats>({
    totalImages: 0,
    processedImages: 0,
    optimizedImages: 0,
    totalSavings: 0,
    compressionRatio: 0,
    isRunning: false,
    currentBatch: 0,
    totalBatches: 0,
    errors: [],
    completed: false,
    results: []
  })
  
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>(['exercise-images'])
  const [scanResults, setScanResults] = useState<Record<string, { totalFiles: number; estimatedSize: number; files: unknown[] }> | null>(null)

  const supabase = createClient()

  /**
   * Scan initial des buckets pour estimer le travail
   * Utilise l'API corrigée qui reconnaît les fichiers UUID
   */
  const scanBuckets = async () => {
    try {
      // Reset complet de l'état avant nouveau scan
      setStats({
        totalImages: 0,
        processedImages: 0,
        optimizedImages: 0,
        totalSavings: 0,
        compressionRatio: 0,
        isRunning: true,
        currentBatch: 0,
        totalBatches: 0,
        errors: [],
        completed: false,
        results: []
      })
      
      const results: Record<string, { totalFiles: number; estimatedSize: number; files: unknown[] }> = {}
      let totalImages = 0
      // totalSize was unused - removed
      
      for (const bucket of selectedBuckets) {
        try {
          // Appel à notre API corrigée qui reconnaît les UUID
          const response = await fetch(`/api/optimize-images?bucket=${bucket}`)
          if (!response.ok) throw new Error(`API error: ${response.status}`)
          
          const { analysis, preview } = await response.json()
          
          results[bucket] = {
            totalFiles: analysis.totalFiles,
            estimatedSize: analysis.estimatedSize,
            files: preview || [] // Preview des fichiers détectés
          }
          
          totalImages += analysis.totalFiles
          // totalSize was removed
          
        } catch (apiError) {
          console.warn(`Erreur API pour ${bucket}, fallback direct:`, apiError)
          
          // Fallback: méthode directe avec logique UUID
          const { data: files, error } = await supabase.storage
            .from(bucket)
            .list('', { limit: 1000 })
          
          if (error) throw error
          
          const imageFiles = files?.filter(file => {
            const ext = file.name.split('.').pop()?.toLowerCase()
            const hasImageExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext || '')
            
            // Inclure fichiers UUID pour exercise-images
            const isUUIDFile = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(file.name)
            
            return hasImageExt || (bucket === 'exercise-images' && isUUIDFile)
          }) || []
          
          const bucketSize = imageFiles.length * 2 * 1024 * 1024 // 2MB estimation
          
          results[bucket] = {
            totalFiles: imageFiles.length,
            estimatedSize: bucketSize,
            files: imageFiles.slice(0, 10)
          }
          
          totalImages += imageFiles.length
          // totalSize was removed
        }
      }
      
      setScanResults(results)
      setStats(prev => ({
        ...prev,
        totalImages,
        isRunning: false,
        totalBatches: Math.ceil(totalImages / 10) // 10 images par batch
      }))
      
    } catch (error) {
      console.error('Scan error:', error)
      setStats(prev => ({ ...prev, isRunning: false }))
    }
  }

  /**
   * Lance l'optimisation réelle via l'API
   */
  const startOptimization = async () => {
    if (!scanResults) return
    
    setStats(prev => ({ 
      ...prev, 
      isRunning: true, 
      currentBatch: 0, 
      completed: false,
      results: [],
      processedImages: 0,
      optimizedImages: 0,
      totalSavings: 0,
      errors: []
    }))
    
    try {
      let allResults: Array<{ file: string; originalSize: number; optimizedSize: number; compressionRatio: number }> = []
      let totalProcessed = 0
      let totalOptimized = 0
      let totalSavings = 0
      
      for (const bucket of selectedBuckets) {
        const bucketData = scanResults[bucket]
        if (!bucketData || bucketData.totalFiles === 0) continue
        
        setStats(prev => ({ ...prev, currentBatch: prev.currentBatch + 1 }))
        
        try {
          // Appel à l'API d'optimisation
          const response = await fetch('/api/optimize-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bucket,
              batchSize: 50,
              skipOptimized: true
            })
          })
          
          if (!response.ok) throw new Error(`API error: ${response.status}`)
          
          const result = await response.json()
          
          // Mettre à jour les statistiques
          totalProcessed += result.processed || 0
          totalOptimized += result.results?.filter((r: { status: string }) => r.status === 'optimized').length || 0
          totalSavings += result.stats?.spaceSaved || 0
          allResults = [...allResults, ...(result.results || [])]
          
          setStats(prev => ({
            ...prev,
            processedImages: totalProcessed,
            optimizedImages: totalOptimized,
            totalSavings: totalSavings,
            compressionRatio: totalSavings > 0 ? totalSavings / (result.stats?.totalOriginalSize || 1) : 0,
            results: allResults
          }))
          
        } catch (bucketError) {
          console.error(`Erreur optimisation ${bucket}:`, bucketError)
          setStats(prev => ({
            ...prev,
            errors: [...prev.errors, { file: bucket, error: String(bucketError) }]
          }))
        }
      }
      
      setStats(prev => ({ 
        ...prev, 
        isRunning: false, 
        completed: true 
      }))
      
    } catch (error) {
      console.error('Optimization error:', error)
      setStats(prev => ({ 
        ...prev, 
        isRunning: false,
        errors: [...prev.errors, { file: 'system', error: String(error) }]
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Optimisation Images Existantes
            </h1>
          </div>
          <p className="text-gray-600">
            Optimisez rétroactivement toutes les images déjà stockées dans Supabase Storage pour améliorer les performances.
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="h-5 w-5 text-orange-600 mr-2" />
            Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buckets à optimiser
              </label>
              <div className="flex space-x-4">
                {['exercise-images', 'avatars'].map(bucket => (
                  <label key={bucket} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedBuckets.includes(bucket)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBuckets([...selectedBuckets, bucket])
                        } else {
                          setSelectedBuckets(selectedBuckets.filter(b => b !== bucket))
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{bucket}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={scanBuckets}
                disabled={stats.isRunning || selectedBuckets.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Database className="h-4 w-4 mr-2" />
                Scanner les buckets
              </button>
              
              {scanResults && (
                <button
                  onClick={startOptimization}
                  disabled={stats.isRunning}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
                >
                  {stats.isRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer optimisation
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Résultats scan */}
        {scanResults && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
              Résultats du scan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(scanResults).map(([bucket, data]: [string, { totalFiles: number; estimatedSize: number; files: unknown[]; totalFoundFiles?: number; alreadyOptimized?: number; estimatedSavings?: number }]) => (
                <div key={bucket} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{bucket}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>📁 {data.totalFoundFiles || data.totalFiles} images totales</div>
                    <div>🎯 {data.totalFiles} à optimiser</div>
                    {(data.alreadyOptimized || 0) > 0 && (
                      <div>✅ {data.alreadyOptimized} déjà optimisées</div>
                    )}
                    <div>💾 ~{(data.estimatedSize / 1024 / 1024).toFixed(1)}MB estimés</div>
                    <div>⚡ ~{((data.estimatedSavings || 0) / 1024 / 1024).toFixed(1)}MB économisables</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images traitées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.processedImages}/{stats.totalImages}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images optimisées</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.optimizedImages}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Espace économisé</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(stats.totalSavings / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
              <Download className="h-8 w-8 text-orange-600" />
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compression</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(stats.compressionRatio * 100).toFixed(1)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Barre de progression */}
        {stats.isRunning && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progression</h3>
              <span className="text-sm text-gray-600">
                Batch {stats.currentBatch}/{stats.totalBatches}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.totalBatches > 0 ? (stats.currentBatch / stats.totalBatches) * 100 : 0}%` 
                }}
              />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-600 rounded-full mr-2 animate-pulse" />
                Optimisation en cours...
              </div>
              <div>
                {stats.processedImages > 0 && (
                  <span>
                    Vitesse: ~{((stats.processedImages / Math.max(stats.currentBatch, 1)) * 60).toFixed(0)} images/min
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Résultats détaillés */}
        {stats.completed && stats.results.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Résultats Détaillés ({stats.results.length} fichiers traités)
            </h3>
            
            {/* Résumé rapide */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.results.filter(r => r.status === 'optimized').length}
                </div>
                <div className="text-sm text-gray-600">Optimisées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.results.filter(r => r.status === 'skipped').length}
                </div>
                <div className="text-sm text-gray-600">Ignorées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Erreurs</div>
              </div>
            </div>
            
            {/* Liste détaillée */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {stats.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result.status === 'optimized' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {result.status === 'skipped' && <Pause className="h-4 w-4 text-blue-600" />}
                    {result.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    
                    <span className="text-sm font-medium text-gray-900">
                      {result.file.substring(0, 20)}...
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {result.status === 'optimized' && result.originalSize && result.optimizedSize && (
                      <span className="text-green-600 font-medium">
                        {Math.round((result.originalSize - result.optimizedSize) / 1024)}KB économisés 
                        ({(result.compression! * 100).toFixed(1)}%)
                      </span>
                    )}
                    {result.status === 'skipped' && (
                      <span className="text-blue-600">{result.reason || 'Déjà optimisé'}</span>
                    )}
                    {result.status === 'error' && (
                      <span className="text-red-600">{result.error || 'Erreur traitement'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message de succès */}
        {stats.completed && stats.optimizedImages > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Optimisation Terminée avec Succès !
                </h3>
                <p className="text-green-700">
                  {stats.optimizedImages} images optimisées, {(stats.totalSavings / 1024 / 1024).toFixed(1)}MB économisés
                  ({(stats.compressionRatio * 100).toFixed(1)}% compression globale)
                </p>
                <p className="text-sm text-green-600 mt-2">
                  ℹ️ <strong>Note :</strong> Les nouvelles tailles peuvent prendre quelques minutes à apparaître dans le scan suivant (cache Supabase).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Erreurs */}
        {stats.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Erreurs ({stats.errors.length})
            </h3>
            <div className="space-y-2">
              {stats.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-sm text-red-700">
                  <span className="font-medium">{error.file}:</span> {error.error}
                </div>
              ))}
              {stats.errors.length > 5 && (
                <div className="text-sm text-red-600">
                  ... et {stats.errors.length - 5} autres erreurs
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}