import { createClient} from'@/utils/supabase/client';

export interface ExerciseDuplicate {
 id: number;
 name: string;
 exercise_type: string;
 muscle_group: string;
 similarity: number;
 created_at: string;
}

export interface DuplicateDetectionResult {
 isDuplicate: boolean;
 exactMatches: ExerciseDuplicate[];
 similarMatches: ExerciseDuplicate[];
 suggestions: {
 useExisting: ExerciseDuplicate | null;
 renameOptions: string[];
};
}

/**
 * Calcule la similarité entre deux chaînes (algorithme Jaro-Winkler simplifié)
 */
function calculateSimilarity(str1: string, str2: string): number {
 const s1 = str1.toLowerCase().trim();
 const s2 = str2.toLowerCase().trim();
 
 if (s1 === s2) return 1.0;
 
 // Similarité basique par mots communs
 const words1 = s1.split(/\s+/);
 const words2 = s2.split(/\s+/);
 
 const commonWords = words1.filter(word => 
 words2.some(w => w.includes(word) || word.includes(w))
 );
 
 const maxWords = Math.max(words1.length, words2.length);
 return maxWords > 0 ? commonWords.length / maxWords : 0;
}

/**
 * Détecte les exercices similaires/doublons selon les meilleures pratiques FitBod/MyFitnessPal
 * Logique : nom + exercise_type + muscle_group
 */
export async function detectExerciseDuplicates(
 name: string,
 exerciseType: string,
 muscleGroup: string,
 excludeId?: number
): Promise<DuplicateDetectionResult> {
 const supabase = createClient();
 
 try {
 // 1. Récupérer tous les exercices du même type et groupe musculaire
 let query = supabase
 .from('exercises')
 .select('id, name, exercise_type, muscle_group, created_at')
 .eq('exercise_type', exerciseType)
 .eq('muscle_group', muscleGroup);
 
 if (excludeId) {
 query = query.neq('id', excludeId);
}
 
 const { data: exercises, error} = await query;
 
 if (error || !exercises) {
 console.error('Erreur détection doublons:', error);
 return {
 isDuplicate: false,
 exactMatches: [],
 similarMatches: [],
 suggestions: { useExisting: null, renameOptions: []}
};
}
 
 // 2. Analyser les correspondances
 const exactMatches: ExerciseDuplicate[] = [];
 const similarMatches: ExerciseDuplicate[] = [];
 
 exercises.forEach(exercise => {
 const similarity = calculateSimilarity(name, exercise.name);
 
 const duplicate: ExerciseDuplicate = {
 id: exercise.id,
 name: exercise.name,
 exercise_type: exercise.exercise_type,
 muscle_group: exercise.muscle_group,
 similarity,
 created_at: exercise.created_at
};
 
 if (similarity === 1.0) {
 exactMatches.push(duplicate);
} else if (similarity >= 0.6) { // Seuil 60% comme FitBod
 similarMatches.push(duplicate);
}
});
 
 // 3. Trier par similarité décroissante
 similarMatches.sort((a, b) => b.similarity - a.similarity);
 
 // 4. Générer suggestions
 const isDuplicate = exactMatches.length > 0 || similarMatches.length > 0;
 
 const useExisting = exactMatches[0] || 
 (similarMatches.length > 0 && similarMatches[0].similarity >= 0.8 ? similarMatches[0] : null);
 
 const renameOptions = generateRenameOptions(name, exercises.map(e => e.name));
 
 return {
 isDuplicate,
 exactMatches,
 similarMatches,
 suggestions: {
 useExisting,
 renameOptions
}
};
 
} catch (error) {
 console.error('Erreur détection doublons:', error);
 return {
 isDuplicate: false,
 exactMatches: [],
 similarMatches: [],
 suggestions: { useExisting: null, renameOptions: []}
};
}
}

/**
 * Génère des options de renommage intelligentes
 */
function generateRenameOptions(originalName: string, existingNames: string[]): string[] {
 const options: string[] = [];
 const baseName = originalName.trim();
 
 // Option 1: Ajouter numéro
 for (let i = 2; i <= 5; i++) {
 const option = `${baseName} ${i}`;
 if (!existingNames.some(name => name.toLowerCase() === option.toLowerCase())) {
 options.push(option);
 break;
}
}
 
 // Option 2: Ajouter variations contextuelles
 const variations = [
 `${baseName} (variant)`,
 `${baseName} (modifié)`,
 `${baseName} (nouveau)`,
 `${baseName} (personnel)`
 ];
 
 variations.forEach(variation => {
 if (!existingNames.some(name => name.toLowerCase() === variation.toLowerCase())) {
 options.push(variation);
}
});
 
 return options.slice(0, 3); // Max 3 suggestions
}