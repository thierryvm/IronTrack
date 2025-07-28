'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  X, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Plus,
  Shield,
  Smartphone
} from 'lucide-react'
import Image from 'next/image'
import { uploadExercisePhoto, SecureAttachment, FileUploadError } from '@/utils/fileUpload'

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
  maxPhotos = 2
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Formats acceptés avec HEIC
  const acceptedTypes = 'image/png,image/jpeg,image/jpg,image/gif,image/heic,image/heif'

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
        
        // Auto-reset après succès
        setTimeout(resetUploadState, 2000)
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

  const removePhoto = () => {
    if (onPhotoRemoved) {
      onPhotoRemoved()
    }
    resetUploadState()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Camera className="h-4 w-4 mr-2" />
          Photo de l'exercice
        </h4>
        <div className="flex items-center text-xs text-gray-500">
          <Smartphone className="h-3 w-3 mr-1" />
          Support HEIC (iPhone)
        </div>
      </div>

      {/* Zone d'upload ou photo actuelle */}
      {currentPhoto ? (
        <div className="relative group">
          <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentPhoto}
              alt="Photo de l'exercice"
              fill
              className="object-cover"
            />
            
            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button
                  onClick={openFileDialog}
                  className="bg-white text-gray-900 px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center min-h-[44px] touch-manipulation"
                  disabled={disabled || uploadState.isUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Changer
                </button>
                <button
                  onClick={removePhoto}
                  className="bg-red-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-red-700 flex items-center min-h-[44px] touch-manipulation"
                  disabled={disabled || uploadState.isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
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
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer
            transition-all duration-200 hover:bg-gray-50 touch-manipulation min-h-[200px] sm:min-h-[240px]
            ${isDragging 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300'
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
              openFileDialog()
            }
          }}
          aria-label="Zone d'upload de photo d'exercice"
        >
          {/* Contenu de la zone d'upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              {uploadState.isUploading ? (
                <Loader2 className="h-16 w-16 sm:h-12 sm:w-12 text-blue-500 animate-spin" />
              ) : (
                <Camera className={`h-16 w-16 sm:h-12 sm:w-12 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
              )}
            </div>
            
            <div>
              {uploadState.isUploading ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-blue-600">Upload en cours...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{uploadState.progress.toFixed(0)}%</p>
                </div>
              ) : (
                <>
                  <p className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                    {isDragging ? 'Relâchez pour uploader' : 'Ajoutez une photo'}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 mb-3">
                    Glissez votre photo ici ou <span className="text-orange-600 font-medium">cliquez pour sélectionner</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    PNG, JPEG, GIF, HEIC • Max 10MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Badge sécurité */}
          <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Shield className="h-3 w-3 mr-1" />
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
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
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
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <p className="text-sm text-green-800">Photo uploadée avec succès !</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Informations sur le format HEIC */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Smartphone className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-1">
              📱 Compatible iPhone/iPad
            </h5>
            <p className="text-xs text-blue-800">
              Les photos HEIC d'Apple sont automatiquement prises en charge. 
              Prenez vos photos directement avec votre iPhone pour la meilleure qualité.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}