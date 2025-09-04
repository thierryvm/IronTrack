'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  X, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Shield,
  Smartphone,
  Zap,
  Crop
} from 'lucide-react'
import Image from 'next/image'
import { uploadExercisePhoto, SecureAttachment } from '@/utils/fileUpload'
import { ImageCropper } from '@/components/ui/ImageCropper'

interface ExercisePhotoUploadProps {
  onPhotoUploaded: (attachment: SecureAttachment) => void
  onPhotoRemoved?: () => void
  currentPhoto?: string
  disabled?: boolean
  className?: string
  maxPhotos?: number
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  success: boolean
}

export const ExercisePhotoUpload: React.FC<ExercisePhotoUploadProps> = ({
  onPhotoUploaded,
  onPhotoRemoved,
  currentPhoto,
  disabled = false,
  className = '',
  maxPhotos = 2 // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  })
  const [isDragging, setIsDragging] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  

  // Formats acceptés SÉCURISÉS (conforme OWASP) - formats dangereux retirés
  const acceptedTypes = [
    // Types MIME sûrs uniquement
    'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 
    'image/heic', 'image/heif', 'image/webp', 'image/avif', 'image/jfif',
    // Extensions explicites sécurisées
    '.png', '.jpg', '.jpeg', '.gif', '.heic', '.heif', '.webp', 
    '.avif', '.jfif'
    // RETIRÉS pour sécurité: SVG (XSS), BMP/TIFF (malware), JXL (récent)
  ].join(',')
  
  // Détection mobile pour optimiser l'interface
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      // Détection plus stable : priorité au touch et user agent
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth < 768
      
      setIsMobile(hasTouch || isMobileUA || isSmallScreen)
    }
    checkMobile()
    // Pas de listener resize pour éviter les changements intempestifs
  }, [])

  // Debug: log currentPhoto changes
  useEffect(() => {
    console.log('🖼️ currentPhoto changed:', currentPhoto)
  }, [currentPhoto])

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      success: false
    })
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        success: false
      })

      // Simuler progression
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90)
        }))
      }, 200)

      const result = await uploadExercisePhoto(file)
      clearInterval(progressInterval)

      if (result.success && result.attachment) {
        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          success: true
        })
        
        onPhotoUploaded(result.attachment)
        
        // Auto-reset après succès (mais seulement le message, pas la photo)
        setTimeout(() => {
          setUploadState(prev => ({
            ...prev,
            success: false,
            error: null
          }))
        }, 2000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false
      })
    }
  }, [onPhotoUploaded, resetUploadState])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || uploadState.isUploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0]) // Une seule photo à la fois
    }
  }, [disabled, uploadState.isUploading, handleFileUpload])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileUpload])

  const openFileDialog = () => {
    if (!disabled && !uploadState.isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const openCameraDialog = () => {
    if (!disabled && !uploadState.isUploading && fileInputRef.current) {
      // Déclencher l'input avec capture pour ouvrir la caméra
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
      // Remettre capture à false après
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.removeAttribute('capture')
        }
      }, 100)
    }
  }

  const removePhoto = () => {
    if (onPhotoRemoved) {
      onPhotoRemoved()
    }
    resetUploadState()
  }

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      // Convert the cropped image blob URL to a File object
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'cropped-exercise-photo.jpg', { type: 'image/jpeg' })
      
      // Upload the cropped image
      await handleFileUpload(file)
      
      // Close the cropper
      setShowCropper(false)
      
      // Clean up the blob URL
      URL.revokeObjectURL(croppedImageUrl)
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image croppée:', error)
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Erreur lors du traitement de l\'image',
        success: false
      })
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <Camera className="h-6 w-6 mr-2" />
          Photo de l&apos;exercice
        </h4>
        <div className="flex items-center text-xs text-gray-600 dark:text-safe-muted">
          <Smartphone className="h-5 w-5 mr-1" />
          Support HEIC (iPhone)
        </div>
      </div>

      {/* Zone d'upload ou photo actuelle */}
      {currentPhoto ? (
        <div className="relative group">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-transparent">
            <Image
              src={currentPhoto}
              alt="Photo de l'exercice"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top"
              onError={(e) => {
                console.error('Erreur chargement image:', currentPhoto, e)
                // Ajouter une classe d'erreur pour debug
                e.currentTarget.style.backgroundColor = '#ef4444'
                e.currentTarget.style.color = 'white'
              }}
              onLoad={() => {
                console.log('Image chargée avec succès:', currentPhoto)
              }}
            />
            
            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap gap-2 justify-center">
                {isMobile ? (
                  <>
                    <button
                      onClick={openCameraDialog}
                      className="bg-orange-600 dark:bg-orange-500 text-white px-3 py-3 rounded-md text-sm font-medium hover:bg-orange-700 flex items-center min-h-[44px] touch-manipulation"
                      disabled={disabled || uploadState.isUploading}
                    >
                      <Camera className="h-6 w-6 mr-1" />
                      Caméra
                    </button>
                    <button
                      onClick={openFileDialog}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  text-gray-900 dark:text-gray-100 px-3 py-3 rounded-md text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 flex items-center min-h-[44px] touch-manipulation"
                      disabled={disabled || uploadState.isUploading}
                    >
                      <ImageIcon className="h-6 w-6 mr-1" />
                      Photos
                    </button>
                    <button
                      onClick={() => setShowCropper(true)}
                      className="bg-blue-500 text-white px-3 py-3 rounded-md text-sm font-medium hover:bg-blue-600 flex items-center min-h-[44px] touch-manipulation"
                      disabled={disabled || uploadState.isUploading}
                    >
                      <Crop className="h-6 w-6 mr-1" />
                      Recadrer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={openFileDialog}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  text-gray-900 dark:text-gray-100 px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 flex items-center min-h-[44px] touch-manipulation"
                      disabled={disabled || uploadState.isUploading}
                    >
                      <Camera className="h-6 w-6 mr-2" />
                      Changer
                    </button>
                    <button
                      onClick={() => setShowCropper(true)}
                      className="bg-blue-500 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-600 flex items-center min-h-[44px] touch-manipulation"
                      disabled={disabled || uploadState.isUploading}
                    >
                      <Crop className="h-6 w-6 mr-2" />
                      Recadrer
                    </button>
                  </>
                )}
                <button
                  onClick={removePhoto}
                  className="bg-red-500 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-red-700 flex items-center min-h-[44px] touch-manipulation"
                  disabled={disabled || uploadState.isUploading}
                >
                  <X className="h-6 w-6 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={isMobile ? undefined : openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center ${isMobile ? '' : 'cursor-pointer'}
            transition-all duration-200 hover:bg-gray-50 dark:bg-gray-800 touch-manipulation min-h-[200px] sm:min-h-[240px]
            ${isDragging 
              ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${disabled || uploadState.isUploading
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-orange-400'
            }
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!isMobile) openFileDialog()
            }
          }}
          aria-label="Zone d'upload de photo d'exercice"
        >
          {/* Boutons mobiles overlay */}
          {isMobile && !uploadState.isUploading && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 flex flex-col items-center justify-center space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openCameraDialog()
                  }}
                  className="bg-orange-600 dark:bg-orange-500 text-white px-6 py-4 rounded-xl font-medium hover:bg-orange-700 flex items-center min-h-[56px] touch-manipulation shadow-lg"
                  disabled={disabled || uploadState.isUploading}
                >
                  <Camera className="h-6 w-6 mr-3" />
                  Prendre une photo
                </button>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openFileDialog()
                  }}
                  className="bg-blue-500 text-white px-6 py-4 rounded-xl font-medium hover:bg-blue-600 flex items-center min-h-[56px] touch-manipulation shadow-lg"
                  disabled={disabled || uploadState.isUploading}
                >
                  <ImageIcon className="h-6 w-6 mr-3" />
                  Choisir de la photothèque
                </button>
              </div>
            </div>
          )}
          {/* Contenu de la zone d'upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              {uploadState.isUploading ? (
                <Loader2 className="h-16 w-16 sm:h-12 sm:w-12 text-safe-info animate-spin" />
              ) : (
                <Camera className={`h-16 w-16 sm:h-12 sm:w-12 ${isDragging ? 'text-orange-800 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`} />
              )}
            </div>
            
            <div>
              {uploadState.isUploading ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-blue-600">Upload en cours...</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs mx-auto">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{uploadState.progress.toFixed(0)}%</p>
                </div>
              ) : (
                <>
                  <p className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {isDragging ? 'Relâchez pour uploader' : 'Ajoutez une photo'}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3">
                    {isMobile 
                      ? <><span className="text-orange-800 dark:text-orange-300 font-medium">Tapez pour choisir</span> : caméra ou photothèque</>
                      : <>Glissez votre photo ici ou <span className="text-orange-800 dark:text-orange-300 font-medium">cliquez pour sélectionner</span></>
                    }
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-safe-muted">
                    PNG, JPEG, GIF, HEIC, WebP, AVIF • Max 8MB • Sécurisé OWASP
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Badge sécurité */}
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Shield className="h-5 w-5 mr-1" />
            Sécurisé
          </div>
        </div>
      )}

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploadState.isUploading}
        aria-label="Sélectionner photo d'exercice"
      />

      {/* Messages d'état */}
      <AnimatePresence>
        {uploadState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-safe-error mr-2" />
              <p className="text-sm text-red-800">{uploadState.error}</p>
            </div>
          </motion.div>
        )}

        {uploadState.success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-safe-success mr-2" />
              <p className="text-sm text-green-800">Photo uploadée avec succès !</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Informations sur le format HEIC et optimisation */}
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Smartphone className="h-6 w-6 text-safe-info flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-1">
                📱 Compatible iPhone/iPad - HEIC vers JPEG
              </h5>
              <p className="text-xs text-blue-800">
                Les photos HEIC d&apos;Apple sont automatiquement converties en JPEG pour compatibilité. 
                La conversion préserve la qualité tout en optimisant la taille.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Zap className="h-6 w-6 text-safe-success flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-green-900 mb-1">
                ⚡ Optimisation automatique pour performances
              </h5>
              <p className="text-xs text-green-800">
                Les images sont automatiquement redimensionnées et compressées pour un chargement ultra-rapide 
                tout en préservant la qualité visuelle. Aucune action requise de votre part.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && currentPhoto && (
        <ImageCropper
          imageUrl={currentPhoto}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={4/3}
        />
      )}
    </div>
  )
}