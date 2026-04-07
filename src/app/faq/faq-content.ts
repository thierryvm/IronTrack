export type FAQCategory =
  | 'partners'
  | 'workouts'
  | 'general'
  | 'technical'
  | 'progression'

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: FAQCategory
}

export const faqStructuredDataIds = [
  'partners-1',
  'workouts-1',
  'workouts-4',
  'progression-3',
  'general-3',
  'general-5',
] as const

export const faqData: FAQItem[] = [
  {
    id: 'partners-1',
    question: "Comment inviter quelqu'un comme partenaire d'entraînement ?",
    answer:
      'Allez dans "Training Partners" → onglet "Rechercher" → tapez le pseudo, nom ou email de la personne → cliquez "Inviter". L’invitation sera envoyée et la personne pourra l’accepter ou la refuser.',
    category: 'partners',
  },
  {
    id: 'partners-2',
    question: 'Mes partenaires peuvent-ils voir toutes mes séances ?',
    answer:
      'Non, vos partenaires ne voient que vos séances si vous activez le bouton "Partenaires" dans le calendrier. De plus, vous pouvez gérer finement les paramètres de partage pour chaque partenaire.',
    category: 'partners',
  },
  {
    id: 'partners-3',
    question: 'Comment supprimer un partenaire ?',
    answer:
      'Dans "Training Partners" → onglet "Mes Partenaires" → cliquez sur l’icône poubelle à côté du partenaire. Le partenariat sera supprimé définitivement.',
    category: 'partners',
  },
  {
    id: 'partners-4',
    question: 'Que se passe-t-il si je refuse une invitation ?',
    answer:
      "L’invitation est simplement supprimée. La personne qui vous a invité ne recevra pas de notification de refus, l’invitation disparaîtra juste de sa liste.",
    category: 'partners',
  },
  {
    id: 'partners-5',
    question: "Puis-je annuler une invitation que j'ai envoyée ?",
    answer:
      'Oui, dans l’onglet "Invitations" → section "Invitations Envoyées" → cliquez sur le X à côté de l’invitation. Elle sera annulée immédiatement.',
    category: 'partners',
  },
  {
    id: 'partners-6',
    question: 'Puis-je partager mes données nutritionnelles avec mes partenaires ?',
    answer:
      'Oui, vous pouvez partager vos données nutritionnelles (recettes, objectifs, progression) avec vos partenaires acceptés. Allez dans "Partenaires" → "Mes Partenaires" → paramètres de partage pour activer le partage de nutrition.',
    category: 'partners',
  },
  {
    id: 'workouts-1',
    question: "Comment créer une nouvelle séance d'entraînement ?",
    answer:
      'Cliquez sur "Nouvelle séance" dans le calendrier ou allez dans "Séances" → "Ajouter". Remplissez les informations : nom, type, exercices, date/heure, puis sauvegardez.',
    category: 'workouts',
  },
  {
    id: 'workouts-2',
    question: 'Puis-je modifier une séance déjà créée ?',
    answer:
      'Oui, cliquez sur la séance dans le calendrier ou la liste des séances, puis modifiez les informations et sauvegardez.',
    category: 'workouts',
  },
  {
    id: 'workouts-3',
    question: 'Comment marquer une séance comme terminée ?',
    answer:
      'Cliquez sur la séance et changez son statut vers "Terminé" ou "Réalisé". Vous pouvez aussi ajouter des notes sur votre performance.',
    category: 'workouts',
  },
  {
    id: 'workouts-4',
    question: 'Quels types d’exercices puis-je ajouter ?',
    answer:
      'IronTrack supporte tous types d’exercices : Musculation, Cardio, Étirement, Yoga, Pilates, Natation, Crossfit, Gainage, Cours collectifs, etc.',
    category: 'workouts',
  },
  {
    id: 'workouts-5',
    question: "Comment utiliser le wizard de création d'exercices ?",
    answer:
      'Allez dans "Exercices" → "Nouveau" → le wizard vous guide : 1) choisissez le type (musculation/cardio), 2) sélectionnez un exercice suggéré ou créez le vôtre, 3) ajoutez vos performances. L’IA vous propose des exercices adaptés à votre niveau.',
    category: 'workouts',
  },
  {
    id: 'workouts-6',
    question: 'Quelles métriques puis-je saisir pour le cardio ?',
    answer:
      'Pour le cardio, vous pouvez saisir : distance (km/m selon l’exercice), durée, calories, vitesse. Métriques spécialisées : rameur → SPM (coups/minute), watts, rythme cardiaque ; course/tapis → rythme cardiaque, inclinaison (%) ; vélo → cadence (RPM), résistance, rythme cardiaque. Toutes les métriques sont adaptées aux standards belges.',
    category: 'workouts',
  },
  {
    id: 'workouts-7',
    question: 'Quelles métriques avancées puis-je suivre en musculation ?',
    answer:
      'En musculation, vous pouvez saisir : poids, répétitions, séries (de base), temps de repos entre séries, temps sous tension, RPE (effort perçu de 6 à 10) et notes personnalisées sur votre ressenti.',
    category: 'workouts',
  },
  {
    id: 'workouts-8',
    question: 'Comment modifier un exercice ou une performance existante ?',
    answer:
      'Depuis la page Exercices, cliquez sur l’icône œil pour voir les détails → "Modifier l’exercice" pour changer les infos de base, ou "Nouvelle performance" pour ajouter des résultats. Pour modifier une performance existante, utilisez l’icône crayon dans l’historique.',
    category: 'workouts',
  },
  {
    id: 'workouts-9',
    question: 'Comment utiliser la mascotte IronBuddy pendant mes entraînements ?',
    answer:
      'IronBuddy est votre coach personnel accessible via le bouton flottant orange. Deux modes : "Support" pour l’aide technique et "Coach" pour motivation/conseils. La mascotte s’adapte à votre niveau de punchlines choisi dans le profil.',
    category: 'workouts',
  },
  {
    id: 'general-1',
    question: 'Comment changer mon pseudo ?',
    answer:
      'Allez dans "Profil" puis modifiez le champ "Pseudo". C’est ce nom que vos partenaires verront quand ils vous chercheront.',
    category: 'general',
  },
  {
    id: 'general-2',
    question: 'Comment activer le thème sombre ?',
    answer:
      'Dans le menu de navigation, cliquez sur l’icône lune/soleil pour basculer entre les thèmes clair et sombre.',
    category: 'general',
  },
  {
    id: 'general-3',
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Seuls vos partenaires acceptés peuvent voir les séances que vous choisissez de partager.',
    category: 'general',
  },
  {
    id: 'general-4',
    question: 'Comment supprimer mon compte ?',
    answer:
      'Dans "Profil" → section "Actions" → "Supprimer le compte". Cette action est irréversible et supprimera toutes vos données.',
    category: 'general',
  },
  {
    id: 'general-5',
    question: "L'application fonctionne-t-elle hors ligne ?",
    answer:
      'L’application peut afficher une page hors ligne personnalisée, mais vous avez besoin d’une connexion internet pour synchroniser vos données et voir les séances de vos partenaires.',
    category: 'general',
  },
  {
    id: 'general-6',
    question: 'Comment personnaliser ma mascotte IronBuddy ?',
    answer:
      'Dans "Profil" → section "Mascotte IronBuddy" → choisissez votre mascotte et votre niveau de punchlines (Discret, Normal, Ambianceur). Chaque mascotte a sa personnalité unique.',
    category: 'general',
  },
  {
    id: 'technical-1',
    question: 'Je ne peux pas me connecter, que faire ?',
    answer:
      'Vérifiez votre connexion internet, puis vos identifiants. Si le problème persiste, essayez de réinitialiser votre mot de passe ou contactez le support.',
    category: 'technical',
  },
  {
    id: 'technical-2',
    question: 'Le calendrier ne se charge pas, pourquoi ?',
    answer:
      'Essayez de rafraîchir la page. Si le problème persiste, vérifiez votre connexion internet ou essayez de vous déconnecter puis reconnecter.',
    category: 'technical',
  },
  {
    id: 'technical-3',
    question: 'Les notifications ne fonctionnent pas',
    answer:
      'Vérifiez que vous avez autorisé les notifications dans votre navigateur et dans vos paramètres de profil. Rechargez la page après avoir activé les notifications.',
    category: 'technical',
  },
  {
    id: 'technical-4',
    question: 'Comment signaler un bug ?',
    answer:
      "Vous pouvez signaler les bugs dans la section Support ou en contactant l'équipe de développement avec une description détaillée du problème.",
    category: 'technical',
  },
  {
    id: 'progression-1',
    question: 'Quelle est la différence entre "poids initial" et "poids actuel" ?',
    answer:
      'Le poids initial est votre poids de référence pour calculer votre progression. Le poids actuel est votre poids corporel utilisé pour calculer l’IMC. Définissez votre poids initial dans votre profil pour suivre votre évolution.',
    category: 'progression',
  },
  {
    id: 'progression-2',
    question: "Comment ajouter des performances d'entraînement ?",
    answer:
      'Les performances s’ajoutent automatiquement quand vous complétez vos séances. Allez dans "Séances" → créez ou modifiez une séance → marquez-la comme "Terminée" en ajoutant vos résultats.',
    category: 'progression',
  },
  {
    id: 'progression-3',
    question: 'Pourquoi mes statistiques de progression sont vides ?',
    answer:
      'Vos statistiques se basent sur vos performances d’entraînement. Si elles sont vides, c’est que vous n’avez pas encore terminé de séances ou ajouté de performances.',
    category: 'progression',
  },
  {
    id: 'progression-4',
    question: 'Comment créer un objectif personnalisé ?',
    answer:
      'Dans "Progression" → cliquez sur "Ajouter" dans la section objectifs → choisissez un exercice → sélectionnez le type d’objectif (kg, reps, durée, distance) → définissez votre cible.',
    category: 'progression',
  },
  {
    id: 'badges-1',
    question: 'Comment fonctionnent les badges ?',
    answer:
      'Les badges se débloquent automatiquement quand vous atteignez vos objectifs. Créez un objectif → un badge "En cours" est généré → complétez l’objectif → le badge passe à "Validé" et apparaît dans votre profil.',
    category: 'progression',
  },
  {
    id: 'badges-2',
    question: 'Où voir mes badges débloqués ?',
    answer:
      'Vos badges validés apparaissent dans votre profil dans la section "Badges & Récompenses". Les badges en cours sont visibles dans "Progression" → section "Badges à valider".',
    category: 'progression',
  },
  {
    id: 'badges-3',
    question: 'Un badge peut-il être retiré ?',
    answer:
      'Oui, si vous ne maintenez plus le niveau requis pour un objectif, le badge repasse automatiquement en "En cours". Le système vérifie constamment vos performances pour maintenir la cohérence.',
    category: 'progression',
  },
  {
    id: 'progression-5',
    question: 'Comment sont calculés mes records personnels ?',
    answer:
      'Vos records personnels sont calculés automatiquement à partir de toutes vos performances d’entraînement. Le système trouve le poids maximal et le nombre de répétitions maximal pour chaque exercice.',
    category: 'progression',
  },
]
