/**
 * Utilitaires d'accessibilité pour IronTrack
 * Améliore les scores PageSpeed Insights
 */

// Attributs ARIA couramment manquants
export const ariaLabels = {
  // Navigation
  mainNavigation: "Navigation principale",
  userMenu: "Menu utilisateur",
  backButton: "Retour à la page précédente",
  closeModal: "Fermer la fenêtre",
  
  // Actions communes
  addItem: "Ajouter un élément",
  editItem: "Modifier cet élément", 
  deleteItem: "Supprimer cet élément",
  saveChanges: "Enregistrer les modifications",
  cancelAction: "Annuler l'action",
  
  // Formulaires
  searchInput: "Rechercher",
  dateInput: "Sélectionner une date",
  timeInput: "Sélectionner une heure",
  fileUpload: "Télécharger un fichier",
  
  // Données et graphiques
  progressChart: "Graphique de progression",
  nutritionChart: "Graphique nutritionnel",
  statisticsTable: "Tableau des statistiques",
  
  // États
  loading: "Chargement en cours",
  success: "Action réussie",
  error: "Une erreur s'est produite",
  
  // Exercices spécifiques
  exercisePhoto: "Photo de l'exercice",
  performanceMetrics: "Métriques de performance",
  workoutTimer: "Minuteur d'entraînement"
} as const

// Classes CSS pour améliorer le contraste
export const contrastClasses = {
  highContrast: "text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600",
  focusVisible: "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600",
  skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded"
} as const

// Helper pour générer des IDs uniques pour les labels
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper pour les descriptions d'éléments interactifs
export function getInteractiveDescription(type: 'button' | 'link' | 'input', context?: string): string {
  const descriptions = {
    button: context ? `Bouton ${context}` : "Bouton interactif",
    link: context ? `Lien vers ${context}` : "Lien de navigation", 
    input: context ? `Champ de saisie ${context}` : "Champ de saisie"
  }
  return descriptions[type]
}

// Vérification du contraste des couleurs (approximatif)
export function hasGoodContrast(bgColor: string, textColor: string): boolean {
  // Implémentation simplifiée - en production, utiliser une lib spécialisée
  const darkBgs = ['bg-gray-900', 'bg-black', 'bg-orange-600', 'bg-red-500']
  const lightTexts = ['text-white', 'text-gray-100']
  
  return (darkBgs.some(bg => bgColor.includes(bg)) && lightTexts.some(text => textColor.includes(text))) ||
         (!darkBgs.some(bg => bgColor.includes(bg)) && !lightTexts.some(text => textColor.includes(text)))
}