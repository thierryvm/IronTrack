export type SupportTopicId =
  | 'partners'
  | 'general'
  | 'progression'
  | 'account'
  | 'onboarding'

export interface SupportTopicBlock {
  title: string
  description: string
  bullets: string[]
}

export interface SupportProblem {
  title: string
  solution: string
}

export interface SupportTopic {
  id: SupportTopicId
  label: string
  title: string
  summary: string
  essentials: string[]
  blocks: SupportTopicBlock[]
  problems: SupportProblem[]
}

export interface SupportQuickLink {
  href: string
  label: string
  description: string
  authRequired?: boolean
}

export const supportTopics: SupportTopic[] = [
  {
    id: 'partners',
    label: 'Partenaires',
    title: 'Partenaires d’entraînement',
    summary:
      'Invite un partenaire, partage les bonnes informations et garde la maîtrise sur ce qui reste visible dans le calendrier.',
    essentials: [
      'Le partenariat doit être accepté avant tout partage.',
      'Les séances partagées restent séparées de tes séances personnelles.',
      'Le partage peut être coupé à tout moment depuis la gestion partenaire.',
    ],
    blocks: [
      {
        title: 'Inviter la bonne personne',
        description:
          'Passe par la recherche IronTrack pour envoyer une invitation propre et éviter les doublons.',
        bullets: [
          'Ouvre la section Partenaires puis la recherche.',
          'Cherche par pseudo, nom complet ou adresse email.',
          'Envoie l’invitation puis vérifie son statut dans les invitations envoyées.',
        ],
      },
      {
        title: 'Afficher les séances partagées',
        description:
          'Le calendrier permet d’afficher ou masquer les séances partenaires sans polluer ta vue principale.',
        bullets: [
          'Va dans Calendrier.',
          'Active le bouton de partages pour afficher les séances visibles sur le mois.',
          'Les avatars et badges distinguent clairement les séances partenaires.',
        ],
      },
      {
        title: 'Garder le contrôle',
        description:
          'Le partage est intentionnel et limité. Seules les personnes acceptées peuvent voir ce que tu autorises.',
        bullets: [
          'Supprime un partenariat si tu ne souhaites plus partager.',
          'Révoque les paramètres de partage dès qu’un contexte change.',
          'N’utilise jamais le partage pour transmettre des informations sensibles.',
        ],
      },
    ],
    problems: [
      {
        title: 'Je ne trouve pas mon partenaire',
        solution:
          'Vérifie le pseudo exact, l’adresse email ou demande-lui de confirmer que son compte IronTrack est bien créé et actif.',
      },
      {
        title: 'Je ne vois aucune séance partagée',
        solution:
          'Contrôle que le partenariat est accepté, que le partage des séances est autorisé et que le mois affiché contient bien des séances visibles.',
      },
    ],
  },
  {
    id: 'general',
    label: 'Utilisation',
    title: 'Utilisation générale',
    summary:
      'Le flux principal reste simple: créer une séance, la planifier, la terminer, puis consulter la progression qui en découle.',
    essentials: [
      'Une séance bien planifiée nourrit ensuite le calendrier, la progression et les statistiques.',
      'Le calendrier sert d’entrée rapide; la vue liste sert à opérer.',
      'Chaque action importante doit rester faisable en quelques taps.',
    ],
    blocks: [
      {
        title: 'Créer une séance',
        description:
          'Utilise le bouton principal depuis le calendrier ou la section Séances pour démarrer un nouveau plan.',
        bullets: [
          'Choisis un nom utile et un type d’entraînement clair.',
          'Ajoute les exercices essentiels avant de définir la date et l’heure.',
          'Sauvegarde puis vérifie immédiatement le rendu dans le calendrier.',
        ],
      },
      {
        title: 'Terminer une séance',
        description:
          'Une séance terminée devient exploitable pour la progression et les statistiques.',
        bullets: [
          'Mets à jour le statut en séance terminée.',
          'Renseigne les résultats réels si nécessaire.',
          'Ajoute une note seulement si elle aide vraiment le suivi.',
        ],
      },
      {
        title: 'Consulter rapidement',
        description:
          'Les écrans calendrier, progression et nutrition doivent être lus en quelques secondes, pas explorés comme des menus complexes.',
        bullets: [
          'Utilise les filtres et vues principales avant d’ouvrir les détails.',
          'Vérifie les badges et indicateurs seulement quand ils soutiennent une décision.',
          'Reviens à la vue mensuelle pour reprendre de la hauteur.',
        ],
      },
    ],
    problems: [
      {
        title: 'La page semble figée',
        solution:
          'Actualise la page puis reviens sur le mois courant. Si le problème persiste, reconnecte-toi pour forcer une resynchronisation de session.',
      },
      {
        title: 'Je ne sais plus où agir',
        solution:
          'Le CTA orange est l’action principale de la surface en cours. S’il n’est pas visible, reviens sur l’écran métier concerné.',
      },
    ],
  },
  {
    id: 'progression',
    label: 'Progression',
    title: 'Progression et objectifs',
    summary:
      'La progression repose sur des séances réellement terminées et des données suffisamment propres pour générer des signaux fiables.',
    essentials: [
      'Les objectifs servent à cadrer un résultat mesurable, pas à remplir l’interface.',
      'Le poids initial reste une référence historique.',
      'Les badges n’ont de valeur que si les données sont cohérentes.',
    ],
    blocks: [
      {
        title: 'Poser un objectif utile',
        description:
          'Un bon objectif cible un exercice précis, une métrique claire et une valeur atteignable.',
        bullets: [
          'Choisis l’exercice concerné.',
          'Définis la métrique: charge, répétitions, durée ou distance.',
          'Vérifie que la cible reste alignée avec ton niveau réel.',
        ],
      },
      {
        title: 'Alimenter les statistiques',
        description:
          'Les statistiques ne se remplissent qu’avec des séances bien terminées et des résultats plausibles.',
        bullets: [
          'Complète les séances avant d’attendre un résultat de progression.',
          'Évite les valeurs vides ou approximatives sur les performances clés.',
          'Contrôle régulièrement ton poids actuel si tu suis une évolution corporelle.',
        ],
      },
      {
        title: 'Lire les badges avec recul',
        description:
          'Un badge validé est un indicateur, pas une fin en soi. L’important reste la cohérence de la progression.',
        bullets: [
          'Consulte les badges validés dans le profil.',
          'Observe les badges en cours dans la section progression.',
          'Corrige les données si un badge paraît incohérent avec le niveau réel.',
        ],
      },
    ],
    problems: [
      {
        title: 'Mes statistiques sont vides',
        solution:
          'Vérifie que plusieurs séances sont marquées comme terminées et que les résultats réels ont bien été enregistrés.',
      },
      {
        title: 'Mon badge ne se valide pas',
        solution:
          'Contrôle la valeur cible, l’exercice associé et la dernière séance terminée. Un badge ne change pas si les données restent insuffisantes.',
      },
    ],
  },
  {
    id: 'account',
    label: 'Compte',
    title: 'Compte et sécurité',
    summary:
      'Le compte doit rester simple à administrer: profil lisible, paramètres de partage explicites et accès support propre.',
    essentials: [
      'Utilise un mot de passe fort à l’inscription.',
      'Sépare les données privées de ce qui peut être partagé.',
      'Passe par le support connecté pour toute demande sensible.',
    ],
    blocks: [
      {
        title: 'Gérer le profil',
        description:
          'Le profil sert à rendre l’application plus utile, pas à accumuler des données.',
        bullets: [
          'Garde un pseudo clair si tu utilises les partenaires.',
          'Mets à jour les informations qui impactent vraiment tes objectifs.',
          'Supprime les données obsolètes plutôt que de les laisser dériver.',
        ],
      },
      {
        title: 'Garder un compte propre',
        description:
          'Les surfaces de support et d’administration restent protégées. Le centre d’aide public ne doit pas exposer d’informations sensibles.',
        bullets: [
          'Connecte-toi avant d’ouvrir un ticket.',
          'Ne partage pas de données personnelles dans un message public.',
          'Vérifie l’URL et la session avant une action sensible.',
        ],
      },
    ],
    problems: [
      {
        title: 'Je ne peux pas me connecter',
        solution:
          'Vérifie l’adresse email, le mot de passe et la confirmation du compte. Si nécessaire, passe par la réinitialisation du mot de passe.',
      },
      {
        title: 'Je veux contacter le support',
        solution:
          'L’espace de contact support nécessite une session ouverte. Connecte-toi puis ouvre le formulaire de support pour un suivi propre.',
      },
    ],
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    title: 'Onboarding et configuration initiale',
    summary:
      'L’onboarding doit poser une base crédible: objectif, niveau, fréquence et données physiques essentielles, sans surcharge.',
    essentials: [
      'Les réponses servent à configurer l’expérience, pas à bloquer l’utilisateur.',
      'Le poids initial doit rester cohérent avec l’historique souhaité.',
      'L’onboarding peut être repris si les priorités changent.',
    ],
    blocks: [
      {
        title: 'Configurer sans se disperser',
        description:
          'L’objectif est de mettre en place les paramètres utiles en quelques étapes nettes.',
        bullets: [
          'Choisis ton objectif principal.',
          'Sélectionne ton niveau et ta fréquence d’entraînement.',
          'Renseigne uniquement les mesures nécessaires à la personnalisation.',
        ],
      },
      {
        title: 'Rejouer l’onboarding',
        description:
          'Si ton cadre d’entraînement évolue, tu peux relancer la configuration sans reconstruire le compte.',
        bullets: [
          'Retourne dans la section dédiée ou utilise la route d’onboarding.',
          'Vérifie ensuite le profil mis à jour.',
          'Corrige manuellement le poids initial uniquement si l’historique doit vraiment changer.',
        ],
      },
    ],
    problems: [
      {
        title: 'Mes données ne semblent pas à jour',
        solution:
          'Actualise la page profil après l’onboarding. Si l’écart persiste, relance la configuration ou corrige les champs clés depuis le profil.',
      },
    ],
  },
]

export const supportQuickLinks: SupportQuickLink[] = [
  {
    href: '/support/contact',
    label: 'Contacter le support',
    description: 'Ouvrir le formulaire de contact avec suivi de ticket.',
    authRequired: true,
  },
  {
    href: '/faq',
    label: 'Consulter la FAQ',
    description: 'Parcourir les réponses rapides aux questions fréquentes.',
  },
  {
    href: '/pwa-guide',
    label: 'Installer la PWA',
    description: 'Voir le guide d’installation sur mobile et desktop.',
  },
  {
    href: '/auth',
    label: 'Accéder à mon espace',
    description: 'Se connecter pour retrouver le calendrier et les actions privées.',
  },
]
