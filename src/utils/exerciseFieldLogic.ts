/**
 * Logique pour déterminer quels champs afficher selon le type d'exercice et son nom
 * Objectif: Masquer les champs inappropriés (ex: distance pour squat, poids pour course)
 */

export interface FieldVisibility {
  // Champs musculation
  weight: boolean
  reps: boolean
  sets: boolean
  restTime: boolean
  rpe: boolean
  
  // Champs cardio généraux
  duration: boolean
  distance: boolean
  speed: boolean
  calories: boolean
  heartRate: boolean
  
  // Champs cardio spécialisés
  strokeRate: boolean  // SPM rameur
  watts: boolean       // Puissance rameur
  incline: boolean     // % inclinaison tapis
  cadence: boolean     // RPM vélo
  resistance: boolean  // Niveau résistance vélo
}

/**
 * Détermine quels champs afficher selon le type d'exercice et équipement
 */
export function getFieldVisibility(
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement',
  exerciseName: string = '',
  equipment: string = ''
): FieldVisibility {

  const name = exerciseName.toLowerCase()
  const equip = equipment.toLowerCase()
  
  // Configuration par défaut
  const defaultVisibility: FieldVisibility = {
    weight: false,
    reps: false,
    sets: false,
    restTime: false,
    rpe: false,
    duration: false,
    distance: false,
    speed: false,
    calories: false,
    heartRate: false,
    strokeRate: false,
    watts: false,
    incline: false,
    cadence: false,
    resistance: false
  }

  // === MUSCULATION ===
  if (exerciseType === 'Musculation') {
    return {
      ...defaultVisibility,
      weight: true,
      reps: true,
      sets: true,
      restTime: true,
      rpe: true,
      // Champs cardio masqués pour musculation
      duration: false,
      distance: false,
      speed: false,
      calories: false,  // Optionnel pour musculation
      heartRate: false, // Optionnel pour musculation
    }
  }

  // === CARDIO ===
  if (exerciseType === 'Cardio') {
    const baseCardio = {
      ...defaultVisibility,
      duration: true,
      calories: true,
      heartRate: true,
      // Champs musculation masqués pour cardio
      weight: false,
      reps: false,
      sets: false,
      restTime: false,
      rpe: false
    }

    // Détection équipement spécialisé
    if (name.includes('rameur') || equip.includes('rameur') || name.includes('aviron')) {
      return {
        ...baseCardio,
        distance: true,
        strokeRate: true,
        watts: true,
        // Pas de speed/incline/cadence/resistance pour rameur
        speed: false,
        incline: false,
        cadence: false,
        resistance: false
      }
    }

    if (name.includes('course') || name.includes('tapis') || equip.includes('tapis') || name.includes('running')) {
      return {
        ...baseCardio,
        distance: true,
        speed: true,
        incline: true,
        // Pas de metrics spécialisées autres
        strokeRate: false,
        watts: false,
        cadence: false,
        resistance: false
      }
    }

    if (name.includes('vélo') || name.includes('bike') || equip.includes('vélo') || name.includes('cycling')) {
      return {
        ...baseCardio,
        distance: true,
        speed: true,
        cadence: true,
        resistance: true,
        // Pas de metrics rameur/tapis
        strokeRate: false,
        watts: false,
        incline: false
      }
    }

    // Exercices cardio statiques (sans distance)
    const staticCardioPatterns = [
      'squat', 'jumping jack', 'burpee', 'mountain climber', 
      'planche', 'hiit', 'tabata', 'circuit', 'corde à sauter'
    ]

    const isStaticCardio = staticCardioPatterns.some(pattern => 
      name.includes(pattern) || equip.includes(pattern)
    )

    if (isStaticCardio) {
      return {
        ...baseCardio,
        // Pas de distance/speed pour exercices statiques
        distance: false,
        speed: false,
        // Garder durée, calories, heartRate
        duration: true,
        calories: true,
        heartRate: true,
        // Pas de metrics spécialisées équipement
        strokeRate: false,
        watts: false,
        incline: false,
        cadence: false,
        resistance: false
      }
    }

    // Cardio générique (avec distance par défaut)
    return {
      ...baseCardio,
      distance: true,
      speed: true,
      // Pas de metrics spécialisées par défaut
      strokeRate: false,
      watts: false,
      incline: false,
      cadence: false,
      resistance: false
    }
  }

  // === FITNESS / ÉTIREMENT ===
  if (exerciseType === 'Fitness' || exerciseType === 'Étirement') {
    return {
      ...defaultVisibility,
      duration: true,
      calories: true,
      heartRate: true,
      rpe: true, // Utile pour fitness
      // Pas de weight/reps/sets ni distance/speed
      weight: false,
      reps: false,
      sets: false,
      restTime: false,
      distance: false,
      speed: false,
      // Pas de metrics spécialisées équipement
      strokeRate: false,
      watts: false,
      incline: false,
      cadence: false,
      resistance: false
    }
  }

  // Fallback par défaut
  return defaultVisibility
}

/**
 * Messages d'aide contextuels selon l'exercice
 */
export function getFieldHelpText(
  field: keyof FieldVisibility,
  exerciseType: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement',
  exerciseName: string = ''
): string {
  
  const name = exerciseName.toLowerCase()

  switch (field) {
    case 'distance':
      if (name.includes('rameur')) return 'Distance en mètres (500m, 1000m, 2000m...)'
      if (name.includes('course') || name.includes('tapis')) return 'Distance en kilomètres (5K, 10K, marathon...)'
      if (name.includes('vélo')) return 'Distance en kilomètres'
      return 'Distance parcourue'
      
    case 'duration':
      if (exerciseType === 'Étirement') return 'Durée de maintien de la position'
      if (name.includes('hiit') || name.includes('tabata')) return 'Durée totale de la session'
      return 'Durée de l\'exercice'
      
    case 'weight':
      return 'Poids utilisé (haltères, barre, machine...)'
      
    case 'reps':
      return 'Nombre de répétitions par série'
      
    case 'strokeRate':
      return 'Cadence en coups par minute (16-36 SPM)'
      
    case 'watts':
      return 'Puissance développée (100-400W selon niveau)'
      
    case 'incline':
      return 'Inclinaison du tapis en pourcentage (0-15%)'
      
    case 'cadence':
      return 'Cadence de pédalage en tours par minute (60-120 RPM)'
      
    case 'resistance':
      return 'Niveau de résistance du vélo (1-20)'
      
    case 'heartRate':
      return 'Fréquence cardiaque moyenne (BPM)'
      
    case 'calories':
      return 'Calories brûlées estimées'
      
    case 'rpe':
      return 'Perception de l\'effort (1=très facile, 10=maximum)'
      
    default:
      return ''
  }
}