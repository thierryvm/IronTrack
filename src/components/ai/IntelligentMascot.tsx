'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// 🧠 SYSTÈME D'INTELLIGENCE MASCOTTE - Inspiré par Duolingo + Habitica + CARROT
export interface UserContext {
  id: string
  email?: string
  full_name?: string
  goal?: 'Perte de poids' | 'Prise de masse' | 'Endurance' | 'Force' | 'Santé générale'
  experience?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
  frequency?: string
  lastWorkout?: Date | null
  totalWorkouts: number
  currentStreak: number
  favoriteExercises: string[]
  weakPoints: string[]
  achievements: string[]
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  motivation_level: 'low' | 'medium' | 'high'
}

export interface IntelligentContent {
  type: 'advice' | 'joke' | 'motivation' | 'challenge'
  content: string
  context?: string
  emoji?: string
}

// 🎭 BLAGUES INSPIRÉES DUOLINGO/HABITICA - Niveaux de qualité supérieure
const ADVANCED_JOKES = {
  // Blagues liées au contexte utilisateur
  beginner: [
    "Pourquoi les débutants adorent les burpees ? Parce qu'ils ne savent pas encore qu'ils les détesteront ! 😅",
    "Tu sais que tu es débutant quand tu comptes tes pas pour aller au frigo comme un exercice ! 🚶‍♂️",
    "Les abdos, c'est comme les pokémons : au début, tu ne vois rien, mais avec de la patience... tu les attrapes tous ! 💪",
    "Moi, IronBuddy, j'ai calculé : tes muscles grandissent même quand tu dors. Sieste = entraînement ! 😴"
  ],
  
  intermediate: [
    "Tu connais la différence entre toi et un powerlifter ? Lui, il compte en kilos. Toi, tu comptes en 'Aïe !' 😂",
    "Pourquoi les haltères ne racontent jamais de mensonges ? Elles sont trop lourdes pour porter des histoires ! 🏋️‍♀️",
    "Ta progression, c'est comme WiFi : parfois ça marche super bien, parfois tu veux tout casser ! 📶",
    "IronBuddy fact: Les courbatures, c'est juste tes muscles qui applaudissent tes efforts ! 👏"
  ],
  
  advanced: [
    "À ton niveau, tu pourrais soulever la barre... et accessoirement l'ambiance de la salle ! 🎉",
    "Les débutants font des selfies. Les avancés font des PRs. Toi ? Tu fais les deux ! 📸",
    "Ta technique est si clean qu'elle ferait pleurer de joie un coach ! (Ou peut-être que c'est la sueur ?) 😭",
    "Légende dit que quand tu fais du squat, même la gravité respecte ta forme ! 🌍"
  ],
  
  // Blagues selon l'heure
  morning: [
    "Café + Entraînement = Combo légendaire ! Tu as débloqué le mode 'Warrior du matin' ! ☕",
    "Les vers se lèvent tôt... mais toi, tu soulèves des poids ! Qui gagne ? 🪱",
    "Matinal ET motivé ? Tu es officiellement mon héros ! 🦸‍♀️"
  ],
  
  evening: [
    "Entraînement du soir, muscles d'espoir ! (Oui, je sais, c'est nul, mais j'assume !) 🌅",
    "Tu finis ta journée en beauté... et en sueur ! Perfect combo ! ✨",
    "Le soir, c'est quand tes muscles écrivent leur journal intime : 'Cher diary, aujourd'hui on a souffert...' 📔"
  ],

  // Blagues selon les exercices
  cardio: [
    "Courir après ses rêves, c'est bien. Courir sur un tapis, c'est mieux pour le cardio ! 🏃‍♂️",
    "Fun fact: Le cœur bat plus vite en cardio, mais aussi devant une bonne pizza. Science ! 🍕",
    "Tu cours si vite que même tes problèmes n'arrivent pas à te rattraper ! 💨"
  ],
  
  strength: [
    "Les poids ne mentent jamais... contrairement à ta balance ! 😏",
    "Force = Masse × Accélération. Chez toi = Pure motivation × Détermination ! 🧮",
    "Tu soulèves si lourd que même la gravité se demande si elle travaille encore ! 🌍"
  ]
}

// 💪 CONSEILS PERSONNALISÉS INTELLIGENTS - Inspiré MyFitnessPal/iFit AI Coach
const INTELLIGENT_ADVICE = {
  // Conseils selon objectif + niveau
  weight_loss_beginner: [
    "🔥 Start small, dream big! Concentre-toi sur 20-30 min d'activité, 3x/semaine. Ton corps apprend déjà !",
    "💡 Secret pro : L'hydratation booste ton métabolisme de 30%. Bois avant d'avoir soif !",
    "🎯 Cardio + musculation léger = combo magique pour brûler MÊME au repos !",
    "⚡ Ta progression : Semaine 1-2 = adaptation, Semaine 3-4 = premiers résultats, Semaine 5+ = transformation visible !"
  ],

  mass_gain_intermediate: [
    "🏗️ Construction musculaire = patience + consistance. Tu es sur la bonne voie !",
    "🍖 Protéines timing: 20-30g dans les 2h post-workout pour optimiser la synthèse !",
    "💪 Progressive overload: +2.5kg ou +1 rep chaque semaine. Tes muscles adorent les défis !",
    "🛌 Récupération = 70% de tes gains. Dors comme un champion pour ressembler à un champion !"
  ],

  endurance_advanced: [
    "🚴‍♂️ Zone 2 training: 70% de ton cardio à intensité conversationnelle = base aérobie solide !",
    "📊 VO2 max boost: Intervalles 4x4min à 90% FCmax, récup 3min. Science-backed !",
    "🧠 Mental game: Visualise ta performance 5min avant. Ton cerveau prépare tes muscles !",
    "⚖️ Balance: 80% endurance + 20% force = formula olympique pour longévité sportive !"
  ],

  // Conseils selon contexte temporel
  streak_building: [
    "🔥 Streak de {streak} jours ! Statistiquement, 21 jours créent une habitude. Tu y es presque !",
    "⭐ James Clear method: 1% better chaque jour = 37x meilleur en 1 an. Math doesn't lie !",
    "🎯 Consistency > Intensity. Mieux vaut 15min quotidien que 2h sporadiques !",
    "🧠 Hack neurologique: Celebre chaque mini-victoire. Ton cerveau adore les rewards !"
  ],

  comeback_motivation: [
    "🔄 Comeback story en cours ! Muscle memory = 6 mois pour revenir à 90% de ton peak !",
    "💡 Plot twist: Les pauses peuvent être bénéfiques. Deload forcé = adaptation optimisée !",
    "🚀 Start where you are strategy: -20% de ton ancien niveau, progression +10% par semaine !",
    "🎭 Character arc: Chaque héros a des obstacles. Ton chapitre 'résurrection' commence maintenant !"
  ]
}

// 🔥 SYSTÈME MOTIVATION CONTEXTUELLE - Inspiré Zombies Run + CARROT
const CONTEXTUAL_MOTIVATION = {
  // Motivation selon performance récente
  crushing_it: [
    "🚀 WOOOOH ! Tu détruis tout sur ton passage ! Les haltères tremblent quand tu arrives !",
    "👑 Statut: LÉGENDE EN MARCHE ! Continue comme ça, tu vas finir par faire peur à Chuck Norris !",
    "⚡ Energy level: OVER 9000 ! Ton aura de détermination se voit depuis l'espace !",
    "🏆 Breaking news: Local hero spotted crushing personal records. More at 11!"
  ],

  consistent_effort: [
    "💎 Consistency is your superpower! Diamants = pression + temps. Tu es en formation !",
    "🌱 Croissance steady = croissance durable ! Tortue vs Lièvre, on sait qui gagne !",
    "⚙️ Machine mode activé ! Régularité = secret des champions olympiques !",
    "📈 Trend analysis: Progression linéaire détectée. Trajectory = excellence inévitable !"
  ],

  needs_push: [
    "🔔 Gentle reminder de ton coach préféré: Tes muscles t'attendent ! Ils s'ennuient !",
    "⏰ Plot twist: L'inactivité ne rend pas plus fort. Science fact! Time to move!",
    "🎯 Challenge mode: Prouve-moi que tu peux encore me surprendre ! I dare you!",
    "💪 Tes goals t'appellent... 'Helloooo, tu nous as oubliés ?' - Tes objectifs, probably"
  ],

  // Motivation selon moment de la journée + contexte
  monday_morning: [
    "🌟 Monday Morning Warrior activate! Tu commences la semaine comme un BOSS !",
    "☕ Caféine + Endorphines = Combo ultime ! Monday blues? Not today!",
    "🚀 Fresh week, fresh gains! Reset button pressed, let's create magic!"
  ],

  friday_evening: [
    "🎉 Friday FINISHER! Termine ta semaine en beauté avec cette session épique !",
    "✨ Weekend warrior prep mode: Earn your rest with one last epic effort!",
    "🏁 Final boss battle de la semaine ! Show me what you've got!"
  ]
}

// 🎮 DÉFIS GAMIFIÉS - Inspiré Habitica
const GAMIFIED_CHALLENGES = {
  daily_quests: [
    "⚔️ Daily Quest: 'Slayer of Excuses' - Complete ton workout pour +50 XP !",
    "🏹 Side Mission: 'Water Temple' - Bois 2L d'eau aujourd'hui pour débloquer le buff hydratation !",
    "🛡️ Boss Battle: 'The Procrastination Dragon' - Commence dans les 10 prochaines minutes !",
    "💎 Treasure Hunt: Cache 3 séries parfaites dans ta session pour trouver le trésor endorphines !"
  ],

  weekly_challenges: [
    "🏆 Weekly Challenge: 'Consistency Champion' - 5 workouts cette semaine = Badge Guerrier !",
    "🌟 Epic Quest: 'PR Prophecy' - Bats un record personnel cette semaine = Titre Legendary !",
    "🔥 Guild Mission: 'Progress Parade' - Améliore 3 exercices différents = Rank up garanteed !"
  ]
}

export class IntelligentMascotAI {
  private userContext: UserContext | null = null

  async analyzeUserContext(userId: string): Promise<UserContext> {
    const supabase = createClient()
    
    // Récupérer profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Récupérer statistiques d'entraînement
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Récupérer exercices favoris (temporairement désactivé pour simplifier)
    // const { data: performances } = await supabase
    //   .from('performance_logs')
    //   .select('exercise_id, exercises(name)')
    //   .eq('user_id', userId)
    //   .limit(20)

    // Calculer contexte intelligent
    const now = new Date()
    const hour = now.getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'
    
    const totalWorkouts = workouts?.length || 0
    const lastWorkout = workouts?.[0] ? new Date(workouts[0].created_at) : null
    const daysSinceLastWorkout = lastWorkout ? Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)) : 999
    
    // Calculer motivation level
    const motivation_level: 'low' | 'medium' | 'high' = 
      daysSinceLastWorkout > 7 ? 'low' : 
      daysSinceLastWorkout <= 2 ? 'high' : 'medium'

    this.userContext = {
      id: userId,
      email: profile?.email,
      full_name: profile?.full_name,
      goal: profile?.goal,
      experience: profile?.experience,
      frequency: profile?.frequency,
      lastWorkout,
      totalWorkouts,
      currentStreak: this.calculateStreak(workouts || []),
      favoriteExercises: [],
      weakPoints: [],
      achievements: [],
      timeOfDay,
      motivation_level
    }

    return this.userContext
  }

  private calculateStreak(workouts: Array<{created_at: string}>): number {
    if (!workouts.length) return 0
    
    let streak = 0
    const today = new Date()
    
    for (const workout of workouts) {
      const workoutDate = new Date(workout.created_at)
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= streak + 1) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  private extractFavoriteExercises(performances: Array<{exercises?: {name: string}}>): string[] {
    const exerciseCounts: Record<string, number> = {}
    
    performances.forEach(perf => {
      const exerciseName = perf.exercises?.name
      if (exerciseName) {
        exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1
      }
    })
    
    return Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name)
  }

  generateIntelligentJoke(): IntelligentContent {
    if (!this.userContext) {
      return {
        type: 'joke',
        content: "Je n'ai pas encore appris à te connaître, mais je parie que tu es génial ! 😄",
        emoji: "😄"
      }
    }

    const { experience, timeOfDay } = this.userContext
    
    // Sélection intelligente selon contexte
    let jokes: string[] = []
    
    // Mapper les expériences françaises vers les clés anglaises
    const experienceMap: Record<string, keyof typeof ADVANCED_JOKES> = {
      'Débutant': 'beginner',
      'Intermédiaire': 'intermediate', 
      'Avancé': 'advanced',
      'Expert': 'advanced'
    }
    
    if (experience && experienceMap[experience]) {
      jokes.push(...ADVANCED_JOKES[experienceMap[experience]])
    }
    
    const timeMap: Record<string, keyof typeof ADVANCED_JOKES> = {
      'morning': 'morning',
      'evening': 'evening'
    }
    
    if (timeOfDay && timeMap[timeOfDay]) {
      jokes.push(...ADVANCED_JOKES[timeMap[timeOfDay]])
    }
    
    // Fallback vers blagues générales
    if (jokes.length === 0) {
      jokes = [...ADVANCED_JOKES.beginner, ...ADVANCED_JOKES.morning]
    }
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
    
    return {
      type: 'joke',
      content: randomJoke,
      context: `Adaptée à ton niveau ${experience} et moment ${timeOfDay}`,
      emoji: "😂"
    }
  }

  generatePersonalizedAdvice(): IntelligentContent {
    if (!this.userContext) {
      return {
        type: 'advice',
        content: "💡 Commence petit, rêve grand ! Chaque expert était un débutant un jour.",
        emoji: "💡"
      }
    }

    const { goal, experience, currentStreak, totalWorkouts } = this.userContext
    
    // Logique intelligente de conseil
    let advice: string[] = []
    
    // Conseils selon progression
    if (currentStreak >= 7) {
      advice.push(...INTELLIGENT_ADVICE.streak_building.map(a => a.replace('{streak}', currentStreak.toString())))
    } else if (currentStreak === 0 && totalWorkouts > 0) {
      advice.push(...INTELLIGENT_ADVICE.comeback_motivation)
    }
    
    // Conseils selon objectif + niveau
    const contextKey = `${goal?.toLowerCase().replace(/\s/g, '_')}_${experience?.toLowerCase()}` as keyof typeof INTELLIGENT_ADVICE
    if (INTELLIGENT_ADVICE[contextKey]) {
      advice.push(...INTELLIGENT_ADVICE[contextKey])
    }
    
    // Fallback
    if (advice.length === 0) {
      advice = INTELLIGENT_ADVICE.weight_loss_beginner
    }
    
    const randomAdvice = advice[Math.floor(Math.random() * advice.length)]
    
    return {
      type: 'advice',
      content: randomAdvice,
      context: `Personnalisé pour ${goal} niveau ${experience}`,
      emoji: "💡"
    }
  }

  generateContextualMotivation(): IntelligentContent {
    if (!this.userContext) {
      return {
        type: 'motivation',
        content: "🚀 Prêt à faire sensation ? Tes muscles n'attendent que toi !",
        emoji: "🚀"
      }
    }

    const { motivation_level, timeOfDay, currentStreak } = this.userContext
    
    const motivations: string[] = []
    
    // Motivation selon niveau actuel
    if (motivation_level === 'high' || currentStreak > 3) {
      motivations.push(...CONTEXTUAL_MOTIVATION.crushing_it)
    } else if (motivation_level === 'medium') {
      motivations.push(...CONTEXTUAL_MOTIVATION.consistent_effort)
    } else {
      motivations.push(...CONTEXTUAL_MOTIVATION.needs_push)
    }
    
    // Bonus motivation contextuelle
    const now = new Date()
    const dayOfWeek = now.getDay()
    const isMonday = dayOfWeek === 1
    const isFriday = dayOfWeek === 5
    
    if (isMonday && timeOfDay === 'morning') {
      motivations.push(...CONTEXTUAL_MOTIVATION.monday_morning)
    } else if (isFriday && timeOfDay === 'evening') {
      motivations.push(...CONTEXTUAL_MOTIVATION.friday_evening)
    }
    
    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)]
    
    return {
      type: 'motivation',
      content: randomMotivation,
      context: `Motivation ${motivation_level} + contexte ${timeOfDay}`,
      emoji: "🔥"
    }
  }

  generateGamifiedChallenge(): IntelligentContent {
    const challenges = [
      ...GAMIFIED_CHALLENGES.daily_quests,
      ...GAMIFIED_CHALLENGES.weekly_challenges
    ]
    
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]
    
    return {
      type: 'challenge',
      content: randomChallenge,
      context: "Défi gamifié pour booster l'engagement",
      emoji: "🎮"
    }
  }
}

// Hook pour utiliser l'IA mascotte
export function useIntelligentMascot() {
  const [mascotAI] = useState(() => new IntelligentMascotAI())
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [loading, setLoading] = useState(false)

  const initializeContext = async (userId: string) => {
    setLoading(true)
    try {
      const context = await mascotAI.analyzeUserContext(userId)
      setUserContext(context)
    } catch (error) {
      console.error('Erreur initialisation contexte mascotte:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSmartJoke = () => mascotAI.generateIntelligentJoke()
  const getPersonalizedAdvice = () => mascotAI.generatePersonalizedAdvice()
  const getContextualMotivation = () => mascotAI.generateContextualMotivation()
  const getGamifiedChallenge = () => mascotAI.generateGamifiedChallenge()

  return {
    userContext,
    loading,
    initializeContext,
    getSmartJoke,
    getPersonalizedAdvice,
    getContextualMotivation,
    getGamifiedChallenge
  }
}