'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, X, HelpCircle, Bug, Lightbulb, 
  Dumbbell, Cat, Bot, Star, Smile,
  Sparkles, Heart, Zap, Trophy
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Version simplifiée et fonctionnelle

// Types des mascottes disponibles
type MascotKey = 'ironbuddy' | 'cat' | 'bot' | 'star'

const mascotConfig = {
  ironbuddy: {
    icon: Dumbbell,
    name: 'IronBuddy',
    bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
    hoverColor: 'hover:from-orange-500 hover:to-orange-700',
    emoji: '💪'
  },
  cat: {
    icon: Cat,
    name: 'Félix',
    bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600',
    hoverColor: 'hover:from-pink-500 hover:to-pink-700',
    emoji: '🐱'
  },
  bot: {
    icon: Bot,
    name: 'RoboCoach',
    bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    hoverColor: 'hover:from-blue-500 hover:to-blue-700',
    emoji: '🤖'
  },
  star: {
    icon: Star,
    name: 'SuperStar',
    bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    hoverColor: 'hover:from-purple-500 hover:to-purple-700',
    emoji: '⭐'
  }
}

// Messages simples qui FONCTIONNENT
const defaultMessages = [
  "Prêt pour une séance ? 💪",
  "Salut ! Je suis ton coach IronTrack ! 🎯",
  "Comment ça va aujourd'hui ? 😊",
  "Dis-moi ce dont tu as besoin ! 🤝",
  "Ensemble, on va tout déchirer ! 🔥"
]

// 🎭 BLAGUES ENRICHIES (Best of Internet + RGPD Safe + Respect tous âges)
const jokesLibrary = {
  discret: [
    "😊 Pourquoi les haltères sont toujours honnêtes ? Elles ne portent jamais de faux poids ! 💪",
    "🤗 Fun fact : Tes muscles grandissent même en dormant. Sieste = entraînement ! 😴",
    "😄 Tu connais la différence entre motivation et café ? L'une réveille, l'autre soulève ! ☕",
    "🙂 Les abdos, c'est comme WiFi : parfois ça marche, parfois on cherche le signal ! 📶",
    "😌 Moi, IronBuddy, j'ai calculé : sourire brûle des calories. Tu fais déjà du cardio ! 😊"
  ],
  normal: [
    "😂 Pourquoi les haltères ne mentent jamais ? Elles sont trop lourdes pour porter des mensonges ! 💪",
    "🤣 Tu sais pourquoi je suis le meilleur coach ? Je ne compte jamais tes burpees ratés ! 😉",
    "😆 Fun fact : Tes muscles grandissent même en dormant. Donc... sieste = gains ! 😴",
    "😄 Tu connais la différence entre toi et un powerlifter ? Lui compte en kilos, toi en 'Aïe !' 🏋️",
    "🤭 Les courbatures, c'est juste tes muscles qui applaudissent tes efforts ! 👏",
    "😅 Moi, IronBuddy : 'Allez, une dernière série !' Toi : 'Tu disais ça il y a 3 séries...' 🙄",
    "😂 Ta progression, c'est comme WiFi : parfois excellent, parfois tu veux tout casser ! 📶"
  ],
  ambianceur: [
    "🤣 BREAKING NEWS : Local legend spotted crushing PRs ! Plus d'infos à 11h ! 📺",
    "😂 Pourquoi Chuck Norris s'entraîne-t-il ? Pour rattraper TON niveau ! 🥋",
    "🤪 Fun fact : Quand tu fais du squat, même la gravité respecte ta forme ! 🌍",
    "😆 Les haltères ont créé un groupe de soutien pour survivre à tes séances ! 🏋️‍♀️",
    "🤣 Ta technique est si clean qu'elle fait pleurer de joie les coaches ! 😭",
    "😂 Légende dit que tes muscles grossissent juste en regardant la salle ! 👀",
    "🤭 Tu soulèves si lourd que même les machines font 'Wow, respect !' 🤖",
    "😆 Tes PRs sont si impressionnants qu'ils ont leur propre page Wikipedia ! 📚"
  ]
}

// 💡 CONSEILS ENRICHIS
const adviceLibrary = {
  discret: [
    "💡 L'hydratation aide ton métabolisme. Bois régulièrement ! 🚰",
    "🎯 20-30min d'activité régulière > 2h sporadiques. Consistance ! 👑",
    "🔥 Les courbatures = progrès. Ton corps s'adapte ! 👏",
    "⚖️ Équilibre : 80% nutrition + 20% exercice = résultats durables 🥗",
    "😌 Écoute ton corps : repos = partie importante de la progression 🛌"
  ],
  normal: [
    "💡 Pro Tip : L'hydratation booste ton métabolisme de 30% ! Bois avant d'avoir soif ! 🚰",
    "🎯 Astuce : 20-30min d'activité régulière > 2h sporadiques. Consistency is king ! 👑",
    "🔥 Secret : Tes courbatures = tes muscles qui applaudissent tes efforts ! 👏",
    "⚡ Hack neurologique : Célèbre chaque mini-victoire. Ton cerveau adore les rewards ! 🧠",
    "🏗️ Construction musculaire = patience + consistance. Progressive overload ! 💪",
    "🍖 Protéines timing : 20-30g dans les 2h post-workout = synthèse optimale ! ⏰",
    "🛌 Récupération = 70% de tes gains. Dors comme un champion ! 😴"
  ],
  ambianceur: [
    "💡 SCIENCE BOMB : L'hydratation booste ton métabolisme de 30% ! H2O = performance hack ! 🚰",
    "🔬 Meta-analysis confirmed : Consistency > Intensity ! 1% mieux/jour = 37x meilleur/an ! 📊",
    "⚡ Neuroplasticity hack : Visualise ta performance 5min avant. Ton cerveau prépare tes muscles ! 🧠",
    "🏗️ Anabolic window MYTH busted : Synthèse protéique dure 24-48h ! Relax sur le timing ! ⏰",
    "🎯 Zone 2 training : 70% cardio à intensité conversationnelle = base aérobie SOLID ! 🚴",
    "📈 Progressive overload formula : +2.5kg OU +1 rep/semaine = gains garanteed ! 💪",
    "🛌 Sleep optimization : 7-9h + chambre froide (16-19°C) = recovery MAX ! 😴"
  ]
}

// 🔥 MOTIVATION ENRICHIE
const motivationLibrary = {
  discret: [
    "🌟 Tu fais du super boulot ! Continue comme ça ! 💪",
    "🎯 Chaque effort compte. Tu progresses ! 📈",
    "💙 Tu es plus fort que tu ne le penses ! 🤗",
    "🌱 Chaque jour, tu deviens meilleur ! 🌸",
    "☀️ Reste positif, les résultats arrivent ! ✨"
  ],
  normal: [
    "🚀 WOOOOH ! Tu détruis tout ! Les haltères tremblent quand tu arrives ! ⚡",
    "🏆 Tu es plus fort que tes excuses ! Prouve-le-moi maintenant ! 💪",
    "🔥 Chaque rep compte ! Tu progresses même si tu ne le vois pas ! 📈",
    "⭐ Statut : MACHINE EN MARCHE ! Continue, tu es dans la zone ! 🎯",
    "💎 Consistency is your superpower ! Diamants = pression + temps ! 💍",
    "🌟 Energy level : HIGH ! Ton aura de détermination se voit depuis l'espace ! 🛸"
  ],
  ambianceur: [
    "🚀 HOLY MOLY ! Tu PULVÉRISES tout ! Les haltères organisent des réunions de crise ! 💥",
    "👑 STATUT : LÉGENDE ABSOLUE ! Continue, tu vas finir par faire peur à Zeus ! ⚡",
    "🔥 ENERGY LEVEL : OVER 9000 ! Ton aura fait trembler la Terre ! 🌍",
    "🏆 BREAKING : Local hero ANNIHILATES personal records ! Chuck Norris demande des conseils ! 🥋",
    "💥 Tu es si PUISSANT que même tes courbatures ont des courbatures ! 💪",
    "⚡ MACHINE MODE ULTIMATE ! Tu redéfinis les lois de la physique ! 🔬",
    "🌟 TU ES UNE FORCE DE LA NATURE ! Les montagnes s'écartent sur ton passage ! 🏔️"
  ]
}

// 🏆 DÉFIS ENRICHIS (sans XP)
const challengeLibrary = {
  discret: [
    "🎯 Mini défi : Bois un verre d'eau maintenant ! Hydratation = clé ! 💧",
    "🌟 Défi douceur : 5 minutes d'étirements pour bien commencer ! 🧘",
    "☀️ Challenge positif : Souris, ça fait travailler 17 muscles ! 😊",
    "🎯 Mission zen : Respire profondément 3 fois. Tu l'as mérité ! 🫁",
    "🌱 Petit objectif : Note une chose positive sur ta progression ! 📝"
  ],
  normal: [
    "🎮 Daily Quest : Complete ton workout dans les 20 prochaines minutes ! ⚔️",
    "🏹 Mission hydratation : Bois 2L d'eau aujourd'hui pour débloquer le buff ! 💧",
    "🛡️ Boss Battle : Vaincs la Procrastination ! Commence maintenant ! ⚡",
    "🎯 Challenge focus : 1 exercice parfait > 10 exercices bâclés ! 🎯",
    "🏆 Objectif warrior : Améliore UN mouvement aujourd'hui ! 💪",
    "⭐ Mission consistency : 15min minimum, c'est déjà une victoire ! ⏰"
  ],
  ambianceur: [
    "🎮 EPIC QUEST : ANNIHILE ton workout dans les 15 prochaines minutes ! ⚔️",
    "🏹 LEGENDARY MISSION : Bois 3L d'eau pour débloquer le mode TSUNAMI ! 🌊",
    "🛡️ FINAL BOSS BATTLE : DESTRUCTION TOTALE de la Procrastination ! 💥",
    "⚡ ULTIMATE CHALLENGE : Explose tes limites et redefinis l'impossible ! 🚀",
    "🏆 MYTHICAL QUEST : Deviens la légende que tu es destiné à être ! 👑",
    "🌟 GODMODE ACTIVATED : Transcende tes limites mortelles ! 🔥"
  ]
}

interface IronBuddyFABProps {
  defaultOpen?: boolean
}

export function IronBuddyFAB({ defaultOpen = false }: IronBuddyFABProps) {
  // États principaux
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [shouldShow, setShouldShow] = useState(true)
  const [selectedMascot, setSelectedMascot] = useState<MascotKey>('ironbuddy')
  const [currentMessage, setCurrentMessage] = useState(defaultMessages[0])
  const [showMascotMode, setShowMascotMode] = useState(false) // Mode mascotte vs support
  const [punchlineLevel, setPunchlineLevel] = useState<'discret' | 'normal' | 'ambianceur'>('normal')
  
  // Refs et hooks
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Système simple qui fonctionne réellement

  // Configuration mascotte actuelle
  const mascot = mascotConfig[selectedMascot]
  const MascotIcon = mascot.icon

  // Options du menu support (inchangées)
  const supportOptions = [
    {
      title: 'Signaler un bug',
      description: 'Un problème technique',
      href: '/support/contact?category=bug',
      icon: Bug,
      color: 'text-red-600 bg-red-100'
    },
    {
      title: 'Demander de l\'aide',
      description: 'Besoin d\'assistance',
      href: '/support/contact?category=help',
      icon: HelpCircle,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Suggérer une amélioration',
      description: 'Idée de fonctionnalité',
      href: '/support/contact?category=feature',
      icon: Lightbulb,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ]

  // Gestion de la visibilité selon la page
  useEffect(() => {
    const hiddenPaths = [
      '/auth', 
      '/onboarding',
      '/support/contact', // Pas besoin sur la page de contact
      '/admin' // Simplifié pour l'admin
    ]
    
    const shouldHide = hiddenPaths.some(path => pathname.startsWith(path)) || 
                      pathname.includes('/edit') || 
                      pathname.includes('/new')
    
    setShouldShow(!shouldHide)
    setIsOpen(false) // Fermer à chaque changement de page
  }, [pathname])

  // Rotation des messages avec délai plus long après clic
  useEffect(() => {
    if (showMascotMode) {
      // Délai plus long pour laisser le temps de lire
      intervalRef.current = setInterval(() => {
        const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
        setCurrentMessage(randomMessage)
      }, 15000) // Augmenté de 8s à 15s
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showMascotMode])

  // Charger préférences depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMascot = localStorage.getItem('selectedMascot') as MascotKey
      if (savedMascot && mascotConfig[savedMascot]) {
        setSelectedMascot(savedMascot)
      }
      
      const savedLevel = localStorage.getItem('ironBuddyLevel') as 'discret' | 'normal' | 'ambianceur'
      if (savedLevel && ['discret', 'normal', 'ambianceur'].includes(savedLevel)) {
        setPunchlineLevel(savedLevel)
      }
    }
  }, [])

  if (!shouldShow) return null

  const handleMascotChange = (newMascot: MascotKey) => {
    setSelectedMascot(newMascot)
    localStorage.setItem('selectedMascot', newMascot)
  }

  // Simple, functional mascot interactions

  return (
    <>
      {/* FAB Principal - Position optimisée pour éviter les conflits */}
      <motion.div
        className="fixed bottom-6 right-6 z-[80] md:bottom-8 md:right-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 1.5 // Apparition après le chargement
        }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            ${mascot.bgColor} ${mascot.hoverColor} 
            text-white p-4 rounded-full shadow-2xl 
            transform transition-all duration-300 
            focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50
            border-2 border-white/20
          `}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: isOpen 
              ? ["0 0 0 0 rgba(249, 115, 22, 0.4)", "0 0 0 20px rgba(249, 115, 22, 0)"]
              : "0 10px 30px rgba(0,0,0,0.3)"
          }}
          transition={{ 
            boxShadow: { duration: 1.5, repeat: isOpen ? Infinity : 0 }
          }}
          aria-label={`${mascot.name} - Assistant IronTrack`}
          title={`Salut ! Je suis ${mascot.name}, ton assistant IronTrack ${mascot.emoji}`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <X className="h-7 w-7" />
              </motion.div>
            ) : (
              <motion.div
                key="mascot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <MascotIcon className="h-7 w-7" />
                {/* Indicator de nouveau message */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Menu Contextuel Étendu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay subtil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 z-[75] backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-[80] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden min-w-[320px] max-w-[calc(100vw-3rem)] md:bottom-28 md:right-8"
            >
              {/* En-tête avec mascotte */}
              <div className={`${mascot.bgColor} px-6 py-4 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                <div className="flex items-center space-x-3 relative z-10">
                  <motion.div
                    animate={{ 
                      rotate: [0, -5, 5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="bg-white/20 rounded-full p-2"
                  >
                    <MascotIcon className="h-8 w-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      Salut ! Je suis {mascot.name} {mascot.emoji}
                    </h3>
                    <motion.p 
                      key={currentMessage}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-sm text-white/90 font-medium leading-relaxed"
                    >
                      {currentMessage}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Sélecteur de mode */}
              <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-200/50">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowMascotMode(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      !showMascotMode 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Support
                  </button>
                  <button
                    onClick={() => setShowMascotMode(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      showMascotMode 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="h-4 w-4 inline mr-2" />
                    Coach
                  </button>
                </div>
              </div>

              {/* Contenu dynamique */}
              <div className="px-6 py-4">
                <AnimatePresence mode="wait">
                  {showMascotMode ? (
                    // Mode IA Coach - Système Intelligent
                    <motion.div
                      key="mascot-mode"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Statut Coach avec indicateur de nouveau message */}
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-2">
                          <motion.div 
                            className="w-2 h-2 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="text-xs font-medium text-green-700">
                            Coach {mascot.name} à votre service ! 
                          </span>
                          <motion.span
                            key={currentMessage}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full"
                          >
                            Nouveau !
                          </motion.span>
                        </div>
                      </div>

                      {/* Boutons FONCTIONNELS avec debug */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            console.log('Bouton Blague cliqué - Niveau:', punchlineLevel);
                            const jokes = jokesLibrary[punchlineLevel];
                            const joke = jokes[Math.floor(Math.random() * jokes.length)];
                            setCurrentMessage(joke);
                            // Réinitialiser le timer pour donner plus de temps de lecture
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = setInterval(() => {
                                const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
                                setCurrentMessage(randomMessage);
                              }, 20000); // 20s après un clic manuel
                            }
                            console.log('Nouveau message:', joke);
                          }}
                          className="flex items-center space-x-2 p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
                        >
                          <Smile className="h-4 w-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-yellow-800">Blague</span>
                        </button>
                        <button
                          onClick={() => {
                            console.log('Bouton Conseil cliqué - Niveau:', punchlineLevel);
                            const advice = adviceLibrary[punchlineLevel];
                            const selectedAdvice = advice[Math.floor(Math.random() * advice.length)];
                            setCurrentMessage(selectedAdvice);
                            // Réinitialiser le timer pour donner plus de temps de lecture
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = setInterval(() => {
                                const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
                                setCurrentMessage(randomMessage);
                              }, 20000); // 20s après un clic manuel
                            }
                            console.log('Nouveau message:', selectedAdvice);
                          }}
                          className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                        >
                          <Sparkles className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-blue-800">Conseil</span>
                        </button>
                        <button
                          onClick={() => {
                            console.log('Bouton Motivation cliqué - Niveau:', punchlineLevel);
                            const motivations = motivationLibrary[punchlineLevel];
                            const motivation = motivations[Math.floor(Math.random() * motivations.length)];
                            setCurrentMessage(motivation);
                            // Réinitialiser le timer pour donner plus de temps de lecture
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = setInterval(() => {
                                const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
                                setCurrentMessage(randomMessage);
                              }, 20000); // 20s après un clic manuel
                            }
                            console.log('Nouveau message:', motivation);
                          }}
                          className="flex items-center space-x-2 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                        >
                          <Zap className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-red-800">Motivation</span>
                        </button>
                        <button
                          onClick={() => {
                            console.log('Bouton Défi cliqué - Niveau:', punchlineLevel);
                            const challenges = challengeLibrary[punchlineLevel];
                            const challenge = challenges[Math.floor(Math.random() * challenges.length)];
                            setCurrentMessage(challenge);
                            // Réinitialiser le timer pour donner plus de temps de lecture
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = setInterval(() => {
                                const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
                                setCurrentMessage(randomMessage);
                              }, 20000); // 20s après un clic manuel
                            }
                            console.log('Nouveau message:', challenge);
                          }}
                          className="flex items-center space-x-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                        >
                          <Trophy className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium text-purple-800">Défi</span>
                        </button>
                      </div>

                      {/* Changement de mascotte */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Changer de coach :</p>
                        <div className="flex space-x-2">
                          {(Object.keys(mascotConfig) as MascotKey[]).map((key) => {
                            const config = mascotConfig[key]
                            const Icon = config.icon
                            return (
                              <button
                                key={key}
                                onClick={() => handleMascotChange(key)}
                                className={`p-2 rounded-lg transition-all ${
                                  selectedMascot === key
                                    ? `${config.bgColor} text-white shadow-md scale-110`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={config.name}
                              >
                                <Icon className="h-4 w-4" />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // Mode Support
                    <motion.div
                      key="support-mode"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-2"
                    >
                      {supportOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <Link
                            key={option.title}
                            href={option.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div className={`p-2 rounded-lg ${option.color} group-hover:scale-110 transition-transform`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">
                                {option.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {option.description}
                              </p>
                            </div>
                          </Link>
                        )
                      })}

                      {/* Lien FAQ */}
                      <div className="border-t border-gray-100 pt-2 mt-3">
                        <Link
                          href="/faq"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          📚 Consulter la FAQ
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-green-50/80 border-t border-gray-200/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs text-green-700 font-medium">
                    {showMascotMode ? "Toujours là pour toi ! 💪" : "Réponse sous 24h en moyenne"}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Export par défaut pour compatibilité
export default IronBuddyFAB