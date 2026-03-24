// Utilitaires de recherche avec support des accents français

/**
 * Normalise un texte pour la recherche (supprime accents, casse, espaces)
 */
export function normalizeForSearch(text: string | null | undefined): string {
 if (!text) return'';
 return text
 .toLowerCase()
 .normalize('NFD') // Décompose les caractères accentués
 .replace(/[\u0300-\u036f]/g,'') // Supprime les diacritiques
 .replace(/[^\w\s]/g,'') // Supprime la ponctuation
 .replace(/\s+/g,'') // Normalise les espaces
 .trim();
}

/**
 * Vérifie si un texte correspond à un terme de recherche (insensible aux accents)
 */
export function matchesSearch(text: string | null | undefined, searchTerm: string | null | undefined): boolean {
 if (!text || !searchTerm) return false;
 
 const normalizedText = normalizeForSearch(text);
 const normalizedSearch = normalizeForSearch(searchTerm);
 
 return normalizedText.includes(normalizedSearch);
}

/**
 * Filtre un tableau d'exercices selon un terme de recherche
 */
export function filterExercisesBySearch<T extends { name?: string | null; description?: string | null; muscle_group?: string | null}>(
 exercises: T[], 
 searchTerm: string
): T[] {
 if (!searchTerm.trim()) return exercises;
 
 return exercises.filter(exercise => 
 matchesSearch(exercise.name, searchTerm) ||
 matchesSearch(exercise.description, searchTerm) ||
 matchesSearch(exercise.muscle_group, searchTerm)
 );
}

/**
 * Suggestions de recherche basées sur les corrections d'accents courantes
 */
export const searchSuggestions = {
 // Corrections automatiques d'accents
'developpe':'développé',
'couche':'couché', 
'eleve':'élevé',
'souleve':'soulevé',
'tire':'tiré',
'ecarte':'écarté',
'incline':'incliné',
'decline':'décliné',
'specifique':'spécifique',
'personnalise':'personnalisé',
'controle':'contrôlé',
'reguliere':'régulière',
 
 // Abréviations courantes
'dev':'développé',
'dc':'développé couché',
'di':'développé incliné',
'dm':'développé militaire',
'sdt':'soulevé de terre',
'tv':'tiré vertical',
'th':'tiré horizontal'
};

/**
 * Applique les suggestions de recherche automatiques
 */
export function applySuggestions(searchTerm: string): string {
 let suggested = searchTerm.toLowerCase();
 
 Object.entries(searchSuggestions).forEach(([abbrev, full]) => {
 suggested = suggested.replace(new RegExp(`\\b${abbrev}\\b`,'g'), full);
});
 
 return suggested;
}

/**
 * Recherche intelligente avec correction d'accents et suggestions
 */
export function intelligentSearch<T extends { name?: string | null; description?: string | null; muscle_group?: string | null}>(
 exercises: T[], 
 searchTerm: string
): T[] {
 if (!searchTerm.trim()) return exercises;
 
 // Appliquer les suggestions automatiques
 const enhancedSearch = applySuggestions(searchTerm);
 
 // Recherche avec le terme amélioré
 return filterExercisesBySearch(exercises, enhancedSearch);
}