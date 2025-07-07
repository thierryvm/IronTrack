'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Trophy, Flame, Target, Zap, Cat, Bot, Star } from 'lucide-react'

interface MascotProps {
  message?: string
  type?: 'motivation' | 'success' | 'warning' | 'info'
  show?: boolean
  onClose?: () => void
}

const messages = {
  motivation: [
    "Allez Thierry, tu vas y arriver ! 💪",
    "Un exercice de plus, un pas vers tes objectifs ! 🎯",
    "Tu es plus fort que tes excuses ! 🔥",
    "Chaque répétition compte ! ⚡",
    "Reste focus, tu es sur la bonne voie ! 🎯"
  ],
  success: [
    "Excellent travail ! Tu progresses ! 🏆",
    "Nouveau record personnel ! 🎉",
    "Séance terminée avec succès ! 💪",
    "Tu es en feu aujourd'hui ! 🔥",
    "Continue comme ça ! ⚡"
  ],
  warning: [
    "N'oublie pas de bien t'hydrater ! 💧",
    "Écoute ton corps, prends ton temps ! 🫂",
    "La technique avant la charge ! 🎯",
    "Pense à tes temps de repos ! ⏰"
  ],
  info: [
    "Nouveau défi disponible ! 🎯",
    "Tu as débloqué un nouveau badge ! 🏅",
    "Ton ami a battu son record ! 👥",
    "Nouveau tutoriel disponible ! 📹"
  ]
}

type MascotKey = 'ironbuddy' | 'cat' | 'bot' | 'star';
const mascotIcons: Record<MascotKey, typeof Dumbbell> = {
  ironbuddy: Dumbbell,
  cat: Cat,
  bot: Bot,
  star: Star
};
const mascotNames: Record<MascotKey, string> = {
  ironbuddy: 'IronBuddy',
  cat: 'Félix',
  bot: 'RoboCoach',
  star: 'SuperStar'
};
const mascotBg: Record<MascotKey, string> = {
  ironbuddy: 'bg-yellow-300',
  cat: 'bg-pink-200',
  bot: 'bg-blue-200',
  star: 'bg-purple-200'
};

const icons = {
  motivation: Flame,
  success: Trophy,
  warning: Target,
  info: Zap
}

const jokes = [
  "Pourquoi les haltères ne racontent jamais de secrets ? Parce qu'ils sont trop lourds à porter !",
  "Pourquoi le coach ne va jamais à la plage ? Parce qu'il a peur des abdos de sable !",
  "Quel est le sport préféré des informaticiens ? Le curl !",
  "Pourquoi les sportifs aiment le code ? Parce qu'ils font toujours des boucles !",
  "Pourquoi Thierry ne rate jamais une séance ? Parce qu'IronBuddy veille au grain !",
  "Pourquoi les sportifs n'aiment pas les ascenseurs ? Parce qu'ils préfèrent prendre de la hauteur !",
  "Quel est le comble pour un coach ? De manquer de motivation !",
  "Pourquoi les haltères sont de mauvais menteurs ? Parce qu'ils sont trop francs !",
  "Pourquoi la salle de sport est toujours propre ? Parce qu'on y fait le ménage... musculaire !",
  "Pourquoi les sportifs aiment les maths ? Parce qu'ils adorent compter les répétitions !",
  "Pourquoi le tapis de course n'est jamais fatigué ? Parce qu'il ne s'arrête jamais !",
  "Pourquoi les sportifs aiment le code ? Parce qu'ils font toujours des push-ups !",
  "Pourquoi la protéine n'est jamais en retard ? Parce qu'elle shake tout le temps !",
  "Pourquoi le coach ne fait jamais de pause ? Parce qu'il est toujours sur la brèche !",
  "Pourquoi Thierry ne craint pas la pluie ? Parce qu'il s'entraîne même sous les gouttes !"
];

const advices = [
  "Pense à bien t'hydrater avant, pendant et après l'effort !",
  "Un bon échauffement, c'est la clé pour éviter les blessures.",
  "La récupération fait partie de l'entraînement, ne la néglige pas !",
  "Varie tes exercices pour progresser et ne jamais t'ennuyer.",
  "Mange équilibré, dors bien, et IronBuddy sera fier de toi !",
  "Fixe-toi des objectifs réalistes et progresse à ton rythme.",
  "N'oublie pas de t'étirer après chaque séance.",
  "Écoute ton corps : la douleur n'est pas un signe de progrès !",
  "Un carnet d'entraînement t'aide à suivre tes progrès.",
  "Le mental, c'est 50% de la réussite !",
  "Fais-toi plaisir, le sport doit rester fun !",
  "N'hésite pas à demander conseil à un pro pour progresser.",
  "Un bon sommeil, c'est la base pour récupérer.",
  "Change de routine régulièrement pour éviter la stagnation.",
  "Fais confiance à IronBuddy, il a toujours une astuce en réserve !"
];

export default function Mascot({ message, type = 'motivation', show = false, onClose }: MascotProps) {
  const [currentMessage, setCurrentMessage] = useState(message || messages.motivation[0])
  const [isVisible, setIsVisible] = useState(show)
  const Icon = icons[type]
  const [hideMascot, setHideMascot] = useState(false)
  const [extraMsg, setExtraMsg] = useState<string | null>(null)
  const [animKey, setAnimKey] = useState(0)
  const mascotRef = useRef<HTMLDivElement>(null)
  const [selectedMascot, setSelectedMascot] = useState<string>(() => (typeof window !== 'undefined' && localStorage.getItem('mascot') ? localStorage.getItem('mascot')! : 'ironbuddy'));
  const lastJokes = useRef<string[]>([]);
  const lastAdvices = useRef<string[]>([]);

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        const messageList = messages[type]
        const randomIndex = Math.floor(Math.random() * messageList.length)
        setCurrentMessage(messageList[randomIndex])
      }, 10000) // Change de message toutes les 10 secondes

      return () => clearInterval(interval)
    }
  }, [message, type])

  useEffect(() => {
    const hide = localStorage.getItem('hideMascot')
    setHideMascot(hide === '1')
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedMascot(localStorage.getItem('mascot') || 'ironbuddy');
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleNeverShow = () => {
    localStorage.setItem('hideMascot', '1')
    setHideMascot(true)
    setIsVisible(false)
    onClose?.()
  }

  const handleJoke = () => {
    let available = jokes.filter(j => !lastJokes.current.includes(j));
    if (available.length === 0) available = jokes;
    const random = available[Math.floor(Math.random() * available.length)];
    setExtraMsg(random);
    setAnimKey(animKey + 1);
    lastJokes.current = [random, ...lastJokes.current].slice(0, 3);
  }

  const handleAdvice = () => {
    let available = advices.filter(a => !lastAdvices.current.includes(a));
    if (available.length === 0) available = advices;
    const random = available[Math.floor(Math.random() * available.length)];
    setExtraMsg(random);
    setAnimKey(animKey + 1);
    lastAdvices.current = [random, ...lastAdvices.current].slice(0, 3);
  }

  let contextAnim = {}
  if (type === 'success') {
    contextAnim = { boxShadow: [
      '0 0 0px #fff',
      '0 0 20px #ffe066',
      '0 0 40px #ffe066',
      '0 0 0px #fff'
    ], scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }
  } else if (type === 'warning') {
    contextAnim = { x: [0, -10, 10, -10, 10, 0] }
  } else if (type === 'motivation') {
    contextAnim = { y: [0, -10, 0, -5, 0] }
  }

  const getMascotKey = (key: string): MascotKey => {
    if (['ironbuddy', 'cat', 'bot', 'star'].includes(key)) return key as MascotKey;
    return 'ironbuddy';
  };
  const mascotKey = getMascotKey(selectedMascot);
  const MascotIcon = mascotIcons[mascotKey];
  const mascotName = mascotNames[mascotKey];
  const mascotBgColor = mascotBg[mascotKey];

  return (
    <AnimatePresence>
      {!hideMascot && isVisible && (
        <motion.div
          key={animKey}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0, ...contextAnim }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
          ref={mascotRef}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm"
          >
            {/* Mascotte */}
            <div className="flex items-center space-x-3 mb-3">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className={`${mascotBgColor} rounded-full p-2`}
              >
                <MascotIcon className="h-6 w-6 text-orange-600" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">{mascotName}</h3>
                <p className="text-xs text-orange-100">Ton coach personnel</p>
              </div>
              <Icon className="h-5 w-5 text-yellow-300" />
            </div>

            {/* Message */}
            <motion.p
              key={currentMessage + (extraMsg || '')}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-sm mb-3"
            >
              {extraMsg ? extraMsg : currentMessage}
            </motion.p>

            {/* Boutons interactifs */}
            <div className="flex gap-2 mb-2">
              <button onClick={handleJoke} className="bg-white text-orange-600 px-2 py-1 rounded hover:bg-orange-100 text-xs font-bold">Blague</button>
              <button onClick={handleAdvice} className="bg-white text-orange-600 px-2 py-1 rounded hover:bg-orange-100 text-xs font-bold">Conseil</button>
            </div>

            {/* Boutons fermer/masquer */}
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="text-orange-100 hover:text-white text-xs transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleNeverShow}
                className="text-orange-200 hover:text-white text-xs ml-4 underline"
              >
                Ne plus afficher
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant pour afficher la mascotte dans les pages
export function MascotWidget() {
  const [showMascot, setShowMascot] = useState(false)

  useEffect(() => {
    // Afficher la mascotte après 3 secondes
    const timer = setTimeout(() => {
      setShowMascot(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Mascot 
      show={showMascot}
      onClose={() => setShowMascot(false)}
    />
  )
}

// Composant global pour afficher la mascotte partout
export function MascotGlobal() {
  const [showMascot, setShowMascot] = useState(false)
  useEffect(() => {
    const hide = localStorage.getItem('hideMascot')
    if (hide === '1') return
    setShowMascot(true)
  }, [])
  return <Mascot show={showMascot} onClose={() => setShowMascot(false)} />
} 