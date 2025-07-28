// ============================================================================
// SYSTÈME D'UPLOAD SÉCURISÉ - IRONTRACK
// ============================================================================
// Protection complète contre les vulnérabilités d'upload
// Validation multi-couches + sanitisation + logging

import { createClient } from '@/utils/supabase/client'
import DOMPurify from 'isomorphic-dompurify'

// Types sécurisés
export interface SecureAttachment {
  id: string // UUID généré
  name: string // Nom sanitisé avec UUID
  originalName: string // Nom original (sanitisé)
  type: string // MIME type validé
  size: number // Taille en bytes
  url: string // URL Supabase signée
  uploadedAt: string // ISO timestamp
}

export interface UploadResult {
  success: boolean
  attachment?: SecureAttachment
  error?: string
}

// Configuration sécurisée
const SECURITY_CONFIG = {
  // Types MIME autorisés (whitelist avec variantes mobiles/iCloud)
  ALLOWED_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/jpg', // Variante parfois utilisée
    'image/gif',
    'image/heic',
    'image/heif',
    'application/octet-stream', // iCloud/mobile parfois
    '' // Type vide sur certains mobiles
  ] as const,
  
  // Extensions autorisées (double validation)
  ALLOWED_EXTENSIONS: [
    'png',
    'jpeg',
    'jpg',
    'gif',
    'heic',
    'heif',
    'jfif', // Format JPEG alternatif
    'webp'  // Format moderne supporté
  ] as const,
  
  // Limites strictes
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB (augmenté pour photos iPhone HEIC)
  MAX_FILES_PER_TICKET: 5,
  
  // Magic bytes pour validation contenu
  MAGIC_BYTES: {
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/gif': [0x47, 0x49, 0x46],
    'image/heic': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
    'image/heif': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x66]
  }
} as const

// Classe d'erreurs spécifique
export class FileUploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'FileUploadError'
  }
}

// ============================================================================
// VALIDATIONS SÉCURISÉES
// ============================================================================

/**
 * Valide le type MIME d'un fichier avec fallback pour mobiles/iCloud
 */
function validateMimeType(file: File): boolean {
  console.log('[DEBUG] Validating file:', {
    name: file.name,
    type: file.type,
    size: file.size
  })
  
  // Si le type MIME est défini et reconnu (incluant types vides)
  if ((SECURITY_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type as any)) {
    console.log('[DEBUG] MIME type accepted:', file.type)
    return true
  }
  
  // Fallback spécial pour iCloud et mobiles
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && (SECURITY_CONFIG.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    console.log('[DEBUG] Extension accepted as fallback:', ext)
    return true
  }
  
  // Fallback pour types MIME non standards mais extensions valides
  if (file.type && file.type.startsWith('image/') && ext) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'heic', 'heif', 'jfif', 'webp']
    if (imageExtensions.includes(ext)) {
      console.log('[DEBUG] Image type with valid extension accepted:', file.type, ext)
      return true
    }
  }
  
  console.log('[DEBUG] File rejected:', { type: file.type, extension: ext })
  return false
}

/**
 * Valide l'extension d'un fichier
 */
function validateExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false
  return (SECURITY_CONFIG.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)
}

/**
 * Valide la taille du fichier
 */
function validateFileSize(file: File): boolean {
  return file.size <= SECURITY_CONFIG.MAX_FILE_SIZE && file.size > 0
}

/**
 * Valide le nom de fichier (sanitisation)
 */
function validateFilename(filename: string): boolean {
  // Nom de fichier sécurisé : pas de caractères dangereux
  const dangerousPatterns = [
    /\.\./g, // Directory traversal
    /[<>:\"\/\\|?*]/g, // Caractères Windows dangereux
    /[\x00-\x1F]/g, // Caractères de contrôle
    /^\./, // Fichiers cachés
    /\.$/, // Point final
    /\s{2,}/g // Espaces multiples
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(filename))
}

/**
 * Valide les magic bytes (signature fichier) avec fallback mobile
 */
async function validateMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = function(e) {
      const arrayBuffer = e.target?.result as ArrayBuffer
      if (!arrayBuffer) {
        resolve(false)
        return
      }
      
      const bytes = new Uint8Array(arrayBuffer.slice(0, 12))
      
      // Détecter automatiquement le type de fichier par magic bytes
      const detectedType = detectFileTypeByMagicBytes(bytes)
      
      if (detectedType) {
        // Si on détecte un type image valide, accepter
        const validImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/heic', 'image/heif']
        resolve(validImageTypes.includes(detectedType))
        return
      }
      
      // Fallback: vérification par type MIME déclaré
      const expectedBytes = SECURITY_CONFIG.MAGIC_BYTES[file.type as keyof typeof SECURITY_CONFIG.MAGIC_BYTES]
      
      if (!expectedBytes) {
        // Pour les types non référencés ou vides, validation flexible
        if (!file.type || file.type === '' || file.type === 'application/octet-stream') {
          // Essayer de détecter JPEG, PNG ou HEIC par signature
          if (detectFileTypeByMagicBytes(bytes)) {
            resolve(true)
            return
          }
        }
        
        // HEIC spécifique
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().includes('.heic')) {
          const heicSignatures = [
            [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], // ftyp heic
            [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x78], // ftyp heix  
            [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x76, 0x63], // ftyp hevc
          ]
          
          const bytesHex = Array.from(bytes)
          const hasHeicSignature = heicSignatures.some(signature => {
            for (let i = 0; i <= bytesHex.length - signature.length; i++) {
              if (signature.every((byte, j) => bytesHex[i + j] === byte)) {
                return true
              }
            }
            return false
          })
          
          resolve(hasHeicSignature)
          return
        }
        resolve(false)
        return
      }
      
      // Vérifier que les premiers bytes correspondent
      const matches = expectedBytes.every((byte, index) => bytes[index] === byte)
      resolve(matches)
    }
    
    reader.onerror = () => resolve(false)
    reader.readAsArrayBuffer(file.slice(0, 12))
  })
}

/**
 * Détecte le type de fichier par magic bytes
 */
function detectFileTypeByMagicBytes(bytes: Uint8Array): string | null {
  const signatures: { [key: string]: number[] } = {
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/gif': [0x47, 0x49, 0x46],
  }
  
  for (const [type, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => bytes[index] === byte)) {
      return type
    }
  }
  
  // Vérification HEIC plus flexible
  const bytesArray = Array.from(bytes)
  const heicPatterns = [
    [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], // ftyp heic
    [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x78], // ftyp heix
  ]
  
  for (const pattern of heicPatterns) {
    for (let i = 0; i <= bytesArray.length - pattern.length; i++) {
      if (pattern.every((byte, j) => bytesArray[i + j] === byte)) {
        return 'image/heic'
      }
    }
  }
  
  return null
}

/**
 * Scanner antivirus basique (détection patterns dangereux)
 */
async function scanForMaliciousContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = function(e) {
      const content = e.target?.result as string
      if (!content) {
        resolve(true) // Safe si pas de contenu
        return
      }
      
      // Patterns dangereux dans le contenu
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload/i,
        /onerror/i,
        /onclick/i,
        /eval\(/i,
        /document\.cookie/i,
        /window\.location/i,
        /<iframe/i,
        /<embed/i,
        /<object/i
      ]
      
      const isSafe = !maliciousPatterns.some(pattern => pattern.test(content))
      resolve(isSafe)
    }
    
    reader.onerror = () => resolve(true) // Safe par défaut
    reader.readAsText(file.slice(0, 1024)) // Lire premiers 1KB
  })
}

// ============================================================================
// SYSTÈME D'UPLOAD SÉCURISÉ
// ============================================================================

/**
 * Valide complètement un fichier avant upload
 */
export async function validateFile(file: File): Promise<void> {
  // 1. Validation basique
  if (!file) {
    throw new FileUploadError('Aucun fichier fourni', 'NO_FILE')
  }
  
  if (!validateMimeType(file)) {
    console.log('[DEBUG] MIME validation failed:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      allowedTypes: SECURITY_CONFIG.ALLOWED_MIME_TYPES
    })
    
    throw new FileUploadError(
      `Type de fichier non autorisé (${file.type || 'type vide/mobile'}). Formats acceptés : PNG, JPEG, GIF, HEIC. Extensions acceptées : ${SECURITY_CONFIG.ALLOWED_EXTENSIONS.join(', ')}.`,
      'INVALID_MIME_TYPE',
      { fileType: file.type, fileName: file.name, allowedTypes: SECURITY_CONFIG.ALLOWED_MIME_TYPES }
    )
  }
  
  if (!validateExtension(file.name)) {
    throw new FileUploadError(
      'Extension de fichier non autorisée.',
      'INVALID_EXTENSION',
      { fileName: file.name, allowedExtensions: SECURITY_CONFIG.ALLOWED_EXTENSIONS }
    )
  }
  
  if (!validateFileSize(file)) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
    const maxSizeMB = (SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)
    throw new FileUploadError(
      `Fichier trop volumineux (${fileSizeMB}MB). Taille maximum autorisée : ${maxSizeMB}MB. Conseil : compressez votre photo avant l'upload.`,
      'FILE_TOO_LARGE',
      { fileSize: file.size, maxSize: SECURITY_CONFIG.MAX_FILE_SIZE }
    )
  }
  
  if (!validateFilename(file.name)) {
    throw new FileUploadError(
      'Nom de fichier invalide ou potentiellement dangereux.',
      'INVALID_FILENAME',
      { fileName: file.name }
    )
  }
  
  // 2. Validation avancée (async)
  const [magicBytesValid, contentSafe] = await Promise.all([
    validateMagicBytes(file),
    scanForMaliciousContent(file)
  ])
  
  if (!magicBytesValid) {
    throw new FileUploadError(
      'Le contenu du fichier ne correspond pas à son type déclaré.',
      'INVALID_MAGIC_BYTES',
      { fileType: file.type }
    )
  }
  
  if (!contentSafe) {
    throw new FileUploadError(
      'Contenu potentiellement malicieux détecté dans le fichier.',
      'MALICIOUS_CONTENT'
    )
  }
}

/**
 * Génère un nom de fichier sécurisé avec UUID
 */
function generateSecureFilename(originalName: string, userUuid: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase()
  const uuid = crypto.randomUUID()
  return `${userUuid}/${uuid}.${ext}`
}

/**
 * Sanitise le nom de fichier original
 */
function sanitizeFilename(filename: string): string {
  return DOMPurify.sanitize(filename)
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Remplacer caractères dangereux
    .replace(/_{2,}/g, '_') // Réduire underscores multiples
    .substring(0, 100) // Limiter longueur
}

/**
 * Upload sécurisé d'un fichier vers Supabase Storage
 */
export async function uploadSecureFile(
  file: File,
  bucket: string = 'avatars'
): Promise<UploadResult> {
  try {
    // 1. Validation complète
    await validateFile(file)
    
    // 2. Initialisation Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new FileUploadError('Utilisateur non authentifié', 'NOT_AUTHENTICATED')
    }
    
    // 3. Génération nom sécurisé
    const secureFilename = generateSecureFilename(file.name, user.id)
    const sanitizedOriginalName = sanitizeFilename(file.name)
    
    // 4. Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(secureFilename, file, {
        cacheControl: '3600',
        upsert: false // Pas d'écrasement
      })
    
    if (uploadError) {
      throw new FileUploadError(
        'Échec de l\'upload du fichier',
        'UPLOAD_FAILED',
        { supabaseError: uploadError }
      )
    }
    
    // 5. Générer URL signée sécurisée
    const { data: urlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(secureFilename, 24 * 60 * 60) // 24h
    
    if (!urlData?.signedUrl) {
      throw new FileUploadError('Impossible de générer l\'URL du fichier', 'URL_GENERATION_FAILED')
    }
    
    // 6. Créer objet attachment sécurisé
    const attachment: SecureAttachment = {
      id: crypto.randomUUID(),
      name: secureFilename,
      originalName: sanitizedOriginalName,
      type: file.type,
      size: file.size,
      url: urlData.signedUrl,
      uploadedAt: new Date().toISOString()
    }
    
    // 7. Log de sécurité
    console.log(`[SECURITY] File uploaded: ${sanitizedOriginalName} (${file.size} bytes) by user ${user.id}`)
    
    return {
      success: true,
      attachment
    }
    
  } catch (error) {
    console.error('[SECURITY] File upload failed:', error)
    
    return {
      success: false,
      error: error instanceof FileUploadError 
        ? error.message 
        : 'Erreur inconnue lors de l\'upload'
    }
  }
}

/**
 * Upload multiple files (avec limite)
 */
export async function uploadMultipleFiles(
  files: FileList | File[]
): Promise<UploadResult[]> {
  const fileArray = Array.from(files)
  
  if (fileArray.length > SECURITY_CONFIG.MAX_FILES_PER_TICKET) {
    throw new FileUploadError(
      `Trop de fichiers. Maximum autorisé : ${SECURITY_CONFIG.MAX_FILES_PER_TICKET}`,
      'TOO_MANY_FILES'
    )
  }
  
  // Upload séquentiel pour éviter la surcharge
  const results: UploadResult[] = []
  
  for (const file of fileArray) {
    const result = await uploadSecureFile(file)
    results.push(result)
    
    // Si un upload échoue, arrêter le processus
    if (!result.success) {
      break
    }
  }
  
  return results
}

/**
 * Upload spécialisé pour les photos d'exercices
 * Utilise le bucket 'exercise-images' existant dans Supabase Storage
 */
export async function uploadExercisePhoto(file: File): Promise<UploadResult> {
  return uploadSecureFile(file, 'exercise-images')
}

/**
 * Supprime un fichier du storage (cleanup)
 */
export async function deleteSecureFile(filename: string, bucket: string = 'avatars'): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Vérifier que l'utilisateur peut supprimer ce fichier
    if (!filename.startsWith(user.id + '/')) return false
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filename])
    
    return !error
  } catch {
    return false
  }
}