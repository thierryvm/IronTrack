import { Dumbbell, Clock } from 'lucide-react'

// Export des constantes pour utilisation dans le wizard
export const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers'
]
export const difficulties = ['Débutant', 'Intermédiaire', 'Avancé']
export const exerciseTypes = [
  { value: 'Musculation', label: 'Musculation', icon: Dumbbell, color: 'text-orange-800' },
  { value: 'Cardio', label: 'Cardio', icon: Clock, color: 'text-blue-500' }
]

// Export de la table d'exercices standards pour utilisation dans le wizard
export const standardExercises: Record<string, Array<{name: string, label: string, type: string, equipment: string, difficulty: string, suggestions: Array<{label: string, values: Record<string, string | number>}>}>> = {
  'Pectoraux': [
    {
      name: 'Développé couché', label: 'Développé couché', type: 'Musculation', equipment: 'Barre + banc', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '8 reps à 40kg (débutant)', values: { firstReps: '8', firstWeight: '40', sets: 3 } },
        { label: '10 reps à 60kg (intermédiaire)', values: { firstReps: '10', firstWeight: '60', sets: 4 } },
        { label: '12 reps à 80kg (avancé)', values: { firstReps: '12', firstWeight: '80', sets: 4 } },
      ]
    },
    {
      name: 'Pompes', label: 'Pompes', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps (débutant)', values: { firstReps: '15', sets: 3 } },
        { label: '30 reps (intermédiaire)', values: { firstReps: '30', sets: 4 } },
        { label: '50 reps (IronBuddy)', values: { firstReps: '50', sets: 5 } },
      ]
    },
    {
      name: 'Développé incliné', label: 'Développé incliné', type: 'Musculation', equipment: 'Barre + banc', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 30kg', values: { firstReps: '10', firstWeight: '30', sets: 3 } },
      ]
    },
  ],
  'Dos': [
    {
      name: 'Tractions', label: 'Tractions', type: 'Musculation', equipment: 'Barre de traction', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '5 reps (débutant)', values: { firstReps: '5', sets: 3 } },
        { label: '10 reps (intermédiaire)', values: { firstReps: '10', sets: 4 } },
        { label: '10 reps lestées (avancé)', values: { firstReps: '10', firstWeight: '10', sets: 4 } },
      ]
    },
    {
      name: 'Rowing barre', label: 'Rowing barre', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 40kg', values: { firstReps: '10', firstWeight: '40', sets: 3 } },
        { label: '12 reps à 60kg', values: { firstReps: '12', firstWeight: '60', sets: 4 } },
      ]
    },
    {
      name: 'Tirage horizontal', label: 'Tirage horizontal', type: 'Musculation', equipment: 'Machine', difficulty: 'Débutant',
      suggestions: [
        { label: '12 reps à 30kg', values: { firstReps: '12', firstWeight: '30', sets: 3 } },
      ]
    },
  ],
  'Jambes': [
    {
      name: 'Squat', label: 'Squat', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 40kg (débutant)', values: { firstReps: '10', firstWeight: '40', sets: 3 } },
        { label: '12 reps à 80kg (intermédiaire)', values: { firstReps: '12', firstWeight: '80', sets: 4 } },
        { label: '10 reps à 120kg (avancé)', values: { firstReps: '10', firstWeight: '120', sets: 4 } },
      ]
    },
    {
      name: 'Presse à jambes', label: 'Presse à jambes', type: 'Musculation', equipment: 'Machine', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps à 60kg', values: { firstReps: '15', firstWeight: '60', sets: 3 } },
      ]
    },
    {
      name: 'Fentes', label: 'Fentes', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '10 reps/jambe', values: { firstReps: '10', sets: 3 } },
      ]
    },
  ],
  'Épaules': [
    {
      name: 'Développé militaire', label: 'Développé militaire', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 20kg', values: { firstReps: '10', firstWeight: '20', sets: 3 } },
        { label: '12 reps à 40kg', values: { firstReps: '12', firstWeight: '40', sets: 4 } },
      ]
    },
    {
      name: 'Élévations latérales', label: 'Élévations latérales', type: 'Musculation', equipment: 'Haltères', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps à 6kg', values: { firstReps: '15', firstWeight: '6', sets: 3 } },
      ]
    },
  ],
  'Biceps': [
    {
      name: 'Curl haltère', label: 'Curl haltère', type: 'Musculation', equipment: 'Haltères', difficulty: 'Débutant',
      suggestions: [
        { label: '12 reps à 8kg', values: { firstReps: '12', firstWeight: '8', sets: 3 } },
        { label: '10 reps à 12kg', values: { firstReps: '10', firstWeight: '12', sets: 4 } },
      ]
    },
  ],
  'Triceps': [
    {
      name: 'Dips', label: 'Dips', type: 'Musculation', equipment: 'Barre de traction', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '8 reps (débutant)', values: { firstReps: '8', sets: 3 } },
        { label: '12 reps lestées', values: { firstReps: '12', firstWeight: '10', sets: 4 } },
      ]
    },
    {
      name: 'Extensions poulie', label: 'Extensions poulie', type: 'Musculation', equipment: 'Machine', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps à 20kg', values: { firstReps: '15', firstWeight: '20', sets: 3 } },
      ]
    },
  ],
  'Abdominaux': [
    {
      name: 'Crunchs', label: 'Crunchs', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '20 reps', values: { firstReps: '20', sets: 3 } },
      ]
    },
    {
      name: 'Gainage', label: 'Gainage', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '3x30s', values: { firstReps: '30', sets: 3 } },
      ]
    },
  ],
  'Fessiers': [
    {
      name: 'Hip Thrust', label: 'Hip Thrust', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '12 reps à 40kg', values: { firstReps: '12', firstWeight: '40', sets: 3 } },
        { label: '15 reps à 70kg', values: { firstReps: '15', firstWeight: '70', sets: 4 } },
      ]
    },
    {
      name: 'Glute kickback', label: 'Glute kickback', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '20 reps/jambe', values: { firstReps: '20', sets: 3 } },
      ]
    },
    {
      name: 'Squats bulgares', label: 'Squats bulgares', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '15 reps/jambe', values: { firstReps: '15', sets: 3 } },
        { label: '12 reps avec haltères', values: { firstReps: '12', firstWeight: '15', sets: 3 } },
      ]
    },
  ],
};

// Export de la fonction de suggestions dynamiques pour utilisation dans le wizard
export function getExerciseSuggestions(type: string, muscle: string, name: string): Array<{label: string, values: Record<string, string | number>}> {
  // Table de correspondance nom -> groupe musculaire
  const muscleMap: Record<string, string> = {
    'pompe': 'Pectoraux',
    'traction': 'Dos',
    'squat': 'Jambes',
    'course': 'Jambes',
    'vélo': 'Jambes',
    'rameur': 'Dos',
    'abdo': 'Abdominaux',
    'fente': 'Jambes',
    'dips': 'Triceps',
    'développé': 'Pectoraux',
    'rowing': 'Dos',
    'soulevé': 'Jambes',
    'curl': 'Biceps',
    'presse': 'Jambes',
    'hip thrust': 'Fessiers',
    'gainage': 'Abdominaux',
    'élévation': 'Épaules',
    'extension': 'Triceps',
    'crunch': 'Abdominaux',
    'planche': 'Abdominaux',
    'kickback': 'Fessiers',
    'bulgare': 'Fessiers',
    'tirage': 'Dos',
    'militaire': 'Épaules',
  };
  // Table de correspondance nom -> équipement
  const equipmentMap: Record<string, string> = {
    'pompe': 'Poids du corps',
    'traction': 'Barre de traction',
    'squat': 'Barre libre',
    'course': 'Poids du corps',
    'vélo': 'Machine',
    'rameur': 'Machine',
    'abdo': 'Poids du corps',
    'fente': 'Poids du corps',
    'dips': 'Barre de traction',
    'développé': 'Barre + banc',
    'rowing': 'Barre libre',
    'soulevé': 'Barre libre',
    'curl': 'Haltères',
    'presse': 'Machine',
    'hip thrust': 'Barre libre',
    'gainage': 'Poids du corps',
    'élévation': 'Haltères',
    'extension': 'Machine',
    'crunch': 'Poids du corps',
    'planche': 'Poids du corps',
    'kickback': 'Poids du corps',
    'bulgare': 'Poids du corps',
    'tirage': 'Machine',
    'militaire': 'Barre libre',
  };
  // Table de correspondance nom -> difficulté
  const difficultyMap: Record<string, string> = {
    'pompe': 'Débutant',
    'traction': 'Intermédiaire',
    'squat': 'Intermédiaire',
    'course': 'Débutant',
    'vélo': 'Débutant',
    'rameur': 'Débutant',
    'abdo': 'Débutant',
    'fente': 'Débutant',
    'dips': 'Intermédiaire',
    'développé': 'Intermédiaire',
    'rowing': 'Intermédiaire',
    'soulevé': 'Avancé',
    'curl': 'Débutant',
    'presse': 'Débutant',
    'hip thrust': 'Intermédiaire',
    'gainage': 'Débutant',
    'élévation': 'Débutant',
    'extension': 'Débutant',
    'crunch': 'Débutant',
    'planche': 'Intermédiaire',
    'kickback': 'Débutant',
    'bulgare': 'Intermédiaire',
    'tirage': 'Débutant',
    'militaire': 'Intermédiaire',
  };
  // Utilitaire pour trouver la clé correspondante
  function findKey(n: string) {
    return Object.keys(muscleMap).find(k => n.includes(k));
  }
  const n = name.toLowerCase();
  const key = findKey(n) || '';
  // Suggestions muscu
  if (type === 'Musculation') {
    if (key === 'pompe') {
      return [
        { label: '20 pompes', values: { name: 'Pompes', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '20', firstWeight: '', sets: 3 } },
        { label: '50 pompes', values: { name: 'Pompes', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '50', firstWeight: '', sets: 4 } },
        { label: '100 pompes (IronBuddy)', values: { name: 'Pompes', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '100', firstWeight: '', sets: 5 } },
      ];
    }
    if (key === 'traction') {
      return [
        { label: '10 tractions', values: { name: 'Tractions', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '10', firstWeight: '', sets: 3 } },
        { label: '20 tractions lestées', values: { name: 'Tractions', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '20', firstWeight: '10', sets: 4 } },
      ];
    }
    if (key === 'squat') {
      return [
        { label: '20 squats à 60kg', values: { name: 'Squat', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '20', firstWeight: '60', sets: 3 } },
        { label: '10 squats à 100kg', values: { name: 'Squat', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '10', firstWeight: '100', sets: 4 } },
      ];
    }
    if (key === 'développé') {
      return [
        { label: '10 reps à 60kg', values: { name: 'Développé couché', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '10', firstWeight: '60', sets: 3 } },
        { label: '8 reps à 80kg', values: { name: 'Développé couché', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '8', firstWeight: '80', sets: 4 } },
      ];
    }
    if (key === 'curl') {
      return [
        { label: '12 reps à 10kg', values: { name: 'Curl haltère', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '12', firstWeight: '10', sets: 3 } },
        { label: '15 reps à 8kg', values: { name: 'Curl haltère', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '15', firstWeight: '8', sets: 3 } },
      ];
    }
    if (key === 'élévation') {
      return [
        { label: '15 reps à 6kg', values: { name: 'Élévations latérales', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '15', firstWeight: '6', sets: 3 } },
        { label: '12 reps à 8kg', values: { name: 'Élévations latérales', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '12', firstWeight: '8', sets: 3 } },
      ];
    }
    if (key === 'extension') {
      return [
        { label: '15 reps à 20kg', values: { name: 'Extensions poulie', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '15', firstWeight: '20', sets: 3 } },
        { label: '12 reps à 25kg', values: { name: 'Extensions poulie', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '12', firstWeight: '25', sets: 3 } },
      ];
    }
    if (key === 'crunch' || key === 'abdo') {
      return [
        { label: '25 crunchs', values: { name: 'Crunchs', muscle: muscleMap[key] || 'Abdominaux', equipment: equipmentMap[key] || 'Poids du corps', difficulty: difficultyMap[key] || 'Débutant', firstReps: '25', sets: 3 } },
        { label: '50 crunchs', values: { name: 'Crunchs', muscle: muscleMap[key] || 'Abdominaux', equipment: equipmentMap[key] || 'Poids du corps', difficulty: difficultyMap[key] || 'Débutant', firstReps: '50', sets: 4 } },
      ];
    }
    if (key === 'hip thrust') {
      return [
        { label: '12 reps à 40kg', values: { name: 'Hip Thrust', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '12', firstWeight: '40', sets: 3 } },
        { label: '15 reps à 70kg', values: { name: 'Hip Thrust', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '15', firstWeight: '70', sets: 4 } },
      ];
    }
    // Suggestions génériques muscu
    return [
      { label: '10 reps à 50kg', values: { name: 'Développé couché', muscle: 'Pectoraux', equipment: 'Barre + banc', difficulty: 'Intermédiaire', firstReps: '10', firstWeight: '50', sets: 3 } },
      { label: '20 reps au poids du corps', values: { name: 'Pompes', muscle: 'Pectoraux', equipment: 'Poids du corps', difficulty: 'Débutant', firstReps: '20', firstWeight: '', sets: 3 } },
      { label: '100 reps (challenge)', values: { name: 'Pompes', muscle: 'Pectoraux', equipment: 'Poids du corps', difficulty: 'Débutant', firstReps: '100', firstWeight: '', sets: 5 } },
    ];
  }
  // Suggestions cardio
  if (type === 'Cardio') {
    if (key === 'course') {
      return [
        { label: '5 km en 30 min', values: { name: 'Course', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '5', distanceUnit: 'km', minutes: '30', speed: '10', speedUnit: 'km/h', calories: '350' } },
        { label: '10 km en 1h', values: { name: 'Course', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '10', distanceUnit: 'km', minutes: '60', speed: '10', speedUnit: 'km/h', calories: '700' } },
      ];
    }
    if (key === 'vélo') {
      return [
        { label: '20 km en 1h', values: { name: 'Vélo', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '20', distanceUnit: 'km', minutes: '60', speed: '20', speedUnit: 'km/h', calories: '500' } },
        { label: '10 km en 30 min', values: { name: 'Vélo', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '10', distanceUnit: 'km', minutes: '30', speed: '20', speedUnit: 'km/h', calories: '250' } },
      ];
    }
    if (key === 'rameur') {
      return [
        { label: '2000 m en 8 min', values: { name: 'Rameur', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '2', distanceUnit: 'km', minutes: '8', speed: '15', speedUnit: 'km/h', calories: '150' } },
      ];
    }
    // Suggestions génériques cardio
    return [
      { label: '30 min à 10 km/h', values: { name: 'Course', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', minutes: '30', speed: '10', speedUnit: 'km/h', calories: '300' } },
      { label: '5 km en 25 min', values: { name: 'Course', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', distance: '5', distanceUnit: 'km', minutes: '25', speed: '12', speedUnit: 'km/h', calories: '350' } },
      { label: '300 calories', values: { name: 'Course', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', calories: '300', minutes: '30' } },
    ];
  }
  // Suggestions fun
  return [
    { label: '10 burpees en chantant la Marseillaise', values: { name: 'Burpees', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', firstReps: '10', sets: 1 } },
    { label: 'Séance déguisé (optionnel)', values: { name: 'Cardio déguisé', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant' } },
  ];
}