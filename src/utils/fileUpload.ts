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
  // Types MIME autorisés (whitelist stricte)
  ALLOWED_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/gif'
  ] as const,
  
  // Extensions autorisées (double validation)
  ALLOWED_EXTENSIONS: [
    'png',
    'jpeg',
    'gif'
  ] as const,
  
  // Limites strictes
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PER_TICKET: 5,
  
  // Magic bytes pour validation contenu
  MAGIC_BYTES: {
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/gif': [0x47, 0x49, 0x46]
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
 * Valide le type MIME d'un fichier
 */
function validateMimeType(file: File): boolean {
  return (SECURITY_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)
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
 * Valide les magic bytes (signature fichier)
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
      
      const bytes = new Uint8Array(arrayBuffer.slice(0, 8))
      const expectedBytes = SECURITY_CONFIG.MAGIC_BYTES[file.type as keyof typeof SECURITY_CONFIG.MAGIC_BYTES]
      
      if (!expectedBytes) {
        resolve(false)
        return
      }
      
      // Vérifier que les premiers bytes correspondent
      const matches = expectedBytes.every((byte, index) => bytes[index] === byte)
      resolve(matches)
    }
    
    reader.onerror = () => resolve(false)
    reader.readAsArrayBuffer(file.slice(0, 8))
  })
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
    throw new FileUploadError(
      'Type de fichier non autorisé. Seules les images PNG, JPEG et GIF sont acceptées.',
      'INVALID_MIME_TYPE',
      { fileType: file.type, allowedTypes: SECURITY_CONFIG.ALLOWED_MIME_TYPES }
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
    throw new FileUploadError(
      `Fichier trop volumineux. Taille maximum : ${SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`,
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
  file: File
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
      .from('support-attachments')
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
      .from('support-attachments')
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
 * Supprime un fichier du storage (cleanup)
 */
export async function deleteSecureFile(filename: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Vérifier que l'utilisateur peut supprimer ce fichier
    if (!filename.startsWith(user.id + '/')) return false
    
    const { error } = await supabase.storage
      .from('support-attachments')
      .remove([filename])
    
    return !error
  } catch {
    return false
  }
}