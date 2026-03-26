'use client'

import { useState, useEffect, useCallback} from'react'
import Link from'next/link'
import dynamic from'next/dynamic'

// Import sélectif des icônes critiques uniquement
import { 
 Dumbbell, 
 Calendar, 
 Trophy,
 Flame,
 Target,
 Play,
 Pause,
 RotateCcw,
 Volume2,
 VolumeX,
 Plus,
 Apple,
 TrendingUp
} from'lucide-react'

import { createClient} from'@/utils/supabase/client'
import { useHomepageData} from'@/hooks/useHomepageData'
import { useOnboardingCheck} from'@/hooks/useOnboardingCheck'
import { useUserProfile} from'@/hooks/useUserProfile'
import { useBadges} from'@/hooks/useBadges'
import UserGreeting from'@/components/UserGreeting'
import { Button} from'@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent} from'@/components/ui/card'

// Lazy load des composants lourds
const SessionTimerModal = dynamic(() => import('@/components/ui/SessionTimerModal'), {
 ssr: false
})

// Composant QuickTimer restauré sans Framer Motion
function TimerRestored({ 
 initialTime = 60, 
 onComplete, 
 autoStart = false,
 showControls = true 
}: {
 initialTime?: number
 onComplete?: () => void
 autoStart?: boolean
 showControls?: boolean
}) {
 const [timeLeft, setTimeLeft] = useState(initialTime)
 const [isRunning, setIsRunning] = useState(autoStart)
 const [isMuted, setIsMuted] = useState(false)
 const [showNotification, setShowNotification] = useState(false)

 useEffect(() => {
 let intervalId: NodeJS.Timeout | null = null

 if (isRunning && timeLeft > 0) {
 intervalId = setInterval(() => {
 setTimeLeft((prev) => {
 if (prev <= 1) {
 setIsRunning(false)
 setShowNotification(true)
 if (onComplete) setTimeout(onComplete, 0)
 return 0
}
 return prev - 1
})
}, 1000)
}

 return () => {
 if (intervalId) clearInterval(intervalId)
}
}, [isRunning, timeLeft, onComplete])

 const startTimer = () => setIsRunning(true)
 const pauseTimer = () => setIsRunning(false)
 const resetTimer = () => {
 setIsRunning(false)
 setTimeLeft(initialTime)
 setShowNotification(false)
}

 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60)
 const secs = seconds % 60
 return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
}

 const progress = ((initialTime - timeLeft) / initialTime) * 100

 return (
 <div className="relative">
 <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-2xl p-6 text-white shadow-lg">
 <div className="absolute top-0 left-0 right-0 h-2 bg-orange-700/30 rounded-t-2xl overflow-hidden">
 <div
 className="h-full bg-yellow-300 transition-all duration-1000 ease-in-out"
 style={{ width: `${progress}%`}}
 />
 </div>

 <div className="text-center mb-4">
 <div className="text-4xl font-bold transition-all duration-300">
 {formatTime(timeLeft)}
 </div>
 <p className="text-white/90 text-sm">Temps de repos</p>
 </div>

 {showControls && (
 <div className="flex justify-center space-x-4">
 {!isRunning ? (
 <button
 onClick={startTimer}
 className="bg-success hover:bg-success-hover p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] hover:scale-105"
 disabled={timeLeft === 0}
 >
 <Play className="h-5 w-5" />
 </button>
 ) : (
 <button
 onClick={pauseTimer}
 className="bg-warning hover:bg-warning-hover p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] hover:scale-105"
 >
 <Pause className="h-5 w-5" />
 </button>
 )}

 <button
 onClick={resetTimer}
 className="bg-muted hover:bg-muted/80 p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] hover:scale-105 transition-transform"
 >
 <RotateCcw className="h-5 w-5" />
 </button>

 <button
 onClick={() => setIsMuted(!isMuted)}
 className={`p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] hover:scale-105 transition-transform ${
 isMuted
 ?'bg-destructive hover:bg-destructive-hover'
 :'bg-secondary hover:bg-secondary/80'
}`}
 >
 {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
 </button>
 </div>
 )}
 </div>

 {showNotification && (
 <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
 <div className="flex items-center space-x-2">
 <div className="w-2 h-2 bg-card rounded-full animate-pulse" />
 <span className="font-semibold">Temps écoulé !</span>
 </div>
 </div>
 )}
 </div>
 )
}

function QuickTimerRestored() {
 const [selectedTime, setSelectedTime] = useState(60)
 const [showTimer, setShowTimer] = useState(false)

 const quickTimes = [30, 60, 90, 120, 180]

 const handleTimeSelect = (time: number) => {
 setSelectedTime(time)
 setShowTimer(true)
}

 const handleCloseTimer = () => {
 setShowTimer(false)
}

 if (showTimer) {
 return (
 <div className="space-y-4 w-full">
 <TimerRestored 
 initialTime={selectedTime} 
 onComplete={handleCloseTimer}
 autoStart={true}
 />
 <button
 onClick={handleCloseTimer}
 className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 px-4 rounded-lg transition-colors min-h-touch-44"
 >
 Fermer
 </button>
 </div>
 )
}

 return (
 <div className="bg-card border border-border rounded-xl p-6 shadow-md w-full">
 <h2 className="text-xl font-bold text-foreground mb-4 text-center">Temps de repos rapide</h2>
 <div className="grid grid-cols-3 gap-2">
 {quickTimes.map((time) => (
 <button
 key={time}
 onClick={() => handleTimeSelect(time)}
 className="bg-primary hover:bg-primary-hover text-primary-foreground py-2 px-0 rounded-lg transition-colors text-sm font-bold w-full min-h-touch-44"
 style={{minWidth: 0}}
 >
 {time}s
 </button>
 ))}
 </div>
 </div>
 )
}

interface UserSound {
 id: string;
 name: string;
 file_url: string;
 created_at: string;
}

const SESSION_SOUNDS_KEY ='irontrack-session-sounds';

interface ExerciseItem {
 id: number;
 name: string;
 muscle_group?: string;
 exercise_type?: string;
 weight?: number;
 displayValue?: string;
 displayLabel?: string;
}

interface DatabaseExercise {
 id: number;
 name: string;
 exercise_type: string | null;
 created_at?: string;
 muscle_group?: string;
 equipment?: string;
}

export default function HomePageClient() {
 // Hooks restaurés avec fonctionnalités complètes
 const { isLoading: profileLoading} = useUserProfile()
 const { userBadges, newBadgeEarned} = useBadges()
 useOnboardingCheck()
 
 const [stats, setStats] = useState({
 totalWorkouts: 0,
 thisWeek: 0,
 currentStreak: 0,
 totalWeight: 0
})
 const [recentExercises, setRecentExercises] = useState<ExerciseItem[]>([])
 const [loading, setLoading] = useState(true)
 const [showSessionTimer, setShowSessionTimer] = useState(false)
 const [showTooltip, setShowTooltip] = useState(false)
 const [sessionSteps, setSessionSteps] = useState([
 { name:'Échauffement', duration: 300}, // 5 minutes
 { name:'Exercice principal', duration: 1200}, // 20 minutes
 { name:'Récupération', duration: 300}, // 5 minutes
 ]);
 const [userSounds, setUserSounds] = useState<UserSound[]>([])
 const [sessionSounds, setSessionSounds] = useState<(string | null)[]>([null, null, null]);
 const [userId, setUserId] = useState<string | null>(null)
 const [allExercises, setAllExercises] = useState<ExerciseItem[]>([])

 // Fermer l'info-bulle quand on clique ailleurs
 useEffect(() => {
 const handleClickOutside = () => {
 setShowTooltip(false)
}

 if (showTooltip && typeof window !=='undefined') {
 document.addEventListener('click', handleClickOutside)
 return () => document.removeEventListener('click', handleClickOutside)
}
}, [showTooltip])

 const loadDashboardData = useCallback(async () => {
 try {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) {
 setRecentExercises([])
 setStats({ totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0})
 setLoading(false)
 return
}

 // LCP CRITICAL: Charger seulement les données essentielles d'abord
 const { data: workouts, error: workoutsError} = await supabase
 .from('workouts')
 .select('created_at, status')
 .eq('user_id', user.id)
 .in('status', ['Réalisé','Terminé','Completed'])
 .order('created_at', { ascending: false})
 .limit(20);
 
 if (workoutsError) {
 console.error('Erreur récupération workouts:', workoutsError);
 setRecentExercises([])
 setStats({ totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0})
 setLoading(false)
 return
}
 
 // Calculs stats optimisés (en mémoire pour LCP)
 const workoutsList = workouts || []
 const now = new Date()
 const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
 
 const totalWorkouts = workoutsList.length
 const thisWeek = workoutsList.filter(w => new Date(w.created_at) >= weekStart).length
 
 // Calcul série optimisé
 let currentStreak = 0
 const sortedWorkouts = workoutsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 
 for (let i = 0; i < sortedWorkouts.length; i++) {
 const workoutDate = new Date(sortedWorkouts[i].created_at)
 const expectedDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
 
 if (workoutDate.toDateString() === expectedDate.toDateString()) {
 currentStreak++
} else {
 break
}
}
 
 // Mettre à jour stats principales (sans totalWeight pour LCP)
 setStats({ totalWorkouts, thisWeek, currentStreak, totalWeight: 0})
 setLoading(false) // LCP CRITICAL: Libérer le loading dès que possible
 
 // Étape 2: Charger les données secondaires en différé (POST-LCP)
 setTimeout(async () => {
 const [
 { data: perfLogs, error: perfLogsError},
 { data: exercises, error: exercisesError},
 { data: allExercisesData, error: allExercisesError}
 ] = await Promise.all([
 // Requête 1: Performance logs pour calcul poids total
 supabase
 .from('performance_logs')
 .select('weight, reps, sets')
 .eq('user_id', user.id),
 
 // Requête 2: Exercices récents avec type (réduit pour POST-LCP)
 supabase
 .from('exercises')
 .select('id, name, muscle_group, exercise_type')
 .eq('user_id', user.id)
 .order('created_at', { ascending: false})
 .limit(3), // Réduit de 5 à 3 pour accélérer
 
 // Requête 3: Tous les exercices pour dropdown (optimisé)
 supabase
 .from('exercises')
 .select('id, name, muscle_group, exercise_type, created_at')
 .eq('user_id', user.id)
 .order('name', { ascending: true})
 ]);
 
 // Gestion des erreurs en batch
 if (perfLogsError || exercisesError) {
 console.error('Erreur récupération données secondaires:', { perfLogsError, exercisesError});
 return
}
 
 // PERFORMANCE: Calcul poids total optimisé
 const totalWeight = perfLogs?.reduce((sum, log) => {
 return sum + (log.weight || 0) * (log.reps || 0) * (log.sets || 1)
}, 0) || 0
 
 // Mettre à jour stats avec poids total
 setStats(prev => ({ ...prev, totalWeight}))
 
 // PERFORMANCE CRITICAL: Éviter N+1 queries pour exercices récents
 if (!exercisesError && exercises && exercises.length > 0) {
 const exerciseIds = exercises.map(ex => ex.id);
 const { data: allPerformances} = await supabase
 .from('performance_logs')
 .select('*')
 .in('exercise_id', exerciseIds)
 .order('performed_at', { ascending: false});
 
 // Traiter les exercices avec leurs performances
 const recentWithData = exercises.map((ex) => {
 const lastPerformance = allPerformances?.find(perf => perf.exercise_id === ex.id);
 
 let displayValue ='Aucune donnée'
 let displayLabel ='Dernière performance'
 const metrics: string[] = []
 
 if (lastPerformance) {
 const perf = lastPerformance
 
 if (ex.exercise_type ==='Musculation') {
 if (perf.weight && perf.weight > 0) {
 metrics.push(`${perf.weight} kg`)
 if (perf.reps) {
 metrics.push(`${perf.reps} reps`)
}
 if (perf.sets && perf.sets > 1) {
 metrics.push(`${perf.sets} sets`)
}
 displayValue = metrics.join(' •')
 displayLabel ='Dernière série'
} else {
 displayValue ='Poids du corps'
 if (perf.reps) {
 displayValue += ` • ${perf.reps} reps`
}
 displayLabel ='Dernière série'
}
} else {
 if (perf.duration) {
 const minutes = Math.floor(perf.duration / 60)
 const seconds = perf.duration % 60
 metrics.push(`${minutes}:${seconds.toString().padStart(2,'0')}`)
}
 if (perf.distance) {
 const unit = perf.distance_unit ||'km'
 let displayDistance = perf.distance
 
 // Conversion intelligente des unités
 if (unit ==='km' && perf.distance >= 1000) {
 // Si distance >= 1000 et unité km, probablement stocké en mètres
 displayDistance = perf.distance / 1000
 // Supprimer les décimales inutiles (10.0 → 10, mais garder 10.25)
 const formattedDistance = displayDistance % 1 === 0 ? displayDistance.toString() : displayDistance.toFixed(1)
 metrics.push(`${formattedDistance} km`)
} else if (unit ==='m' && perf.distance >= 1000) {
 // Si distance >= 1000m, afficher en km
 displayDistance = perf.distance / 1000
 const formattedDistance = displayDistance % 1 === 0 ? displayDistance.toString() : displayDistance.toFixed(1)
 metrics.push(`${formattedDistance} km`)
} else {
 metrics.push(`${displayDistance}${unit}`)
}
}
 displayValue = metrics.length > 0 ? metrics.slice(0, 2).join(' •') :'Aucune donnée'
 displayLabel ='Dernière session'
}
}
 
 return {
 id: ex.id,
 name: ex.name,
 muscle_group: ex.muscle_group ||'Général',
 exercise_type: ex.exercise_type,
 weight: lastPerformance?.weight || 0,
 displayValue,
 displayLabel
}
});
 setRecentExercises(recentWithData)
}
 
 if (!allExercisesError && allExercisesData) {
 const allEx = allExercisesData.map((ex: DatabaseExercise) => ({
 id: ex.id,
 name: ex.name,
 type: ex.exercise_type ||'Musculation',
 lastPerformed: ex.created_at,
 muscle_group: ex.muscle_group
}))
 setAllExercises(allEx)
}
}, 100)
 
} catch (error) {
 console.error('Erreur lors du chargement des données:', error)
 setRecentExercises([])
 setStats({ totalWorkouts: 0, thisWeek: 0, currentStreak: 0, totalWeight: 0})
 setLoading(false)
}
}, [])

 useEffect(() => {
 loadDashboardData()
 
 // Vérifier si l'utilisateur vient de terminer l'onboarding
 if (typeof window !=='undefined') {
 const urlParams = new URLSearchParams(window.location.search)
 if (urlParams.get('onboarding') ==='success') {
 setTimeout(() => {
 window.history.replaceState({},'','/')
}, 3000)
}
}
}, [loadDashboardData])

 useEffect(() => {
 const getUser = async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 setUserId(user?.id || null);
};
 getUser();
}, []);

 useEffect(() => {
 async function fetchSounds() {
 const supabase = createClient();
 if (!userId) return;
 const { data, error} = await supabase
 .from('user_sounds')
 .select('*')
 .eq('user_id', userId)
 .order('created_at', { ascending: false});
 if (!error && data) setUserSounds(data);
}
 if (userId) fetchSounds();
}, [userId, showSessionTimer]);

 // Hooks localStorage client-only
 useEffect(() => {
 if (typeof window !=='undefined') {
 localStorage.setItem(SESSION_SOUNDS_KEY, JSON.stringify(sessionSounds));
}
}, [sessionSounds]);

 useEffect(() => {
 setSessionSounds(sounds => {
 if (sessionSteps.length === sounds.length) return sounds;
 if (sessionSteps.length > sounds.length) {
 return [...sounds, ...Array(sessionSteps.length - sounds.length).fill(null)];
}
 return sounds.slice(0, sessionSteps.length);
});
}, [sessionSteps.length]);

 useEffect(() => {
 const fetchExercises = async () => {
 const supabase = createClient();
 const { data, error} = await supabase.from('exercises').select('id, name, muscle_group');
 if (!error && data) setAllExercises(data);
};
 fetchExercises();
}, []);

 // Persistance localStorage
 useEffect(() => {
 if (typeof window !=='undefined') {
 const saved = localStorage.getItem('irontrack-session-steps');
 if (saved) {
 try {
 setSessionSteps(JSON.parse(saved));
} catch {}
}
 
 const savedSounds = localStorage.getItem(SESSION_SOUNDS_KEY);
 if (savedSounds) {
 try {
 setSessionSounds(JSON.parse(savedSounds));
} catch {}
}
}
}, []);
 
 useEffect(() => {
 if (typeof window !=='undefined') {
 localStorage.setItem('irontrack-session-steps', JSON.stringify(sessionSteps));
}
}, [sessionSteps]);

 const quickActions = [
 {
 name:'Nouvel exercice',
 href:'/exercises/new',
 icon: Plus,
 color:'bg-green-500 hover:bg-green-600',
 description:'Ajouter un exercice'
},
 {
 name:'Nouvelle séance',
 href:'/workouts/new',
 icon: Dumbbell,
 color:'bg-primary hover:bg-primary-hover',
 description:'Commencer une séance'
},
 {
 name:'Suivi nutrition',
 href:'/nutrition',
 icon: Apple,
 color:'bg-secondary hover:bg-secondary',
 description:'Enregistrer un repas'
},
 {
 name:'Voir progression',
 href:'/progress',
 icon: TrendingUp,
 color:'bg-purple-500 hover:bg-purple-600',
 description:'Analyser tes progrès'
},
 {
 name:'Timer de session',
 href:'#',
 icon: Flame,
 color:'bg-primary hover:bg-primary-hover',
 description:'Lancer un timer multi-étapes',
 onClick: () => setShowSessionTimer(true),
},
 {
 name:'Mes exercices',
 href:'/exercises',
 icon: Trophy,
 color:'bg-gray-600 hover:bg-muted',
 description:'Voir tous les exercices'
},
 ]

 const statCards = [
 {
 title:'Séances réalisées',
 value: stats.totalWorkouts,
 icon: Trophy,
 color:'text-yellow-500',
 bgColor:'bg-yellow-100'
},
 {
 title:'Cette semaine',
 value: stats.thisWeek,
 icon: Calendar,
 color:'text-secondary',
 bgColor:'bg-blue-100'
},
 {
 title:'Série en cours',
 value: stats.currentStreak,
 icon: Flame,
 color:'text-red-500',
 bgColor:'bg-red-100'
},
 {
 title:'Poids total (kg)',
 value: stats.totalWeight,
 icon: Target,
 color:'text-green-500',
 bgColor:'bg-green-100'
}
 ]

 const refreshUserSounds = async () => {
 const supabase = createClient();
 if (!userId) return;
 const { data, error} = await supabase
 .from('user_sounds')
 .select('*')
 .eq('user_id', userId)
 .order('created_at', { ascending: false});
 if (!error && data) setUserSounds(data);
};

 function handleSoundDeleted() {
 console.log('🎵 Son supprimé de la playlist')
}

 if (loading || profileLoading) {
 return (
 <div className="min-h-screen bg-background">
 {/* Loading skeleton - identique au rendu final */}
 <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-12 min-h-[160px] flex items-center">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
 <div className="animate-pulse">
 <div className="h-8 w-2/3 bg-orange-400 rounded mb-2" />
 <div className="h-4 w-1/2 bg-orange-300 rounded" />
 </div>
 </div>
 </div>
 {/* Placeholder content area — prevents CLS when real content loads */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="animate-pulse space-y-6">
 <div className="rounded-2xl bg-muted h-40" />
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="rounded-xl bg-muted h-24" />
 <div className="rounded-xl bg-muted h-24" />
 <div className="rounded-xl bg-muted h-24" />
 </div>
 </div>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-background">
 {/* Hero Section */}
 <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-12 min-h-[160px] flex items-center">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
 <UserGreeting showError={true} />
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Séance du jour */}
 <div className="mb-8">
 <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-2xl p-8 text-white shadow-lg">
 <div className="flex flex-col lg:flex-row items-center justify-between">
 <div className="text-center lg:text-left mb-6 lg:mb-0">
 <h2 className="text-3xl font-bold mb-2">Prêt pour ta séance ?</h2>
 <p className="text-white/90 text-lg">
 {stats.thisWeek === 0 
 ?"Commence ta première séance de la semaine !" 
 : `Tu as déjà fait ${stats.thisWeek} séance${stats.thisWeek > 1 ?'s' :''} cette semaine 💪`
}
 </p>
 </div>
 <div className="flex flex-col sm:flex-row gap-4">
 <Button asChild variant="ghost" size="lg" className="bg-gray-900 text-white font-semibold hover:bg-muted transition-colors border border-border">
 <Link href="/workouts/new" prefetch={false}>
 <Dumbbell className="h-6 w-6" />
 Commencer ma séance
 </Link>
 </Button>
 <Button asChild variant="ghost" size="lg" className="border border-white text-white hover:bg-muted hover:border-border transition-colors">
 <Link href="/calendar" prefetch={false}>
 <Calendar className="h-5 w-5" />
 Voir le planning
 </Link>
 </Button>
 </div>
 </div>
 </div>
 </div>

 {/* Statistiques */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {statCards.map((stat) => {
 const Icon = stat.icon
 return (
 <Card key={stat.title} className="hover:shadow-lg transition-shadow">
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
 <p className="text-2xl font-bold text-foreground">{stat.value}</p>
 </div>
 <div className={`p-2 rounded-full ${stat.bgColor} `}>
 <Icon className={`h-6 w-6 ${stat.color}`} />
 </div>
 </div>
 </CardContent>
 </Card>
 )
})}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
 {/* Actions rapides */}
 <div className="lg:col-span-2">
 <Card className="p-4 sm:p-6">
 <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-0 mb-4 sm:mb-6">
 <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-0">Actions rapides</CardTitle>
 <span className="text-xs sm:text-sm text-gray-600">Que veux-tu faire aujourd'hui ?</span>
 </CardHeader>
 <CardContent className="p-0">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
 {quickActions.map((action, index) => {
 const Icon = action.icon
 // Styles inline pour bypasser les problèmes Tailwind - 6 couleurs uniques
 const backgroundStyles = [
 { background:'linear-gradient(to bottom right, #16a34a, #15803d)'}, // vert
 { background:'linear-gradient(to bottom right, #ea580c, #ef4444)'}, // orange vers rouge 
 { background:'linear-gradient(to bottom right, #2563eb, #1d4ed8)'}, // bleu
 { background:'linear-gradient(to bottom right, #9333ea, #7c3aed)'}, // violet
 { background:'linear-gradient(to bottom right, #eab308, #ca8a04)'}, // jaune/gold
 { background:'linear-gradient(to bottom right, #ec4899, #db2777)'} // rose/pink
 ]
 const backgroundStyle = backgroundStyles[index % backgroundStyles.length]
 
 if (action.onClick) {
 return (
 <button
 key={action.name}
 onClick={action.onClick}
 style={backgroundStyle}
 className="rounded-xl p-4 sm:p-6 shadow-md transform hover:scale-105 transition-all min-h-[80px] sm:min-h-[90px] flex items-center hover:shadow-lg"
 >
 <div className="flex items-center text-left text-white">
 {Icon && <Icon className="h-6 w-6 mr-2 flex-shrink-0" />}
 <div>
 <h3 className="text-sm sm:text-base font-semibold leading-tight">{action.name}</h3>
 <p className="text-xs sm:text-sm opacity-90 mt-1">{action.description}</p>
 </div>
 </div>
 </button>
 )
}
 
 return (
 <Link
 key={action.name}
 href={action.href}
 prefetch={false}
 style={backgroundStyle}
 className="rounded-xl p-4 sm:p-6 shadow-md transform hover:scale-105 transition-all min-h-[80px] sm:min-h-[90px] flex items-center hover:shadow-lg"
 >
 <div className="flex items-center text-left text-white">
 {Icon && <Icon className="h-6 w-6 mr-2 flex-shrink-0" />}
 <div>
 <h3 className="text-sm sm:text-base font-semibold leading-tight">{action.name}</h3>
 <p className="text-xs sm:text-sm opacity-90 mt-1">{action.description}</p>
 </div>
 </div>
 </Link>
 )
})}
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="flex flex-col gap-4 lg:gap-6 w-full">
 {/* QuickTimer Restauré */}
 <Card className="p-4">
 <QuickTimerRestored />
 </Card>
 
 {/* Exercices récents */}
 <Card className="p-4 sm:p-6 w-full">
 <CardHeader className="p-0 mb-4">
 <CardTitle className="text-base sm:text-lg flex items-center gap-2">
 <Trophy className="h-5 w-5 flex-shrink-0" />
 <span>Exercices récents</span>
 </CardTitle>
 </CardHeader>
 
 <CardContent className="p-0">
 {recentExercises.length === 0 ? (
 <div className="text-center py-4">
 <p className="text-gray-600 text-sm mb-2">
 Aucun exercice récent
 </p>
 <Button asChild size="sm" className="bg-primary">
 <Link href="/exercises/new" prefetch={false}>
 <Plus className="h-4 w-4 mr-2" />
 Créer un exercice
 </Link>
 </Button>
 </div>
 ) : (
 <div className="space-y-2">
 {recentExercises.slice(0, 3).map((exercise) => (
 <div key={exercise.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
 <div className="flex-1">
 <h3 className="text-sm font-medium text-foreground truncate">
 {exercise.name}
 </h3>
 <p className="text-xs text-muted-foreground">
 {exercise.muscle_group}
 </p>
 </div>
 <div className="text-right">
 <p className="text-sm font-semibold text-foreground">
 {exercise.displayValue}
 </p>
 <p className="text-xs text-muted-foreground">
 {exercise.displayLabel}
 </p>
 </div>
 </div>
 ))}
 <Button asChild size="sm" variant="secondary" className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent-hover border border-border">
 <Link href="/exercises" prefetch={false}>
 Voir tous les exercices
 </Link>
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>

 {/* Section finale objectifs */}
 <div className="mt-8 bg-gradient-to-r from-orange-600 to-red-500 rounded-xl p-6 text-white">
 <div className="text-center">
 <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
 <Trophy className="h-8 w-8 text-yellow-300" />
 Objectif de la semaine
 </h2>
 <p className="text-orange-50 text-lg mb-6">
 🏆 Prêt à démarrer ? Commence ta première séance de la semaine !
 </p>
 
 <div className="flex justify-center items-center gap-8">
 <div className="text-center">
 <div className="text-4xl font-bold">{stats.thisWeek}</div>
 <div className="text-orange-100 text-sm">séances cette semaine</div>
 </div>
 <div className="flex-1 max-w-md">
 <div className="bg-orange-700/60 rounded-full h-4 mb-2">
 <div 
 className="bg-yellow-300 h-4 rounded-full transition-all duration-500"
 style={{ width: `${Math.min(stats.thisWeek * 33.33, 100)}%`}}
 ></div>
 </div>
 <p className="text-orange-100 text-sm">
 Objectif: 3 séances par semaine
 </p>
 </div>
 <Link 
 href="/workouts/new" 
 className="bg-muted/30 hover:bg-muted/50 rounded-lg p-4 transition-colors"
 >
 <Dumbbell className="h-8 w-8" />
 </Link>
 </div>
 </div>
 </div>

 {/* Session Timer Complet Restauré */}
 {showSessionTimer && (
 <SessionTimerModal 
 steps={sessionSteps}
 userSounds={userSounds}
 sessionSounds={sessionSounds}
 onClose={() => setShowSessionTimer(false)}
 onStepsChange={setSessionSteps}
 onSoundsChange={setSessionSounds}
 />
 )}

 {/* Badge notification */}
 {newBadgeEarned && (
 <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-xl z-50 animate-bounce">
 <div className="flex items-center gap-2">
 <Trophy className="h-5 w-5" />
 <span>Nouveau badge obtenu ! 🎉</span>
 </div>
 </div>
 )}

 {/* PWA Install Prompt temporairement désactivé */}
 </div>
 </div>
 )
}
