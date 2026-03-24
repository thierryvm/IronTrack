/**
 * Module de sécurité centralisé pour IronTrack
 * Fonctions de validation, sanitisation et protection contre les injections
 */

export interface ValidationError {
 field: string;
 message: string;
}

export interface ValidationResult {
 isValid: boolean;
 errors: ValidationError[];
 sanitizedData?: Record<string, unknown>;
}

/**
 * Sanitise une chaîne de caractères en supprimant les caractères dangereux
 */
export const sanitizeInput = (input: string): string => {
 if (typeof input !=='string') return'';
 
 return input
 .trim()
 // Supprime les caractères dangereux pour les injections
 .replace(/[<>"'&;\\|`${}()\[\]]/g,'')
 // Supprime les mots-clés SQL dangereux (case insensitive)
 .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|ONCLICK)\b/gi,'')
 // Supprime les caractères de contrôle
 .replace(/[\x00-\x1F\x7F]/g,'')
 // Limite à des caractères alphanumériques + espaces + accents + tirets
 .replace(/[^\w\s\u00C0-\u017F\-,.']/g,'');
};

/**
 * Détecte les tentatives d'injection et autres menaces de sécurité
 */
export const detectSecurityThreats = (input: string): boolean => {
 const dangerousPatterns = [
 /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b/gi,
 /(--|#|\/\*|\*\/|;|\bOR\b|\bAND\b)\s*\w/i,
 /<script[^>]*>.*?<\/script>/gi,
 /javascript:/gi,
 /data:/gi,
 /vbscript:/gi,
 /on\w+\s*=/gi,
 /\$\{.*?\}/g, // Template literals
 /\{\{.*?\}\}/g, // Template expressions
 /eval\s*\(/gi,
 /Function\s*\(/gi,
 /setTimeout\s*\(/gi,
 /setInterval\s*\(/gi,
 ];
 
 return dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Valide et sanitise une entrée numérique
 */
export const validateNumericInput = (
 value: string, 
 fieldName: string, 
 min = 0, 
 max = 10000
): ValidationError | null => {
 if (!value || value.trim() ==='') {
 return { field: fieldName, message: `${fieldName} est requis`};
}
 
 const num = parseFloat(value);
 if (isNaN(num)) {
 return { field: fieldName, message: `${fieldName} doit être un nombre valide`};
}
 
 if (num < min) {
 return { field: fieldName, message: `${fieldName} doit être supérieur ou égal à ${min}`};
}
 
 if (num > max) {
 return { field: fieldName, message: `${fieldName} ne peut pas dépasser ${max}`};
}
 
 return null;
};

/**
 * Valide une chaîne de caractères avec des règles de sécurité
 */
export const validateTextInput = (
 value: string,
 fieldName: string,
 minLength = 2,
 maxLength = 100,
 allowEmpty = false
): ValidationError | null => {
 if (!allowEmpty && (!value || value.trim() ==='')) {
 return { field: fieldName, message: `${fieldName} est requis`};
}
 
 if (allowEmpty && (!value || value.trim() ==='')) {
 return null; // Champ optionnel vide
}
 
 // Détection de menaces de sécurité
 if (detectSecurityThreats(value)) {
 return { field: fieldName, message: `${fieldName} contient des caractères interdits`};
}
 
 const sanitized = sanitizeInput(value);
 
 // Vérification que la sanitisation n'a pas trop modifié le contenu
 if (sanitized !== value.trim()) {
 return { field: fieldName, message: `${fieldName} contient des caractères non autorisés`};
}
 
 if (sanitized.length < minLength) {
 return { field: fieldName, message: `${fieldName} doit contenir au moins ${minLength} caractères`};
}
 
 if (sanitized.length > maxLength) {
 return { field: fieldName, message: `${fieldName} ne peut pas dépasser ${maxLength} caractères`};
}
 
 // Vérification de patterns suspects
 if (/\b(http|https|ftp|javascript|data):/i.test(value)) {
 return { field: fieldName, message: `${fieldName} ne peut pas contenir d'URLs ou de scripts`};
}
 
 // Vérification de chaînes SQL suspectes
 if (/(--|#|\/\*|\*\/|;|\bOR\b|\bAND\b)\s*\w/i.test(value)) {
 return { field: fieldName, message: `${fieldName} contient des caractères interdits`};
}
 
 return null;
};

/**
 * Valide un email
 */
export const validateEmail = (email: string): ValidationError | null => {
 if (!email || email.trim() ==='') {
 return { field:'email', message:'L\'email est requis'};
}
 
 // Détection de menaces
 if (detectSecurityThreats(email)) {
 return { field:'email', message:'Email contient des caractères interdits'};
}
 
 const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
 if (!emailRegex.test(email)) {
 return { field:'email', message:'Format d\'email invalide'};
}
 
 if (email.length > 254) {
 return { field:'email', message:'Email trop long'};
}
 
 return null;
};

/**
 * Valide la force d'un mot de passe
 */
export const validatePassword = (password: string): ValidationError | null => {
 if (!password || password.trim() ==='') {
 return { field:'password', message:'Le mot de passe est requis'};
}
 
 if (password.length < 8) {
 return { field:'password', message:'Le mot de passe doit contenir au moins 8 caractères'};
}
 
 if (password.length > 128) {
 return { field:'password', message:'Le mot de passe ne peut pas dépasser 128 caractères'};
}
 
 // Vérification de la complexité
 const hasLowerCase = /[a-z]/.test(password);
 const hasUpperCase = /[A-Z]/.test(password);
 const hasNumbers = /\d/.test(password);
 const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
 
 const complexityScore = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
 
 if (complexityScore < 3) {
 return { 
 field:'password', 
 message:'Le mot de passe doit contenir au moins 3 des éléments suivants : minuscules, majuscules, chiffres, caractères spéciaux' 
};
}
 
 // Vérification contre les mots de passe communs
 const commonPasswords = [
'password','azerty','qwerty','123456','12345678','admin','letmein',
'welcome','monkey','dragon','pass','master','hello','access'
 ];
 
 if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
 return { field:'password', message:'Ce mot de passe est trop commun'};
}
 
 return null;
};

/**
 * Valide une heure au format HH:MM
 */
export const validateTime = (time: string): ValidationError | null => {
 if (!time || time.trim() ==='') {
 return { field:'time', message:'L\'heure est requise'};
}
 
 if (!/^\d{2}:\d{2}$/.test(time)) {
 return { field:'time', message:'L\'heure doit être au format HH:MM'};
}
 
 const [hours, minutes] = time.split(':').map(Number);
 
 if (hours < 0 || hours > 23) {
 return { field:'time', message:'L\'heure doit être comprise entre 00 et 23'};
}
 
 if (minutes < 0 || minutes > 59) {
 return { field:'time', message:'Les minutes doivent être comprises entre 00 et 59'};
}
 
 return null;
};

/**
 * Valide une date
 */
export const validateDate = (date: string): ValidationError | null => {
 if (!date || date.trim() ==='') {
 return { field:'date', message:'La date est requise'};
}
 
 const dateObj = new Date(date);
 
 if (isNaN(dateObj.getTime())) {
 return { field:'date', message:'Format de date invalide'};
}
 
 // Vérification que la date n'est pas trop dans le futur (1 an)
 const oneYearFromNow = new Date();
 oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
 
 if (dateObj > oneYearFromNow) {
 return { field:'date', message:'La date ne peut pas être plus d\'un an dans le futur'};
}
 
 // Vérification que la date n'est pas trop dans le passé (10 ans)
 const tenYearsAgo = new Date();
 tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
 
 if (dateObj < tenYearsAgo) {
 return { field:'date', message:'La date ne peut pas être plus de 10 ans dans le passé'};
}
 
 return null;
};

/**
 * Fonction utilitaire pour gérer les inputs numériques en temps réel
 */
export const handleNumericInput = (value: string, setter: (value: string) => void) => {
 // Permet seulement les nombres et point décimal
 const sanitized = value.replace(/[^0-9.]/g,'');
 // Empêche plusieurs points décimaux
 const parts = sanitized.split('.');
 const result = parts.length > 2 ? parts[0] +'.' + parts.slice(1).join('') : sanitized;
 setter(result);
};

/**
 * Fonction utilitaire pour gérer les inputs texte sécurisés en temps réel
 */
export const handleSecureTextInput = (value: string, setter: (value: string) => void) => {
 // Bloque les caractères les plus dangereux en temps réel
 if (!/^[\w\s\u00C0-\u017F\-,.']*$/.test(value)) {
 return; // Ignore la saisie de caractères interdits
}
 setter(value);
};

/**
 * Valide un formulaire complet avec multiple champs
 */
export const validateForm = (
 data: Record<string, unknown>,
 rules: Record<string, { type:'text' |'email' |'password' |'number' |'time' |'date', required?: boolean, min?: number, max?: number, minLength?: number, maxLength?: number}>
): ValidationResult => {
 const errors: ValidationError[] = [];
 const sanitizedData: Record<string, unknown> = {};
 
 for (const [fieldName, fieldValue] of Object.entries(data)) {
 const rule = rules[fieldName];
 if (!rule) continue;
 
 const stringValue = String(fieldValue ||'');
 let error: ValidationError | null = null;
 
 switch (rule.type) {
 case'text':
 error = validateTextInput(
 stringValue, 
 fieldName, 
 rule.minLength, 
 rule.maxLength, 
 !rule.required
 );
 if (!error) {
 sanitizedData[fieldName] = sanitizeInput(stringValue);
}
 break;
 
 case'email':
 error = validateEmail(stringValue);
 if (!error) {
 sanitizedData[fieldName] = stringValue.toLowerCase().trim();
}
 break;
 
 case'password':
 error = validatePassword(stringValue);
 if (!error) {
 sanitizedData[fieldName] = stringValue; // Ne pas sanitiser les mots de passe
}
 break;
 
 case'number':
 error = validateNumericInput(stringValue, fieldName, rule.min, rule.max);
 if (!error) {
 sanitizedData[fieldName] = parseFloat(stringValue);
}
 break;
 
 case'time':
 error = validateTime(stringValue);
 if (!error) {
 sanitizedData[fieldName] = stringValue;
}
 break;
 
 case'date':
 error = validateDate(stringValue);
 if (!error) {
 sanitizedData[fieldName] = stringValue;
}
 break;
}
 
 if (error) {
 errors.push(error);
}
}
 
 return {
 isValid: errors.length === 0,
 errors,
 sanitizedData: errors.length === 0 ? sanitizedData : undefined
};
};

/**
 * Rate limiting simple côté client (à compléter côté serveur)
 */
export class ClientRateLimiter {
 private attempts: Map<string, number[]> = new Map();
 
 constructor(private maxAttempts: number = 5, private windowMs: number = 15 * 60 * 1000) {}
 
 isAllowed(identifier: string): boolean {
 const now = Date.now();
 const userAttempts = this.attempts.get(identifier) || [];
 
 // Nettoie les anciennes tentatives
 const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
 
 if (recentAttempts.length >= this.maxAttempts) {
 return false;
}
 
 recentAttempts.push(now);
 this.attempts.set(identifier, recentAttempts);
 
 return true;
}
 
 getRemainingAttempts(identifier: string): number {
 const now = Date.now();
 const userAttempts = this.attempts.get(identifier) || [];
 const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
 
 return Math.max(0, this.maxAttempts - recentAttempts.length);
}
}