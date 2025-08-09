// Mapping bidirectionnel pour difficulté exercices - Support complet 1-5
export type DifficultyString = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | 'Élite';

// Convertir nombre (BDD) vers string (UI) - Mapping exact 1-5
export const mapDifficultyFromNumber = (difficulty: number): DifficultyString => {
  switch (difficulty) {
    case 1: return 'Débutant'
    case 2: return 'Intermédiaire'
    case 3: return 'Avancé'
    case 4: return 'Expert'
    case 5: return 'Élite'
    default: return 'Débutant' // Fallback sécurisé
  }
}

// Convertir string (UI) vers nombre (BDD)
export const mapDifficultyToNumber = (difficulty: DifficultyString): number => {
  switch (difficulty) {
    case 'Débutant': return 1
    case 'Intermédiaire': return 2
    case 'Avancé': return 3
    case 'Expert': return 4
    case 'Élite': return 5
    default: return 1
  }
}

// Liste complète des difficultés - 5 niveaux
export const difficulties: DifficultyString[] = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert', 'Élite'];