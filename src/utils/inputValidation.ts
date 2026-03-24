/**
 * Validation sécurisée des inputs - Protection contre XSS, injection, etc.
 * Inspiré des bonnes pratiques OWASP
 */

export interface ValidationResult<T = unknown> {
 isValid: boolean;
 value?: T;
 error?: string;
}

/**
 * Nettoie et valide une chaîne de caractères
 */
export function sanitizeString(input: string, maxLength: number = 255): ValidationResult {
 if (typeof input !=='string') {
 return { isValid: false, error:'Type invalide'};
}

 // Supprimer les caractères HTML/script dangereux
 const cleaned = input
 .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,'')
 .replace(/<[^>]*>/g,'')
 .trim();

 if (cleaned.length === 0) {
 return { isValid: false, error:'Champ obligatoire'};
}

 if (cleaned.length > maxLength) {
 return { isValid: false, error: `Maximum ${maxLength} caractères`};
}

 // Vérifier les caractères suspects
 const suspiciousPatterns = [
 /javascript:/i,
 /vbscript:/i,
 /onload=/i,
 /onerror=/i,
 /alert\(/i,
 /eval\(/i,
 /document\./i
 ];

 for (const pattern of suspiciousPatterns) {
 if (pattern.test(cleaned)) {
 return { isValid: false, error:'Contenu non autorisé'};
}
}

 return { isValid: true, value: cleaned};
}

/**
 * Valide un nombre entier positif
 */
export function validatePositiveInteger(input: unknown, min: number = 1, max: number = 9999): ValidationResult<number> {
 // Convertir en nombre si c'est une chaîne
 const num = typeof input ==='string' ? parseInt(input, 10) : (typeof input ==='number' ? input : NaN);

 if (isNaN(num) || !Number.isInteger(num)) {
 return { isValid: false, error:'Nombre entier requis'};
}

 if (num < min) {
 return { isValid: false, error: `Minimum ${min}`};
}

 if (num > max) {
 return { isValid: false, error: `Maximum ${max}`};
}

 return { isValid: true, value: num};
}

/**
 * Valide un nombre décimal positif
 */
export function validatePositiveFloat(input: unknown, min: number = 0, max: number = 9999): ValidationResult<number> {
 // Convertir en nombre si c'est une chaîne
 const num = typeof input ==='string' ? parseFloat(input) : (typeof input ==='number' ? input : NaN);

 if (isNaN(num) || !Number.isFinite(num)) {
 return { isValid: false, error:'Nombre décimal requis'};
}

 if (num < min) {
 return { isValid: false, error: `Minimum ${min}`};
}

 if (num > max) {
 return { isValid: false, error: `Maximum ${max}`};
}

 return { isValid: true, value: num};
}

/**
 * Valide une durée (minutes + secondes)
 */
export function validateDuration(minutes: unknown, seconds: unknown): ValidationResult<number> {
 const minResult = validatePositiveInteger(minutes, 0, 999);
 if (!minResult.isValid) {
 return { isValid: false, error: `Minutes: ${minResult.error}`};
}

 const secResult = validatePositiveInteger(seconds, 0, 59);
 if (!secResult.isValid) {
 return { isValid: false, error: `Secondes: ${secResult.error}`};
}

 const totalSeconds = (minResult.value! * 60) + secResult.value!;
 
 if (totalSeconds === 0) {
 return { isValid: false, error:'Durée requise'};
}

 if (totalSeconds > 86400) { // 24 heures max
 return { isValid: false, error:'Durée maximale 24h'};
}

 return { isValid: true, value: totalSeconds};
}

/**
 * Valide un type d'exercice
 */
export function validateExerciseType(input: unknown): ValidationResult<string> {
 if (typeof input !=='string') {
 return { isValid: false, error:'Type invalide'};
}

 const validTypes = ['Musculation','Cardio'];
 if (!validTypes.includes(input)) {
 return { isValid: false, error:'Type d\'exercice invalide'};
}

 return { isValid: true, value: input};
}

/**
 * Valide un niveau de difficulté
 */
export function validateDifficulty(input: unknown): ValidationResult<string> {
 if (typeof input !=='string') {
 return { isValid: false, error:'Difficulté invalide'};
}

 const validLevels = ['Débutant','Intermédiaire','Avancé'];
 if (!validLevels.includes(input)) {
 return { isValid: false, error:'Niveau de difficulté invalide'};
}

 return { isValid: true, value: input};
}

/**
 * Valide une chaîne depuis une liste autorisée
 */
export function validateFromWhitelist(input: unknown, whitelist: string[], fieldName: string): ValidationResult<string> {
 if (typeof input !=='string') {
 return { isValid: false, error: `${fieldName} invalide`};
}

 if (!whitelist.includes(input)) {
 return { isValid: false, error: `${fieldName} non autorisé`};
}

 return { isValid: true, value: input};
}

/**
 * Valide les métriques cardio spécialisées
 */
export function validateCardioMetrics(equipmentType: string, metrics: Record<string, unknown>): ValidationResult<Record<string, unknown>> {
 const errors: string[] = [];

 switch (equipmentType) {
 case'rowing':
 if (metrics.stroke_rate !== undefined) {
 const spmResult = validatePositiveInteger(metrics.stroke_rate, 16, 36);
 if (!spmResult.isValid) errors.push(`SPM: ${spmResult.error}`);
}
 if (metrics.watts !== undefined) {
 const wattsResult = validatePositiveInteger(metrics.watts, 50, 500);
 if (!wattsResult.isValid) errors.push(`Watts: ${wattsResult.error}`);
}
 break;

 case'running':
 if (metrics.speed !== undefined) {
 const speedResult = validatePositiveFloat(metrics.speed, 1, 25);
 if (!speedResult.isValid) errors.push(`Vitesse: ${speedResult.error}`);
}
 if (metrics.incline !== undefined) {
 const inclineResult = validatePositiveFloat(metrics.incline, 0, 15);
 if (!inclineResult.isValid) errors.push(`Inclinaison: ${inclineResult.error}`);
}
 break;

 case'cycling':
 if (metrics.cadence !== undefined) {
 const cadenceResult = validatePositiveInteger(metrics.cadence, 50, 120);
 if (!cadenceResult.isValid) errors.push(`Cadence: ${cadenceResult.error}`);
}
 if (metrics.resistance !== undefined) {
 const resistanceResult = validatePositiveInteger(metrics.resistance, 1, 20);
 if (!resistanceResult.isValid) errors.push(`Résistance: ${resistanceResult.error}`);
}
 break;
}

 if (errors.length > 0) {
 return { isValid: false, error: errors.join(',')};
}

 return { isValid: true, value: metrics};
}