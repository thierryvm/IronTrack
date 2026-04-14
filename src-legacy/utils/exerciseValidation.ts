/**
 * Validation sécurisée des exercices - Correction problème ExerciseEditForm2025
 * 
 * 🚨 PROBLÈME: Validation côté client uniquement + type'any' 
 * ✅ SOLUTION: Validation robuste côté serveur + client avec TypeScript strict
 */

import DOMPurify from'isomorphic-dompurify'

// Types stricts pour remplacer'any'
export interface ExerciseUpdateData {
 name: string
 exercise_type:'Musculation' |'Cardio'
 muscle_group: string
 equipment_id: number
 difficulty: number
 description?: string | null
 image_url?: string | null
 default_strength_metrics?: unknown
 default_cardio_metrics?: unknown
}

export interface ValidationResult<T = unknown> {
 isValid: boolean
 data?: T
 errors: string[]
}

// Constantes de validation - Groupes musculaires réels depuis BDD
const VALID_MUSCLE_GROUPS = [
'Abdominaux','Avant-bras','Biceps','Dos','Épaules', 
'Fessiers','Ischio-jambiers','Jambes','Mollets', 
'Obliques','Pectoraux','Quadriceps','Trapèzes','Triceps'
] as const

const VALID_EXERCISE_TYPES = ['Musculation','Cardio'] as const
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 5
const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 1000

// Patterns dangereux à détecter
const DANGEROUS_PATTERNS = [
 /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
 /javascript:/gi,
 /vbscript:/gi,
 /data:text\/html/gi,
 /on\w+\s*=/gi, // onclick, onload, etc.
 /expression\s*\(/gi,
 /@import/gi,
 /binding:/gi,
 /&#(\d+);/g, // HTML entities
 /&[a-zA-Z]+;/g // Named HTML entities
]

const SQL_INJECTION_PATTERNS = [
 /('|(\\'))((\%27)|(\\)|(')|(\%27))*((select|union|delete|insert|update|create|drop|exec|script|alert)(\s|\%20)+)/gi,
 /(union|select|insert|delete|update|drop|create|alter|exec|execute|script|declare|cursor|proc)(\s+|\b)/gi,
 /(\-\-|\/\*|\*\/|xp_|sp_)/gi,
 /;\s*(select|union|delete|insert|update|create|drop)/gi,
 // Pattern pour UNION sans espace forcé
 /\bunion\b.*\bselect\b/gi,
 // Pattern pour mots-clés SQL dangereux
 /\b(drop\s+table|truncate\s+table|delete\s+from|insert\s+into)\b/gi
]

/**
 * Sanitise une chaîne d'entrée contre XSS et injection
 */
export function sanitizeInput(input: string): string {
 if (typeof input !=='string') {
 throw new Error('Input must be a string')
}

 // Utiliser DOMPurify pour éliminer XSS - mais préserver le contenu texte
 const sanitized = DOMPurify.sanitize(input, { 
 ALLOWED_TAGS: [],
 ALLOWED_ATTR: [],
 KEEP_CONTENT: true,
 WHOLE_DOCUMENT: false,
 RETURN_DOM: false,
 RETURN_DOM_FRAGMENT: false
})

 // Vérifications supplémentaires contre patterns dangereux sur l'input original
 for (const pattern of DANGEROUS_PATTERNS) {
 if (pattern.test(input)) {
 throw new Error('Contenu dangereux détecté')
}
}

 // Vérifications SQL injection sur l'input original
 for (const pattern of SQL_INJECTION_PATTERNS) {
 if (pattern.test(input)) {
 throw new Error('Tentative d\'injection SQL détectée')
}
}

 return sanitized.trim()
}

/**
 * Valide le nom d'un exercice
 */
export function validateExerciseName(name: unknown): string {
 if (!name || (typeof name ==='string' && name.trim().length === 0)) {
 throw new Error('Le nom de l\'exercice est requis')
}

 if (typeof name !=='string') {
 throw new Error('Le nom doit être une chaîne de caractères')
}

 if (name.length > MAX_NAME_LENGTH) {
 throw new Error(`Nom trop long (max ${MAX_NAME_LENGTH} caractères)`)
}

 // Vérifier contenu malveillant AVANT sanitisation
 for (const pattern of DANGEROUS_PATTERNS) {
 if (pattern.test(name)) {
 throw new Error('Nom d\'exercice invalide')
}
}
 
 for (const pattern of SQL_INJECTION_PATTERNS) {
 if (pattern.test(name)) {
 throw new Error('Nom d\'exercice invalide')
}
}

 const sanitizedName = sanitizeInput(name)
 
 if (sanitizedName.length < 2) {
 throw new Error('Le nom doit faire au moins 2 caractères')
}

 // Vérifier caractères autorisés (lettres, chiffres, espaces, tirets, parenthèses)
 if (!/^[a-zA-ZÀ-ÿ0-9\s\-\(\)\.]+$/.test(sanitizedName)) {
 throw new Error('Nom d\'exercice invalide - caractères non autorisés')
}

 return sanitizedName
}

/**
 * Valide le groupe musculaire
 */
export function validateMuscleGroup(muscleGroup: unknown): string {
 if (!muscleGroup || (typeof muscleGroup ==='string' && muscleGroup.trim().length === 0)) {
 throw new Error('Le groupe musculaire est requis')
}

 if (typeof muscleGroup !=='string') {
 throw new Error('Le groupe musculaire doit être une chaîne')
}

 if (!VALID_MUSCLE_GROUPS.includes(muscleGroup as typeof VALID_MUSCLE_GROUPS[number])) {
 throw new Error(`Groupe musculaire invalide. Valeurs autorisées: ${VALID_MUSCLE_GROUPS.join(',')}`)
}

 return muscleGroup
}

/**
 * Valide le type d'exercice
 */
export function validateExerciseType(exerciseType: unknown):'Musculation' |'Cardio' {
 if (!VALID_EXERCISE_TYPES.includes(exerciseType as typeof VALID_EXERCISE_TYPES[number])) {
 throw new Error(`Type d'exercice invalide. Valeurs autorisées: ${VALID_EXERCISE_TYPES.join(',')}`)
}
 
 return exerciseType as'Musculation' |'Cardio'
}

/**
 * Valide l'ID d'équipement
 */
export function validateEquipmentId(equipmentId: unknown): number {
 if (typeof equipmentId ==='string') {
 const parsed = parseInt(equipmentId, 10)
 if (isNaN(parsed)) {
 throw new Error('ID d\'équipement doit être un nombre')
}
 equipmentId = parsed
}

 if (typeof equipmentId !=='number' || !Number.isInteger(equipmentId)) {
 throw new Error('ID d\'équipement doit être un entier')
}

 if (equipmentId < 1) {
 throw new Error('ID d\'équipement doit être positif')
}

 return equipmentId
}

/**
 * Valide la difficulté
 */
export function validateDifficulty(difficulty: unknown): number {
 if (typeof difficulty ==='string') {
 const parsed = parseInt(difficulty, 10)
 if (isNaN(parsed)) {
 throw new Error('Difficulté doit être un nombre')
}
 difficulty = parsed
}

 if (typeof difficulty !=='number' || !Number.isInteger(difficulty)) {
 throw new Error('Difficulté doit être un entier')
}

 if (difficulty < MIN_DIFFICULTY || difficulty > MAX_DIFFICULTY) {
 throw new Error(`Difficulté doit être entre ${MIN_DIFFICULTY} et ${MAX_DIFFICULTY}`)
}

 return difficulty
}

/**
 * Valide la description (optionnelle)
 */
export function validateDescription(description: unknown): string | null {
 if (!description || description ==='') {
 return null
}

 if (typeof description !=='string') {
 throw new Error('Description doit être une chaîne')
}

 if (description.length > MAX_DESCRIPTION_LENGTH) {
 throw new Error(`Description trop longue (max ${MAX_DESCRIPTION_LENGTH} caractères)`)
}

 const sanitized = sanitizeInput(description)
 
 // Vérification supplémentaire anti-XSS dans description
 if (/<[^>]+>/.test(sanitized)) {
 throw new Error('Description contient du contenu dangereux')
}

 return sanitized
}

/**
 * Valide l'URL de l'image (optionnelle)
 */
export function validateImageUrl(imageUrl: unknown): string | null {
 if (!imageUrl || imageUrl ==='') {
 return null
}

 if (typeof imageUrl !=='string') {
 throw new Error('URL d\'image doit être une chaîne')
}

 // Vérifications sécurité URL
 if (imageUrl.startsWith('javascript:') || imageUrl.startsWith('data:text/html')) {
 throw new Error('URL d\'image invalide')
}

 try {
 const url = new URL(imageUrl)
 if (!['http:','https:'].includes(url.protocol)) {
 throw new Error('URL d\'image doit utiliser HTTP/HTTPS')
}
} catch {
 throw new Error('URL d\'image malformée')
}

 return imageUrl
}

/**
 * Détecte les propriétés dangereuses (prototype pollution, etc.)
 */
function checkForDangerousProperties(obj: Record<string, unknown>): void {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const dangerousKeys = [
'__proto__', 
'constructor', 
'prototype'
 ]

 // Vérification prototype pollution spécifique
 if ('__proto__' in obj && (obj as Record<string, unknown>).__proto__ !== Object.prototype) {
 throw new Error('Propriétés dangereuses détectées')
}

 // Vérifier si constructor a été modifié
 if ('constructor' in obj && (obj as Record<string, unknown>).constructor !== Object) {
 // Vérifier si c'est une modification malveillante ou juste un objet normal
 const constructor = (obj as Record<string, unknown>).constructor
 if (constructor && typeof (constructor as unknown as Record<string, unknown>).constructor ==='function') {
 throw new Error('Propriétés dangereuses détectées')
}
}

 // Vérifier fonctions dans l'objet
 for (const [key, value] of Object.entries(obj)) {
 if (typeof value ==='function') {
 throw new Error(`Propriété fonction détectée: ${key}`)
}
}
}

/**
 * Validation complète des données d'exercice - REMPLACE le type'any'
 */
export function validateExerciseUpdateData(data: unknown): ValidationResult<ExerciseUpdateData> {
 const errors: string[] = []

 if (!data || typeof data !=='object') {
 return { isValid: false, errors: ['Données invalides']}
}

 // Vérification sécurité contre prototype pollution
 try {
 checkForDangerousProperties(data as Record<string, unknown>)
} catch (error) {
 return { isValid: false, errors: [(error as Error).message]}
}

 const input = data as Record<string, unknown>
 const validatedData: Partial<ExerciseUpdateData> = {}

 // Validation nom
 try {
 validatedData.name = validateExerciseName(input.name)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation type exercice 
 try {
 validatedData.exercise_type = validateExerciseType(input.exercise_type)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation groupe musculaire
 try {
 validatedData.muscle_group = validateMuscleGroup(input.muscle_group)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation équipement
 try {
 validatedData.equipment_id = validateEquipmentId(input.equipment_id)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation difficulté
 try {
 validatedData.difficulty = validateDifficulty(input.difficulty)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation description (optionnelle)
 try {
 validatedData.description = validateDescription(input.description)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation URL image (optionnelle)
 try {
 validatedData.image_url = validateImageUrl(input.image_url)
} catch (error) {
 errors.push((error as Error).message)
}

 // Validation métriques par défaut (optionnelles)
 if (input.default_strength_metrics !== undefined) {
 validatedData.default_strength_metrics = input.default_strength_metrics as unknown
}
 
 if (input.default_cardio_metrics !== undefined) {
 validatedData.default_cardio_metrics = input.default_cardio_metrics as unknown
}

 if (errors.length > 0) {
 return { isValid: false, errors}
}

 return { 
 isValid: true, 
 data: validatedData as ExerciseUpdateData,
 errors: []
}
}

/**
 * Validation côté client - Version allégée pour UX
 */
export function validateExerciseClientSide(data: Partial<ExerciseUpdateData>): { isValid: boolean; errors: Record<string, string>} {
 const errors: Record<string, string> = {}

 // Validation nom
 if (!data.name?.trim()) {
 errors.name ='Le nom de l\'exercice est requis'
} else if (data.name.length > MAX_NAME_LENGTH) {
 errors.name = `Nom trop long (max ${MAX_NAME_LENGTH} caractères)`
}

 // Validation groupe musculaire
 if (!data.muscle_group?.trim()) {
 errors.muscle_group ='Le groupe musculaire est requis'
} else if (!VALID_MUSCLE_GROUPS.includes(data.muscle_group as typeof VALID_MUSCLE_GROUPS[number])) {
 errors.muscle_group ='Groupe musculaire invalide'
}

 // Validation type exercice
 if (data.exercise_type && !VALID_EXERCISE_TYPES.includes(data.exercise_type)) {
 errors.exercise_type ='Type d\'exercice invalide'
}

 // Validation difficulté
 if (data.difficulty !== undefined && (data.difficulty < MIN_DIFFICULTY || data.difficulty > MAX_DIFFICULTY)) {
 errors.difficulty = `Difficulté doit être entre ${MIN_DIFFICULTY} et ${MAX_DIFFICULTY}`
}

 // Validation description
 if (data.description && data.description.length > MAX_DESCRIPTION_LENGTH) {
 errors.description = `Description trop longue (max ${MAX_DESCRIPTION_LENGTH} caractères)`
}

 return {
 isValid: Object.keys(errors).length === 0,
 errors
}
}