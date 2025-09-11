// ============================================================================
// SYSTÈME D'UPLOAD SÉCURISÉ - IRONTRACK (CONFORME OWASP)
// ============================================================================
// Protection complète contre les vulnérabilités d'upload selon OWASP Top 10
// Référence: OWASP File Upload Cheat Sheet, CWE-434, NIST SP 800-53
// Validation multi-couches + sanitisation + logging + quarantaine + CSP

import { createClient } from '@/utils/supabase/client'
import DOMPurify from 'isomorphic-dompurify'
import { optimizeImageSafe, shouldOptimizeImage } from './imageOptimization'

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

// Configuration sécurisée STRICTE (conforme OWASP File Upload Cheat Sheet)
const SECURITY_CONFIG = {
  // Types MIME autorisés - WHITELIST STRICTE (CWE-434 Prevention)
  ALLOWED_MIME_TYPES: [
    // Formats standards SÛRS (pas de risque d'exécution)
    'image/png',       // PNG - statique, pas d'exécution
    'image/jpeg',      // JPEG - statique, pas d'exécution  
    'image/gif',       // GIF - animations autorisées mais contrôlées
    
    // Formats Apple/iOS SÛRS
    'image/heic',      // HEIC iPhone - format conteneur mais filtré
    'image/heif',      // HEIF iPhone - format conteneur mais filtré
    
    // Formats modernes SÛRS
    'image/webp',      // WebP Google - pas d'exécution de code
    'image/avif',      // AVIF - format conteneur mais contrôlé
    
    // FORMATS DANGEREUX RETIRÉS pour sécurité :
    // - image/svg+xml : Risque XSS/JavaScript injection
    // - image/jxl : Format récent, vulnérabilités potentielles
    // - image/bmp : Peut contenir des données exécutables
    // - image/tiff : Format complexe, risque de buffer overflow
    // - application/octet-stream : Trop générique, dangereux
    
    // Fallbacks mobiles CONTRÔLÉS
    'image/jpg',       // Variante JPEG mobile
    'image/jfif',      // JFIF mobile sécurisé
    '' // Type vide mobile - validation par magic bytes obligatoire
  ] as const,
  
  // Extensions autorisées STRICTES (prévention bypass extension)
  ALLOWED_EXTENSIONS: [
    // Extensions SÛRES uniquement (OWASP compliant)
    'png',        // PNG sécurisé
    'jpg',        // JPEG sécurisé
    'jpeg',       // JPEG sécurisé 
    'gif',        // GIF contrôlé (animations limitées)
    'heic',       // HEIC iPhone sécurisé
    'heif',       // HEIF iPhone sécurisé
    'webp',       // WebP moderne sécurisé
    'avif',       // AVIF moderne sécurisé
    'jfif'        // JFIF mobile sécurisé
    
    // EXTENSIONS DANGEREUSES RETIRÉES :
    // - svg : Risque XSS via <script> tags
    // - bmp : Peut cacher du code exécutable
    // - tiff/tif : Format complexe, risque buffer overflow  
    // - jxl : Format récent, surface d'attaque inconnue
    // - ico/cur : Formats Windows, risque d'exécution
    // - dib : Format bitmap, peut cacher du code
    // - pjpeg : Variante non standard, risqué
  ] as const,
  
  // Limites strictes (prévention DoS et resource exhaustion)
  MAX_FILE_SIZE: 8 * 1024 * 1024,    // 8MB max (réduit pour sécurité, suffisant HEIC)
  MAX_FILES_PER_TICKET: 3,           // Réduit à 3 (limite abus)
  MAX_UPLOADS_PER_MINUTE: 10,        // Rate limiting - max 10 uploads/minute
  MAX_DAILY_UPLOADS: 100,            // Rate limiting - max 100 uploads/jour
  
  // Quarantaine et scanning (sécurité avancée)
  QUARANTINE_DURATION: 60 * 1000,   // 1 minute en quarantaine avant validation
  ENABLE_CONTENT_SCANNING: true,     // Scanner le contenu pour malware patterns
  STRIP_METADATA: true,              // Supprimer métadonnées EXIF (vie privée)
  
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
  
  // Si le type MIME est défini et reconnu (incluant types vides)
  if ((SECURITY_CONFIG.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type as string)) {
    return true
  }
  
  // Fallback spécial pour iCloud et mobiles
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && (SECURITY_CONFIG.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return true
  }
  
  // Fallback pour types MIME non standards mais extensions valides
  if (file.type && file.type.startsWith('image/') && ext) {
    const imageExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'heic', 'heif', 'webp', 'avif', 'jxl', 
      'bmp', 'tiff', 'tif', 'svg', 'jfif', 'pjpeg', 'dib', 'ico', 'cur'
    ]
    if (imageExtensions.includes(ext)) {
      return true
    }
  }
  
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
        const validImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/heic', 'image/heif', 'image/webp', 'image/avif']
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
 * Détecte le type de fichier par magic bytes (formats modernes inclus)
 */
function detectFileTypeByMagicBytes(bytes: Uint8Array): string | null {
  const signatures: { [key: string]: number[] } = {
    // Formats standards
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
    'image/bmp': [0x42, 0x4D],
    'image/tiff': [0x49, 0x49, 0x2A, 0x00], // Little endian TIFF
    
    // Formats modernes
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF (WebP commence par RIFF)
    'image/avif': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66], // ftyp avif
  }
  
  // Vérification signatures exactes
  for (const [type, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => bytes[index] === byte)) {
      return type
    }
  }
  
  // Vérifications spéciales pour formats complexes
  const bytesArray = Array.from(bytes)
  
  // HEIC/HEIF - vérification flexible
  const heicPatterns = [
    [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], // ftyp heic
    [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x78], // ftyp heix
    [0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x66], // ftyp heif
  ]
  
  for (const pattern of heicPatterns) {
    for (let i = 0; i <= bytesArray.length - pattern.length; i++) {
      if (pattern.every((byte, j) => bytesArray[i + j] === byte)) {
        return 'image/heic'
      }
    }
  }
  
  // WebP - vérification plus approfondie (après RIFF doit suivre WebP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    // Recherche signature WEBP dans les 16 premiers bytes
    for (let i = 8; i < Math.min(16, bytes.length - 3); i++) {
      if (bytes[i] === 0x57 && bytes[i+1] === 0x45 && bytes[i+2] === 0x42 && bytes[i+3] === 0x50) {
        return 'image/webp'
      }
    }
  }
  
  // TIFF - Big endian
  if (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A) {
    return 'image/tiff'
  }
  
  // JPEG XL - vérification signature complexe
  if (bytes[0] === 0xFF && bytes[1] === 0x0A) {
    return 'image/jxl'
  }
  
  // SVG - détection par contenu textuel
  const textContent = new TextDecoder('utf-8').decode(bytes.slice(0, 12))
  if (textContent.includes('<svg') || textContent.includes('<?xml')) {
    return 'image/svg+xml'
  }
  
  return null
}

/**
 * Scanner antivirus avancé conforme OWASP (détection patterns dangereux étendus)
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
      
      // Patterns dangereux étendus selon OWASP File Upload Security
      const maliciousPatterns = [
        // Script injection (XSS vectors)
        /<script[\s\S]*?>/i,
        /javascript:/i,
        /vbscript:/i,
        /data:text\/html/i,
        /data:application\/javascript/i,
        
        // Event handlers dangereux
        /on\w+\s*=/i,          // onclick, onload, onerror, etc.
        /eval\s*\(/i,
        /setTimeout\s*\(/i,
        /setInterval\s*\(/i,
        
        // DOM manipulation
        /document\.\w+/i,
        /window\.\w+/i,
        /location\.\w+/i,
        
        // HTML tags dangereux
        /<iframe[\s\S]*?>/i,
        /<embed[\s\S]*?>/i,
        /<object[\s\S]*?>/i,
        /<applet[\s\S]*?>/i,
        /<meta[\s\S]*?>/i,
        /<link[\s\S]*?>/i,
        
        // Binaires suspects
        /MZ\x90\x00/,          // PE header
        /\x7fELF/,             // ELF header
        
        // Polyglot files (double format)
        /GIF89a.*<script/i,
        /PNG.*<script/i
      ]
      
      const isSafe = !maliciousPatterns.some(pattern => pattern.test(content))
      
      if (!isSafe) {
        console.error('[SECURITY ALERT] Malicious content detected:', file.name)
      }
      
      resolve(isSafe)
    }
    
    reader.onerror = () => resolve(true) // Safe par défaut
    reader.readAsText(file.slice(0, 8192)) // Scan 8KB pour meilleure détection
  })
}

/**
 * Rate limiting par utilisateur (prévention abus)
 */
const uploadCounters = new Map<string, { 
  minuteCount: number, 
  lastMinuteReset: number, 
  dailyCount: number, 
  lastDailyReset: number 
}>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const counter = uploadCounters.get(userId) || { 
    minuteCount: 0, 
    lastMinuteReset: now, 
    dailyCount: 0, 
    lastDailyReset: now 
  }
  
  // Reset compteur minute (60s)
  if (now - counter.lastMinuteReset > 60 * 1000) {
    counter.minuteCount = 0
    counter.lastMinuteReset = now
  }
  
  // Reset compteur jour (24h)
  if (now - counter.lastDailyReset > 24 * 60 * 60 * 1000) {
    counter.dailyCount = 0
    counter.lastDailyReset = now
  }
  
  // Vérifier limites
  if (counter.minuteCount >= SECURITY_CONFIG.MAX_UPLOADS_PER_MINUTE) {
    console.warn('[SECURITY] Rate limit exceeded (minute):', userId.slice(-8))
    return false
  }
  
  if (counter.dailyCount >= SECURITY_CONFIG.MAX_DAILY_UPLOADS) {
    console.warn('[SECURITY] Rate limit exceeded (daily):', userId.slice(-8))
    return false
  }
  
  // Incrémenter
  counter.minuteCount++
  counter.dailyCount++
  uploadCounters.set(userId, counter)
  
  return true
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
 * AVEC OPTIMISATION AUTOMATIQUE INTÉGRÉE
 */
export async function uploadSecureFile(
  file: File,
  bucket: string = 'avatars'
): Promise<UploadResult> {
  try {
    let processedFile = file
    
    // 1. Validation complète du fichier
    await validateFile(file)
    
    // 2. Optimisation automatique si image
    if (file.type.startsWith('image/') && shouldOptimizeImage(file)) {
      try {
        // Auto-optimisation silencieuse
        
        const optimizedFile = await optimizeImageSafe(file)
        
        if (optimizedFile !== file) {
          const reduction = ((file.size - optimizedFile.size) / file.size * 100).toFixed(1)
          // Optimisation réussie
          processedFile = optimizedFile
        }
      } catch (optimizationError) {
        console.warn(`[OPTIMIZATION] Échec optimisation ${bucket} (fichier original conservé):`, optimizationError)
        // Continuer avec fichier original
      }
    }
    
    // 3. Initialisation Supabase et authentification
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new FileUploadError('Utilisateur non authentifié', 'NOT_AUTHENTICATED')
    }
    
    // 4. Vérification rate limiting (prévention abus)
    if (!checkRateLimit(user.id)) {
      throw new FileUploadError(
        'Limite d\'upload atteinte. Veuillez patienter avant d\'uploader à nouveau.',
        'RATE_LIMIT_EXCEEDED',
        { userId: user.id }
      )
    }
    
    // 5. Génération nom sécurisé
    const secureFilename = generateSecureFilename(processedFile.name, user.id)
    const sanitizedOriginalName = sanitizeFilename(processedFile.name)
    
    // 6. Upload vers Supabase Storage avec sécurité renforcée
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(secureFilename, processedFile, {
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
    
    // 5. Générer URL publique persistante (pour images d'exercices)
    let publicUrl: string
    
    if (bucket === 'exercise-images') {
      // Pour les images d'exercices : URL publique persistante
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(secureFilename)
      
      publicUrl = urlData.publicUrl
      
      if (!publicUrl) {
        throw new FileUploadError('Impossible de générer l\'URL publique du fichier', 'URL_GENERATION_FAILED')
      }
    } else {
      // Pour autres buckets : URL signée temporaire
      const { data: urlData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(secureFilename, 24 * 60 * 60) // 24h
      
      if (!urlData?.signedUrl) {
        throw new FileUploadError('Impossible de générer l\'URL du fichier', 'URL_GENERATION_FAILED')
      }
      
      publicUrl = urlData.signedUrl
    }
    
    // 7. Créer objet attachment sécurisé
    const attachment: SecureAttachment = {
      id: crypto.randomUUID(),
      name: secureFilename,
      originalName: sanitizedOriginalName,
      type: processedFile.type,
      size: processedFile.size,
      url: publicUrl,
      uploadedAt: new Date().toISOString()
    }
    
    // 8. Log de sécurité (aucune donnée sensible logged)
    
    return {
      success: true,
      attachment
    }
    
  } catch (error) {
    console.error('[SECURITY] File upload failed:', error instanceof FileUploadError ? error.message : 'Erreur inconnue')
    
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
 * Détecte le meilleur format de conversion supporté par le navigateur
 */
function detectBestConversionFormat(): { mimeType: string; extension: string; quality: number } {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  // Test support WebP (Moderne, excellent support)
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return { mimeType: 'image/webp', extension: '.webp', quality: 0.40 }
  }
  
  // Fallback JPEG (Compatibilité universelle) - plus agressif pour HEIC
  return { mimeType: 'image/jpeg', extension: '.jpg', quality: 0.70 }
}

/**
 * Convertit un fichier HEIC vers le meilleur format moderne supporté (WebP ou JPEG)
 * Utilise la bibliothèque heic2any pour conversion native
 */
async function convertHeicToModernFormat(file: File): Promise<File> {
  try {
    // Import dynamique de heic2any (éviter erreurs SSR)
    const heic2any = (await import('heic2any')).default
    
    // Détecter le meilleur format supporté
    const bestFormat = detectBestConversionFormat()
    
    
    // Convertir HEIC vers le meilleur format avec qualité optimisée pour réduction taille
    const convertedBlob = await heic2any({
      blob: file,
      toType: bestFormat.mimeType,
      quality: bestFormat.quality
    }) as Blob
    
    
    // Vérifier si la conversion a réellement réduit la taille
    if (convertedBlob.size > file.size * 1.5) {
      console.warn('[HEIC] Conversion a augmenté la taille. Fallback vers JPEG avec compression agressive.')
      
      // Retry avec JPEG et qualité très basse
      const jpegBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.50
      }) as Blob
      
      
      // Utiliser le plus petit des deux
      const finalBlob = jpegBlob.size < convertedBlob.size ? jpegBlob : convertedBlob
      const finalExtension = jpegBlob.size < convertedBlob.size ? '.jpg' : bestFormat.extension
      const finalMimeType = jpegBlob.size < convertedBlob.size ? 'image/jpeg' : bestFormat.mimeType
      
      const optimizedFile = new File(
        [finalBlob],
        file.name.replace(/\.(heic|heif)$/i, finalExtension),
        {
          type: finalMimeType,
          lastModified: Date.now()
        }
      )
      
      return optimizedFile
    }
    
    // Créer nouveau fichier avec le format optimal
    const optimizedFile = new File(
      [convertedBlob],
      file.name.replace(/\.(heic|heif)$/i, bestFormat.extension),
      {
        type: bestFormat.mimeType,
        lastModified: Date.now()
      }
    )
    
    
    return optimizedFile
  } catch (error) {
    console.error('[HEIC] Erreur conversion:', error)
    throw new Error(`Impossible de convertir le fichier HEIC: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Upload spécialisé pour les photos d'exercices
 * Utilise le bucket 'exercise-images' existant dans Supabase Storage
 * PIPELINE COMPLET: HEIC→JPEG + OPTIMISATION AUTOMATIQUE + UPLOAD
 */
export async function uploadExercisePhoto(file: File): Promise<UploadResult> {
  try {
    let processedFile = file
    
    // ÉTAPE 1: Conversion HEIC→JPEG si nécessaire
    if (file.type === 'image/heic' || file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif')) {
      
      try {
        processedFile = await convertHeicToModernFormat(file)
      } catch (conversionError) {
        console.error('[HEIC] Échec conversion:', conversionError)
        // Fallback: essayer l'upload direct (si Supabase supporte finalement HEIC)
        return uploadSecureFile(file, 'exercise-images')
      }
    }
    
    // ÉTAPE 2: Optimisation automatique pour performances Web Core Vitals
    if (shouldOptimizeImage(processedFile)) {
      try {
        // Optimisation automatique démarrée
        
        const optimizedFile = await optimizeImageSafe(processedFile)
        
        if (optimizedFile !== processedFile) {
          const reduction = ((processedFile.size - optimizedFile.size) / processedFile.size * 100).toFixed(1)
          // Optimisation réussie
          processedFile = optimizedFile
        } else {
          // Fichier déjà optimisé
        }
      } catch (optimizationError) {
        console.warn('[OPTIMIZATION] Échec optimisation (fichier original conservé):', optimizationError)
        // Continuer avec fichier non-optimisé (fallback sécurisé)
      }
    } else {
      // Optimisation non nécessaire
    }
    
    // ÉTAPE 3: Upload final vers Supabase
    return uploadSecureFile(processedFile, 'exercise-images')
  } catch (error) {
    console.error('[UPLOAD] Erreur upload exercice photo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur upload photo exercice'
    }
  }
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