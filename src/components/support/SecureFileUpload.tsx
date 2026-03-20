'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  X, 
  Image, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  FileImage,
  Shield
} from 'lucide-react'
import { uploadMultipleFiles, SecureAttachment, FileUploadError } from '@/utils/fileUpload'

interface SecureFileUploadProps {
  onUploadComplete: (attachments: SecureAttachment[]) => void
  onUploadStart?: () => void
  maxFiles?: number
  disabled?: boolean
  className?: string
}

interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  attachment?: SecureAttachment
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onUploadComplete,
  onUploadStart,
  maxFiles = 5,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Formats acceptés pour l'input
  const acceptedTypes = 'image/png,image/jpeg,image/jpg,image/gif'

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

  const validateAndProcessFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validation nombre de fichiers
    if (fileArray.length > maxFiles) {
      throw new FileUploadError(
        `Trop de fichiers sélectionnés. Maximum: ${maxFiles}`,
        'TOO_MANY_FILES'
      )
    }

    // Validation types de fichiers côté client (première ligne de défense)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        throw new FileUploadError(
          `Type de fichier non supporté: ${file.name}. Seules les images PNG, JPEG et GIF sont acceptées.`,
          'INVALID_TYPE'
        )
      }
    }

    return fileArray
  }, [maxFiles])

  const processFileUpload = useCallback(async (files: FileList | File[]) => {
    try {
      // setIsUploading(true) // Variable removed to avoid unused warning
      onUploadStart?.()

      const validatedFiles = await validateAndProcessFiles(files)
      
      // Initialiser le suivi de progression
      const initialProgress: UploadProgress[] = validatedFiles.map(file => ({
        fileId: crypto.randomUUID(),
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }))
      setUploadProgress(initialProgress)

      // Simuler progression et upload réel
      const uploadPromises = validatedFiles.map(async (file, index) => {
        const progressItem = initialProgress[index]
        
        // Simuler progression upload
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => 
            prev.map(p => 
              p.fileId === progressItem.fileId && p.progress < 90
                ? { ...p, progress: Math.min(p.progress + Math.random() * 20, 90) }
                : p
            )
          )
        }, 200)

        try {
          const result = await uploadMultipleFiles([file])
          clearInterval(progressInterval)
          
          if (result[0]?.success && result[0].attachment) {
            setUploadProgress(prev =>
              prev.map(p =>
                p.fileId === progressItem.fileId
                  ? { 
                      ...p, 
                      progress: 100, 
                      status: 'success',
                      attachment: result[0].attachment 
                    }
                  : p
              )
            )
            return result[0].attachment
          } else {
            throw new Error(result[0]?.error || 'Upload failed')
          }
        } catch (error) {
          clearInterval(progressInterval)
          setUploadProgress(prev =>
            prev.map(p =>
              p.fileId === progressItem.fileId
                ? { 
                    ...p, 
                    progress: 0, 
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Upload failed'
                  }
                : p
            )
          )
          throw error
        }
      })

      const results = await Promise.allSettled(uploadPromises)
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<SecureAttachment> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)

      if (successfulUploads.length > 0) {
        onUploadComplete(successfulUploads)
      }

      // Auto-clear après succès
      setTimeout(() => {
        setUploadProgress([])
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(prev =>
        prev.map(p => ({
          ...p,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        }))
      )
    } finally {
      // setIsUploading(false) // Variable removed to avoid unused warning
    }
  }, [onUploadStart, onUploadComplete, validateAndProcessFiles])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFileUpload(files)
    }
  }, [disabled, processFileUpload])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFileUpload(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFileUpload])

  const removeProgressItem = (fileId: string) => {
    setUploadProgress(prev => prev.filter(p => p.fileId !== fileId))
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop sécurisée */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 hover:bg-muted
          ${isDragging 
            ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20' 
            : 'border-border'
          }
          ${disabled 
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
        aria-label="Zone d'upload de fichiers"
      >
        {/* Icône et texte */}
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <Upload className={`h-12 w-12 ${isDragging ? 'text-orange-800 dark:text-orange-300' : 'text-foreground'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground mb-1">
              {isDragging ? 'Relâchez pour uploader' : 'Glissez vos images ici'}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              ou <span className="text-orange-800 dark:text-orange-300 font-medium">cliquez pour sélectionner</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-safe-muted">
              PNG, JPEG, GIF • Max {maxFiles} fichiers • 5MB chacun
            </p>
          </div>
        </div>

        {/* Badge sécurité */}
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <Shield className="h-5 w-5 mr-1" />
          Sécurisé
        </div>
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        aria-label="Sélectionner fichiers"
      />

      {/* Progression des uploads */}
      <AnimatePresence>
        {uploadProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-foreground flex items-center">
              <FileImage className="h-6 w-6 mr-2" />
              Progression de l'upload
            </h4>
            
            {uploadProgress.map((progress) => (
              <motion.div
                key={progress.fileId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-muted rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Image className="h-6 w-6 text-gray-600 dark:text-safe-muted" aria-label="Icône fichier" />
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {progress.fileName}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {progress.status === 'uploading' && (
                      <Loader2 className="h-6 w-6 text-safe-info animate-spin" />
                    )}
                    {progress.status === 'success' && (
                      <CheckCircle className="h-6 w-6 text-safe-success" />
                    )}
                    {progress.status === 'error' && (
                      <AlertTriangle className="h-6 w-6 text-safe-error" />
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeProgressItem(progress.fileId)
                      }}
                      className="text-foreground hover:text-foreground dark:text-gray-300 p-1"
                      aria-label="Supprimer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Barre de progression */}
                {progress.status === 'uploading' && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Message d'erreur */}
                {progress.status === 'error' && progress.error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    {progress.error}
                  </div>
                )}
                
                {/* Message de succès */}
                {progress.status === 'success' && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
                    ✅ Fichier uploadé avec succès et sécurisé
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Informations de sécurité */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-safe-info flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              🔒 Sécurité des fichiers
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Validation multi-couches (type, taille, contenu)</li>
              <li>• Scan anti-malware automatique</li>
              <li>• Noms de fichiers UUID générés</li>
              <li>• URLs signées temporaires (24h)</li>
              <li>• Stockage isolé et chiffré</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}