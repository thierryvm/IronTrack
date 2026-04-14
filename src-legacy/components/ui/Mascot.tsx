'use client'

import { useState, useEffect, useRef} from'react'
import { motion, AnimatePresence} from'framer-motion'
import { Dumbbell, Trophy, Flame, Target, Zap, Cat, Bot, Star, X} from'lucide-react'
import { usePathname} from'next/navigation'
import ClientOnly from'./ClientOnly';

interface MascotProps {
 message?: string
 type?:'motivation' |'success' |'warning' |'info'
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

type MascotKey ='ironbuddy' |'cat' |'bot' |'star';
const mascotIcons: Record<MascotKey, typeof Dumbbell> = {
 ironbuddy: Dumbbell,
 cat: Cat,
 bot: Bot,
 star: Star
};
const mascotNames: Record<MascotKey, string> = {
 ironbuddy:'IronBuddy',
 cat:'Félix',
 bot:'RoboCoach',
 star:'SuperStar'
};
const mascotBg: Record<MascotKey, string> = {
 ironbuddy:'bg-yellow-300',
 cat:'bg-pink-200',
 bot:'bg-tertiary/20',
 star:'bg-purple-200'
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

export const advices = [
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
"Fais confiance à IronBuddy, il a toujours une astuce en réserve !",
 // Nouveaux conseils
"Le petit-déjeuner est le repas le plus important pour bien démarrer la journée !",
"Prends le temps de savourer tes repas, ça aide la digestion et le moral.",
"Prépare tes repas à l'avance pour éviter les craquages.",
"Ne saute pas de repas, ton corps a besoin d'énergie pour progresser.",
"Ajoute des légumes à chaque repas pour faire le plein de vitamines.",
"Un souper léger favorise un bon sommeil.",
"Boire de l'eau régulièrement booste ta performance et ta récupération.",
"Manger en pleine conscience aide à mieux écouter tes sensations de faim.",
"Fais-toi plaisir de temps en temps, la frustration n'est pas un bon coach !",
"Un fruit en collation, c'est le combo énergie + vitamines !",
"Planifie tes repas comme tes entraînements pour rester sur la bonne voie."
];

export default function Mascot({ message, type ='motivation', show = false, onClose}: MascotProps) {
 // TOUS les hooks en haut, dans le même ordre à chaque rendu
 const [isMounted, setIsMounted] = useState(false);
 const [currentMessage, setCurrentMessage] = useState(message || messages.motivation[0])
 const [isVisible, setIsVisible] = useState(show)
 const Icon = icons[type]
 const [hideMascot, setHideMascot] = useState(false)
 const [extraMsg, setExtraMsg] = useState<string | null>(null)
 const [animKey, setAnimKey] = useState(0)
 const mascotRef = useRef<HTMLDivElement>(null)
 const [selectedMascot, setSelectedMascot] = useState<string>(() => (typeof window !=='undefined' && localStorage.getItem('mascot') ? localStorage.getItem('mascot')! :'ironbuddy'));
 const lastJokes = useRef<string[]>([]);
 const lastAdvices = useRef<string[]>([]);

 useEffect(() => { setIsMounted(true);}, []);
 useEffect(() => { setIsVisible(show)}, [show])
 useEffect(() => {
 if (!message) {
 const interval = setInterval(() => {
 const messageList = messages[type]
 const randomIndex = Math.floor(Math.random() * messageList.length)
 setCurrentMessage(messageList[randomIndex])
}, 10000)
 return () => clearInterval(interval)
}
}, [message, type])
 useEffect(() => {
 const hide = localStorage.getItem('hideMascot')
 setHideMascot(hide ==='1')
}, [])
 useEffect(() => {
 if (typeof window !=='undefined') {
 setSelectedMascot(localStorage.getItem('mascot') ||'ironbuddy');
}
}, [show]);

 // SEULEMENT APRÈS tous les hooks :
 if (!isMounted) return null;

 const handleClose = () => {
 setIsVisible(false)
 onClose?.()
}

 const handleNeverShow = () => {
 localStorage.setItem('hideMascot','1')
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

 let contextAnim: Record<string, unknown> = {}
 if (type ==='success') {
 contextAnim = { boxShadow: [
'0 0 0px #fff',
'0 0 20px #ffe066',
'0 0 40px #ffe066',
'0 0 0px #fff'
 ], scale: [1, 1.1, 1], rotate: [0, 10, -10, 0]}
} else if (type ==='warning') {
 contextAnim = { x: [0, -10, 10, -10, 10, 0]}
} else if (type ==='motivation') {
 contextAnim = { y: [0, -10, 0, -5, 0]}
}

 const getMascotKey = (key: string): MascotKey => {
 if (['ironbuddy','cat','bot','star'].includes(key)) return key as MascotKey;
 return'ironbuddy';
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
 initial={{ opacity: 0, scale: 0.8, y: 50}}
 animate={{ opacity: 1, scale: 1, y: 0, ...contextAnim}}
 exit={{ opacity: 0, scale: 0.8, y: 50}}
 className="fixed bottom-4 right-4 z-50 max-w-sm w-full sm:max-w-sm sm:bottom-4 sm:right-4 max-sm:left-1/2 max-sm:bottom-2 max-sm:right-auto max-sm:-translate-x-1/2 max-sm:w-[95vw]"
 ref={mascotRef}
 >
 <motion.div
 whileHover={{ scale: 1.05}}
 whileTap={{ scale: 0.95}}
 className="bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-2xl shadow-2xl p-4 max-w-sm max-sm:p-2 max-sm:text-sm max-sm:rounded-xl"
 >
 {/* Mascotte */}
 <div className="flex items-center space-x-2 mb-2 max-sm:space-x-xs">
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
 className={`${mascotBgColor} rounded-full p-2 max-sm:p-1`}
 >
 <MascotIcon className="h-6 w-6 text-orange-800 max-sm:h-5 max-sm:w-5" />
 </motion.div>
 <div>
 <h3 className="font-bold text-lg max-sm:text-base">{mascotName}</h3>
 <p className="text-xs text-white/90 max-sm:text-[10px]">Ton coach personnel</p>
 </div>
 <Icon className="h-5 w-5 text-yellow-300 max-sm:h-4 max-sm:w-4" />
 </div>

 {/* Message */}
 <motion.p
 key={currentMessage + (extraMsg ||'')}
 initial={{ opacity: 0, x: 20}}
 animate={{ opacity: 1, x: 0}}
 exit={{ opacity: 0, x: -20}}
 className="text-sm mb-2 max-sm:text-xs max-sm:mb-2"
 >
 {extraMsg ? extraMsg : currentMessage}
 </motion.p>

 {/* Boutons interactifs */}
 <div className="flex gap-2 mb-2 max-sm:gap-1">
 <button onClick={handleJoke} className="bg-card border border-border text-orange-800 px-2 py-2 rounded hover:bg-orange-100 text-xs font-bold max-sm:px-2 max-sm:py-1 max-sm:text-[11px]">Blague</button>
 <button onClick={handleAdvice} className="bg-card border border-border text-orange-800 px-2 py-2 rounded hover:bg-orange-100 text-xs font-bold max-sm:px-2 max-sm:py-1 max-sm:text-[11px]">Conseil</button>
 </div>

 {/* Boutons fermer/masquer */}
 <div className="flex gap-2">
 <button
 onClick={handleClose}
 className="text-white/90 hover:text-white text-xs transition-colors"
 >
 Fermer
 </button>
 <button
 onClick={handleNeverShow}
 className="text-white/80 hover:text-white text-xs ml-4 underline"
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
 const [minimized, setMinimized] = useState(false)
 const [joke, setJoke] = useState<string | null>(null)
 const [shouldShow, setShouldShow] = useState(true)
 const pathname = usePathname();
 
 useEffect(() => {
 const hide = localStorage.getItem('hideMascot')
 setMinimized(hide ==='1')
 // Affiche une blague à chaque navigation
 const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
 setJoke(randomJoke)
 
 // Masquer sur certaines pages pour éviter conflit avec boutons validation
 const hiddenPaths = [
'/auth', 
'/onboarding',
'/admin', // Pas besoin dans l'admin
'/exercises/new', // Éviter conflit avec boutons validation
'/workouts/new' // Éviter conflit avec boutons validation
 ]
 
 const shouldHide = hiddenPaths.some(path => 
 pathname.startsWith(path)
 ) || pathname.includes('/edit') // Masquer sur toutes les pages d'édition
 
 setShouldShow(!shouldHide)
}, [pathname])

 const handleMinimize = () => {
 localStorage.setItem('hideMascot','1')
 setMinimized(true)
}
 const handleRestore = () => {
 localStorage.removeItem('hideMascot')
 setMinimized(false)
}

 // Ne pas afficher si shouldShow est false
 if (!shouldShow) return null

 return (
 <ClientOnly>
 {minimized ? (
 <div className="fixed bottom-20 right-4 z-[60] cursor-pointer md:bottom-4" onClick={handleRestore} title="Afficher la mascotte">
 <div className="bg-card border border-border rounded-full shadow-2xl p-2 flex items-center justify-center border-2 border-orange-400 hover:scale-110 transition-transform">
 <Dumbbell className="h-6 w-6 text-orange-800" />
 </div>
 </div>
 ) : (
 <motion.div 
 className="fixed bottom-20 right-4 z-[60] md:bottom-4"
 animate={{ 
 x: 0, 
 y: 0,
 transition: { type:"spring", damping: 15, stiffness: 200}
}}
 >
 <div className="relative">
 <button
 onClick={handleMinimize}
 className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow hover:bg-primary-hover transition-all"
 aria-label="Réduire la mascotte"
 style={{ zIndex: 70}}
 >
 <X className="h-6 w-6" />
 </button>
 <Mascot show={true} message={joke || undefined} type="success" onClose={handleMinimize} />
 </div>
 </motion.div>
 )}
 </ClientOnly>
 );
} 