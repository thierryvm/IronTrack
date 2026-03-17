/**
 * Tests unitaires pour la logique de visibilité des champs d'exercices
 * @jest-environment jsdom
 */

import { getFieldVisibility, getFieldHelpText, FieldVisibility } from '../exerciseFieldLogic'

describe('getFieldVisibility', () => {
  
  // === TESTS MUSCULATION ===
  describe('Exercices de musculation', () => {
    test('doit afficher uniquement les champs musculation pour un squat', () => {
      const visibility = getFieldVisibility('Musculation', 'Squat bulgare', 'Poids corporel')
      
      expect(visibility.weight).toBe(true)
      expect(visibility.reps).toBe(true)
      expect(visibility.sets).toBe(true)
      expect(visibility.restTime).toBe(true)
      expect(visibility.rpe).toBe(true)
      
      // Champs cardio doivent être masqués
      expect(visibility.distance).toBe(false)
      expect(visibility.duration).toBe(false)
      expect(visibility.speed).toBe(false)
      expect(visibility.strokeRate).toBe(false)
      expect(visibility.watts).toBe(false)
      expect(visibility.incline).toBe(false)
      expect(visibility.cadence).toBe(false)
      expect(visibility.resistance).toBe(false)
    })

    test('doit afficher les champs musculation pour développé couché', () => {
      const visibility = getFieldVisibility('Musculation', 'Développé couché', 'Barre')
      
      expect(visibility.weight).toBe(true)
      expect(visibility.reps).toBe(true)
      expect(visibility.sets).toBe(true)
      expect(visibility.restTime).toBe(true)
      expect(visibility.rpe).toBe(true)
      expect(visibility.distance).toBe(false) // Pas de distance pour musculation
    })
  })

  // === TESTS CARDIO RAMEUR ===
  describe('Exercices cardio rameur', () => {
    test('doit afficher les champs rameur pour exercice avec "rameur" dans le nom', () => {
      const visibility = getFieldVisibility('Cardio', 'Rameur endurance', 'Rameur')
      
      expect(visibility.duration).toBe(true)
      expect(visibility.distance).toBe(true)
      expect(visibility.strokeRate).toBe(true)
      expect(visibility.watts).toBe(true)
      expect(visibility.calories).toBe(true)
      expect(visibility.heartRate).toBe(true)
      
      // Champs autres équipements masqués
      expect(visibility.speed).toBe(false)
      expect(visibility.incline).toBe(false)
      expect(visibility.cadence).toBe(false)
      expect(visibility.resistance).toBe(false)
      
      // Champs musculation masqués
      expect(visibility.weight).toBe(false)
      expect(visibility.reps).toBe(false)
      expect(visibility.sets).toBe(false)
    })

    test('doit détecter rameur via équipement même sans nom explicit', () => {
      const visibility = getFieldVisibility('Cardio', 'Session endurance', 'Rameur')
      
      expect(visibility.strokeRate).toBe(true)
      expect(visibility.watts).toBe(true)
      expect(visibility.distance).toBe(true)
    })

    test('doit détecter aviron comme rameur', () => {
      const visibility = getFieldVisibility('Cardio', 'Aviron en salle', 'Machine')
      
      expect(visibility.strokeRate).toBe(true)
      expect(visibility.watts).toBe(true)
    })
  })

  // === TESTS CARDIO COURSE ===
  describe('Exercices cardio course/tapis', () => {
    test('doit afficher les champs course pour tapis de course', () => {
      const visibility = getFieldVisibility('Cardio', 'Course endurance', 'Tapis de course')
      
      expect(visibility.duration).toBe(true)
      expect(visibility.distance).toBe(true)
      expect(visibility.speed).toBe(true)
      expect(visibility.incline).toBe(true)
      expect(visibility.calories).toBe(true)
      expect(visibility.heartRate).toBe(true)
      
      // Pas de métriques rameur/vélo
      expect(visibility.strokeRate).toBe(false)
      expect(visibility.watts).toBe(false)
      expect(visibility.cadence).toBe(false)
      expect(visibility.resistance).toBe(false)
    })

    test('doit détecter course via nom d\'exercice', () => {
      const visibility = getFieldVisibility('Cardio', 'Running 5K', 'Extérieur')
      
      expect(visibility.speed).toBe(true)
      expect(visibility.incline).toBe(true)
      expect(visibility.distance).toBe(true)
    })
  })

  // === TESTS CARDIO VÉLO ===
  describe('Exercices cardio vélo', () => {
    test('doit afficher les champs vélo pour vélo d\'appartement', () => {
      const visibility = getFieldVisibility('Cardio', 'Vélo spinning', 'Vélo d\'appartement')
      
      expect(visibility.duration).toBe(true)
      expect(visibility.distance).toBe(true)
      expect(visibility.speed).toBe(true)
      expect(visibility.cadence).toBe(true)
      expect(visibility.resistance).toBe(true)
      expect(visibility.calories).toBe(true)
      expect(visibility.heartRate).toBe(true)
      
      // Pas de métriques rameur/tapis
      expect(visibility.strokeRate).toBe(false)
      expect(visibility.watts).toBe(false)
      expect(visibility.incline).toBe(false)
    })

    test('doit détecter cycling via nom', () => {
      const visibility = getFieldVisibility('Cardio', 'Cycling HIIT', 'Machine')
      
      expect(visibility.cadence).toBe(true)
      expect(visibility.resistance).toBe(true)
    })
  })

  // === TESTS CARDIO STATIQUE ===
  describe('Exercices cardio statiques (sans distance)', () => {
    test('doit masquer distance/speed pour squats cardio', () => {
      const visibility = getFieldVisibility('Cardio', 'Squat jumps HIIT', 'Poids corporel')
      
      expect(visibility.duration).toBe(true)
      expect(visibility.calories).toBe(true)
      expect(visibility.heartRate).toBe(true)
      
      // Pas de distance/speed pour exercices statiques
      expect(visibility.distance).toBe(false)
      expect(visibility.speed).toBe(false)
      
      // Pas de métriques équipement
      expect(visibility.strokeRate).toBe(false)
      expect(visibility.watts).toBe(false)
      expect(visibility.incline).toBe(false)
      expect(visibility.cadence).toBe(false)
      expect(visibility.resistance).toBe(false)
    })

    test('doit traiter jumping jacks comme exercice statique', () => {
      const visibility = getFieldVisibility('Cardio', 'Jumping jacks', 'Aucun')
      
      expect(visibility.distance).toBe(false)
      expect(visibility.speed).toBe(false)
      expect(visibility.duration).toBe(true)
    })

    test('doit traiter burpees comme exercice statique', () => {
      const visibility = getFieldVisibility('Cardio', 'Burpees', 'Poids corporel')
      
      expect(visibility.distance).toBe(false)
      expect(visibility.duration).toBe(true)
      expect(visibility.calories).toBe(true)
    })

    test('doit traiter corde à sauter comme exercice statique', () => {
      const visibility = getFieldVisibility('Cardio', 'Corde à sauter', 'Corde')
      
      expect(visibility.distance).toBe(false)
      expect(visibility.duration).toBe(true)
    })

    test('doit traiter HIIT comme exercice statique', () => {
      const visibility = getFieldVisibility('Cardio', 'HIIT circuit', 'Poids corporel')
      
      expect(visibility.distance).toBe(false)
      expect(visibility.duration).toBe(true)
    })
  })

  // === TESTS FITNESS ET ÉTIREMENT ===
  describe('Exercices fitness et étirement', () => {
    test('doit afficher durée/calories/RPE pour fitness', () => {
      const visibility = getFieldVisibility('Fitness', 'Yoga flow', 'Tapis')
      
      expect(visibility.duration).toBe(true)
      expect(visibility.calories).toBe(true)
      expect(visibility.heartRate).toBe(true)
      expect(visibility.rpe).toBe(true)
      
      // Pas de weight/reps/sets
      expect(visibility.weight).toBe(false)
      expect(visibility.reps).toBe(false)
      expect(visibility.sets).toBe(false)
      
      // Pas de distance/speed
      expect(visibility.distance).toBe(false)
      expect(visibility.speed).toBe(false)
    })

    test('doit afficher durée pour étirement', () => {
      const visibility = getFieldVisibility('Étirement', 'Étirement ischio-jambiers', 'Tapis')
      
      expect(visibility.duration).toBe(true)
      expect(visibility.calories).toBe(true)
      expect(visibility.heartRate).toBe(true)
      expect(visibility.rpe).toBe(true) // Utile pour intensité étirement
      
      expect(visibility.weight).toBe(false)
      expect(visibility.distance).toBe(false)
    })
  })

  // === TESTS CAS LIMITES ===
  describe('Cas limites et fallbacks', () => {
    test('doit retourner visibilité par défaut pour type inconnu', () => {
      // @ts-ignore - Test volontaire avec type invalide
      const visibility = getFieldVisibility('TypeInconnu', 'Exercice mystère', 'Machine')
      
      // Tous les champs doivent être false par défaut
      Object.values(visibility).forEach(value => {
        expect(value).toBe(false)
      })
    })

    test('doit gérer les noms d\'exercice vides', () => {
      const visibility = getFieldVisibility('Musculation', '', '')
      
      expect(visibility.weight).toBe(true) // Toujours true pour musculation
      expect(visibility.distance).toBe(false)
    })

    test('doit être insensible à la casse', () => {
      const visibility1 = getFieldVisibility('Cardio', 'RAMEUR ENDURANCE', 'RAMEUR')
      const visibility2 = getFieldVisibility('Cardio', 'rameur endurance', 'rameur')
      
      expect(visibility1).toEqual(visibility2)
    })
  })
})

describe('getFieldHelpText', () => {
  
  test('doit retourner texte d\'aide contextuels pour distance', () => {
    expect(getFieldHelpText('distance', 'Cardio', 'Rameur endurance'))
      .toContain('mètres')
    
    expect(getFieldHelpText('distance', 'Cardio', 'Course 5K'))
      .toContain('kilomètres')
      
    expect(getFieldHelpText('distance', 'Cardio', 'Vélo spinning'))
      .toContain('kilomètres')
  })

  test('doit retourner texte d\'aide pour durée selon contexte', () => {
    expect(getFieldHelpText('duration', 'Étirement', 'Étirement dos'))
      .toContain('maintien')
      
    expect(getFieldHelpText('duration', 'Cardio', 'HIIT circuit'))
      .toContain('session')
  })

  test('doit retourner texte d\'aide pour métriques spécialisées', () => {
    expect(getFieldHelpText('strokeRate', 'Cardio', 'Rameur'))
      .toContain('SPM')
      
    expect(getFieldHelpText('watts', 'Cardio', 'Rameur'))
      .toContain('400W')
      
    expect(getFieldHelpText('cadence', 'Cardio', 'Vélo'))
      .toContain('RPM')
      
    expect(getFieldHelpText('incline', 'Cardio', 'Tapis'))
      .toContain('%')
  })

  test('doit retourner chaîne vide pour champ inconnu', () => {
    // @ts-ignore - Test volontaire avec champ invalide
    expect(getFieldHelpText('champInconnu', 'Cardio', 'Rameur'))
      .toBe('')
  })
})