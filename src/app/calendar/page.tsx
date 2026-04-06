'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo} from'react'
import Head from'next/head'

// Import directs des icônes pour éviter les erreurs webpack
import { 
 Plus, 
 Calendar as CalendarIcon, 
 List, 
 Activity, 
 ChevronLeft, 
 ChevronRight,
 Clock,
 Users
} from'lucide-react'


// MIGRATION SHADCN/UI CALENDAR
import { Button} from'@/components/ui/button'
import { Card} from'@/components/ui/card'
import { Badge} from'@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent} from'@/components/ui/tabs'
import { createClient} from'@/utils/supabase/client'
import { useRouter} from'next/navigation'
import CalendarDayCell from'@/components/ui/CalendarDayCell';

interface Workout {
 id: number
 user_id: string
 scheduled_date: string
 name: string
 type:'Musculation' |'Cardio' |'Étirement' |'Repos' |'Cours collectif' |'Gainage' |'Natation' |'Crossfit' |'Yoga' |'Pilates'
 status:'Planifié' |'Planifie' |'Terminé' |'Réalisé' |'Annulé'
 duration?: number
 exercises?: string[]
 notes?: string
 start_time?: string
 end_time?: string
 created_at?: string
 updated_at?: string
 profiles?: {
 id: string
 pseudo: string | null
 full_name: string | null
 email: string
 avatar_url: string | null
}
}

interface WorkoutWithProfile extends Workout {
 profiles?: {
 id: string
 pseudo: string | null
 full_name: string | null
 email: string
 avatar_url: string | null
}
}

const workoutTypes = [
 { name:'Musculation', color:'bg-primary', iconName:'Dumbbell'},
 { name:'Cardio', color:'bg-secondary', iconName:'Clock'},
 { name:'Étirement', color:'bg-green-500', iconName:'Target'},
 { name:'Cours collectif', color:'bg-purple-500', iconName:'Users'},
 { name:'Gainage', color:'bg-yellow-500', iconName:'Activity'},
 { name:'Natation', color:'bg-cyan-500', iconName:'Waves'},
 { name:'Crossfit', color:'bg-red-500', iconName:'Zap'},
 { name:'Yoga', color:'bg-pink-500', iconName:'Flower'},
 { name:'Pilates', color:'bg-indigo-500', iconName:'Smile'},
 { name:'Repos', color:'bg-gray-500', iconName:'CheckCircle'}
]


// Type commun pour les séances du calendrier
interface CalendarSession {
 id: string;
 name: string;
 type:'Musculation' |'Cardio' |'Étirement' |'Repos' |'Cours collectif' |'Gainage' |'Natation' |'Crossfit' |'Yoga' |'Pilates';
 status:'Planifié' |'Planifie' |'Terminé' |'Réalisé' |'Annulé';
 duration?: number;
 isShared: boolean;
 participants: { id: string; name: string; avatarUrl: string}[];
 time: string;
 exercises: string[];
 scheduled_date: string;
 color?: string;
}


// Ajoute une fonction utilitaire pour formater une date JS en'YYYY-MM-DD' en local (pas UTC)
function formatDateToYMD(date: Date): string {
 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2,'0');
 const dayNum = String(date.getDate()).padStart(2,'0');
 return `${year}-${month}-${dayNum}`;
}

export default function CalendarPage() {
 const router = useRouter();
 
 const [currentDate, setCurrentDate] = useState(new Date())
 const [selectedDate, setSelectedDate] = useState<Date | null>(null)
 const [workouts, setWorkouts] = useState<Workout[]>([])
 const [partnersWorkouts, setPartnersWorkouts] = useState<WorkoutWithProfile[]>([])
 const [showPartnersWorkouts, setShowPartnersWorkouts] = useState(false)
 const [, setSharePlanning] = useState(false)
 const [viewMode, setViewMode] = useState<'calendar' |'list' |'stats'>('calendar')
 const [isMobileViewport, setIsMobileViewport] = useState(false)
 
 // État pour la navigation swipe
 const [isSwipeTransition, setIsSwipeTransition] = useState(false)
 const calendarRef = useRef<HTMLDivElement>(null)

 // Fonctions de navigation swipe (Apple pattern)
 const handleSwipeNavigation = useCallback((direction:'left' |'right') => {
 if (isSwipeTransition) return
 
 setIsSwipeTransition(true)
 const newDate = new Date(currentDate)
 
 if (direction ==='left') {
 // Swipe gauche = mois suivant (comme Apple Calendar)
 newDate.setMonth(newDate.getMonth() + 1)
} else {
 // Swipe droite = mois précédent
 newDate.setMonth(newDate.getMonth() - 1)
}
 
 setCurrentDate(newDate)
 
 // Réactiver swipe après animation
 setTimeout(() => setIsSwipeTransition(false), 300)
}, [currentDate, isSwipeTransition])

 // Gestion des événements tactiles sans Framer Motion
 const handleTouchStart = useCallback((e: React.TouchEvent) => {
 const touch = e.touches[0]
 if (calendarRef.current) {
 calendarRef.current.dataset.startX = touch.clientX.toString()
 calendarRef.current.dataset.startY = touch.clientY.toString()
 calendarRef.current.dataset.startTime = Date.now().toString()
}
}, [])

 const handleTouchEnd = useCallback((e: React.TouchEvent) => {
 if (!calendarRef.current || isSwipeTransition) return
 
 const touch = e.changedTouches[0]
 const startX = parseFloat(calendarRef.current.dataset.startX ||'0')
 const startY = parseFloat(calendarRef.current.dataset.startY ||'0')
 const startTime = parseInt(calendarRef.current.dataset.startTime ||'0')
 
 const deltaX = touch.clientX - startX
 const deltaY = touch.clientY - startY
 const deltaTime = Date.now() - startTime
 
 const swipeThreshold = 50 // Distance minimale pour déclencher swipe
 const maxTime = 300 // Temps maximum pour un swipe
 
 // Détection swipe horizontal uniquement
 if (Math.abs(deltaX) > Math.abs(deltaY) && 
 Math.abs(deltaX) > swipeThreshold && 
 deltaTime < maxTime) {
 
 if (deltaX > 0) {
 handleSwipeNavigation('right') // Swipe vers droite = mois précédent
} else {
 handleSwipeNavigation('left') // Swipe vers gauche = mois suivant
}
}
 
 // Nettoyer les données
 delete calendarRef.current.dataset.startX
 delete calendarRef.current.dataset.startY
 delete calendarRef.current.dataset.startTime
}, [handleSwipeNavigation, isSwipeTransition])

 useEffect(() => {
 if (typeof window ==='undefined') return

 const mediaQuery = window.matchMedia('(max-width: 767px)')
 const syncViewportMode = (matches: boolean) => {
 setIsMobileViewport(matches)
 setViewMode(currentMode => {
 if (!matches && currentMode ==='list') {
 return'calendar'
}

 if (matches && currentMode ==='calendar') {
 return'list'
}

 return currentMode
})
}

 syncViewportMode(mediaQuery.matches)

 const handleViewportChange = (event: MediaQueryListEvent) => {
 syncViewportMode(event.matches)
 }

 mediaQuery.addEventListener('change', handleViewportChange)

 return () => mediaQuery.removeEventListener('change', handleViewportChange)
 }, [])

 // Charger les séances personnelles
 const loadWorkouts = useCallback(async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) return;

 const { data: workoutsData} = await supabase
 .from('workouts')
 .select('*')
 .eq('user_id', user.id)
 .order('scheduled_date', { ascending: true});
 
 if (workoutsData) {
 setWorkouts(workoutsData);
}
}, []);

 // Charger les séances des partenaires
 const loadPartnersWorkouts = useCallback(async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) return;

 // Récupérer les partenaires acceptés avec leurs séances partagées
 const { data: partnersData} = await supabase
 .from('training_partners')
 .select(`
 *,
 requester:requester_id(id, pseudo, full_name, email, avatar_url),
 partner:partner_id(id, pseudo, full_name, email, avatar_url)
 `)
 .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)
 .eq('status','accepted');

 if (!partnersData || partnersData.length === 0) {
 setPartnersWorkouts([]);
 return;
}

 const partnerIds = partnersData.map(p => 
 p.requester_id === user.id ? p.partner_id : p.requester_id
 );

 // Récupérer les paramètres de partage pour chaque partenaire
 const { data: sharingSettings} = await supabase
 .from('partner_sharing_settings')
 .select('*')
 .in('user_id', partnerIds)
 .eq('partner_id', user.id)
 .eq('share_workouts', true);

 if (!sharingSettings || sharingSettings.length === 0) {
 setPartnersWorkouts([]);
 return;
}

 // Filtrer les partenaires qui partagent leurs workouts
 const sharingPartnerIds = sharingSettings.map(s => s.user_id);

 // Récupérer les séances des partenaires qui partagent leurs workouts
 const { data: workoutsData} = await supabase
 .from('workouts')
 .select(`
 *,
 profiles:user_id(id, pseudo, full_name, email, avatar_url)
 `)
 .in('user_id', sharingPartnerIds)
 .order('scheduled_date', { ascending: true});

 if (workoutsData) {
 // Enrichir avec les informations de partenariat
 const enrichedWorkouts = workoutsData.map(workout => ({
 ...workout,
 isPartnerWorkout: true,
 partnerInfo: partnersData.find(p => 
 (p.requester_id === workout.user_id || p.partner_id === workout.user_id)
 )
}));
 
 setPartnersWorkouts(enrichedWorkouts);
}
}, []);

 useEffect(() => {
 const checkAuth = async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) {
 router.replace('/auth');
}
};
 checkAuth();
}, [router]);

 useEffect(() => {
 const fetchProfile = async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) return;
 const { data: profile} = await supabase
 .from('profiles')
 .select('avatar_url, full_name, email, pseudo')
 .eq('id', user.id)
 .single();
 if (profile) {
 if (!profile.pseudo || profile.pseudo.trim() ==='') {
 const pseudo = (profile.email && profile.email.split('@')[0]) ||'Utilisateur IronTrack';
 await supabase
 .from('profiles')
 .update({ pseudo})
 .eq('id', user.id);
}
}
 const { data: settings} = await supabase
 .from('user_settings')
 .select('share_planning')
 .eq('user_id', user.id)
 .single();
 const shareEnabled = !!settings?.share_planning;
 setSharePlanning(shareEnabled);
 
 // Charger les données initiales
 loadWorkouts();
 loadPartnersWorkouts();
};
 fetchProfile();
}, [router, loadWorkouts, loadPartnersWorkouts])


 const getDaysInMonth = (date: Date) => {
 const year = date.getFullYear()
 const month = date.getMonth()
 const firstDay = new Date(year, month, 1)
 const lastDay = new Date(year, month + 1, 0)
 const daysInMonth = lastDay.getDate()
 
 // Convertir le dimanche (0) en 7 pour le standard européen (Lundi = 1, Dimanche = 7)
 const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
 const days = []
 
 // Ajouter les jours du mois précédent (Lundi = jour 1)
 for (let i = 1; i < startingDayOfWeek; i++) {
 const prevDate = new Date(year, month, -(startingDayOfWeek - i - 1))
 days.push({ date: prevDate, isCurrentMonth: false})
}

 // Ajouter les jours du mois actuel
 for (let i = 1; i <= daysInMonth; i++) {
 const currentDate = new Date(year, month, i)
 days.push({ date: currentDate, isCurrentMonth: true})
}

 // Compléter avec les jours du mois suivant pour faire 42 jours (6 semaines)
 const remainingDays = 42 - days.length
 for (let i = 1; i <= remainingDays; i++) {
 const nextDate = new Date(year, month + 1, i)
 days.push({ date: nextDate, isCurrentMonth: false})
}

 return days
}

 const getWorkoutsForDate = (date: Date) => {
 const selected = formatDateToYMD(date);
 return workouts.filter(workout => workout.scheduled_date === selected);
}

 const getTypeColor = (type: string) => {
 const workoutType = workoutTypes.find(wt => wt.name === type)
 return workoutType?.color ||'bg-gray-500'
}

 // Conversion des classes CSS vers gradients pour le calendrier
 const getSessionGradient = (type: string) => {
 const colorMap: { [key: string]: string} = {
'bg-primary':'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', // Musculation
'bg-secondary':'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', // Cardio
'bg-green-500':'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', // Étirement
'bg-purple-500':'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)', // Cours collectif
'bg-yellow-500':'linear-gradient(135deg, #eab308 0%, #facc15 100%)', // Gainage
'bg-cyan-500':'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', // Natation
'bg-red-500':'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', // Crossfit
'bg-pink-500':'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', // Yoga
'bg-indigo-500':'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Pilates
'bg-gray-500':'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', // Repos
}
 const colorClass = getTypeColor(type)
 return colorMap[colorClass] || colorMap['bg-gray-500']
}

 const formatDate = (date: Date) => {
 return date.toLocaleDateString('fr-FR', { 
 weekday:'long', 
 year:'numeric', 
 month:'long', 
 day:'numeric' 
})
}

 const isToday = (date: Date) => {
 const today = new Date()
 return date.toDateString() === today.toDateString()
}

 const isSelected = (date: Date): boolean => {
 return (selectedDate ?? undefined) !== undefined && date.toDateString() === selectedDate!.toDateString()
}

 const days = getDaysInMonth(currentDate)
 const monthName = currentDate.toLocaleDateString('fr-FR', { month:'long', year:'numeric'})
 const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2,'0')}`
 const todayYmd = formatDateToYMD(new Date())

 const currentMonthWorkouts = useMemo(
 () => workouts.filter(workout => workout.scheduled_date.startsWith(currentMonthKey)),
 [workouts, currentMonthKey]
 )

 const currentMonthPartnerWorkouts = useMemo(
 () => partnersWorkouts.filter(workout => workout.scheduled_date.startsWith(currentMonthKey)),
 [partnersWorkouts, currentMonthKey]
 )

 const visibleMonthPartnerWorkouts = useMemo(
 () => (showPartnersWorkouts ? currentMonthPartnerWorkouts : []),
 [currentMonthPartnerWorkouts, showPartnersWorkouts]
 )

 const combinedMonthWorkouts = useMemo(
 () => [
 ...currentMonthWorkouts.map(workout => ({ ...workout, isPartnerWorkout: false})),
 ...visibleMonthPartnerWorkouts.map(workout => ({ ...workout, isPartnerWorkout: true})),
 ].sort((a, b) => {
 const dateDiff = a.scheduled_date.localeCompare(b.scheduled_date)
 if (dateDiff !== 0) return dateDiff
 return (a.start_time ||'').localeCompare(b.start_time ||'')
}),
 [currentMonthWorkouts, visibleMonthPartnerWorkouts]
 )

 const completedWorkouts = useMemo(
 () => currentMonthWorkouts.filter(workout => workout.status ==='Terminé' || workout.status ==='Réalisé').length,
 [currentMonthWorkouts]
 )

 const plannedWorkouts = useMemo(
 () => currentMonthWorkouts.filter(workout => workout.status ==='Planifié' || workout.status ==='Planifie').length,
 [currentMonthWorkouts]
 )

 const monthlyTypeStats = useMemo(
 () => workoutTypes
 .map(type => ({
 ...type,
 count: currentMonthWorkouts.filter(workout => getCorrectType(workout) === type.name).length,
}))
 .filter(type => type.count > 0),
 [currentMonthWorkouts]
 )

 const nextPlannedWorkout = useMemo(() => {
 const plannedSessions = [...currentMonthWorkouts]
 .filter(workout => workout.status ==='Planifié' || workout.status ==='Planifie')
 .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || (a.start_time ||'').localeCompare(b.start_time ||''))

 return plannedSessions.find(workout => workout.scheduled_date >= todayYmd) ?? plannedSessions[0] ?? null
 }, [currentMonthWorkouts, todayYmd])

 const selectedDateYmd = selectedDate ? formatDateToYMD(selectedDate) : null

 const selectedDateWorkouts = useMemo(() => {
 if (!selectedDateYmd) return []

 return [
 ...workouts
 .filter(workout => workout.scheduled_date === selectedDateYmd)
 .map(workout => ({ ...workout, isPartnerWorkout: false})),
 ...(showPartnersWorkouts
 ? partnersWorkouts
 .filter(workout => workout.scheduled_date === selectedDateYmd)
 .map(workout => ({ ...workout, isPartnerWorkout: true}))
 : []),
 ]
 }, [partnersWorkouts, selectedDateYmd, showPartnersWorkouts, workouts])

 // Fonction pour corriger automatiquement le type basé sur le nom
 const getCorrectType = (workout: Workout): string => {
 const name = workout.name.toLowerCase();
 if (name.includes('cardio')) return'Cardio';
 if (name.includes('étirement') || name.includes('etirement') || name.includes('stretch')) return'Étirement';
 if (name.includes('cours') || name.includes('collectif') || name.includes('group')) return'Cours collectif';
 if (name.includes('gainage') || name.includes('core') || name.includes('abs')) return'Gainage';
 if (name.includes('natation') || name.includes('piscine') || name.includes('swim')) return'Natation';
 if (name.includes('crossfit') || name.includes('cross fit') || name.includes('wod')) return'Crossfit';
 if (name.includes('yoga')) return'Yoga';
 if (name.includes('pilates')) return'Pilates';
 if (name.includes('repos') || name.includes('rest')) return'Repos';
 return workout.type; // Garder le type original si aucune correspondance
};

 return (
 <>
 <Head>
 <title>Calendrier - Planning entraînements | IronTrack</title>
 <meta name="description" content="Planifiez et organisez vos séances de musculation. Calendrier interactif pour suivre vos entraînements, cardio, repos et progression hebdomadaire." />
 <meta name="keywords" content="calendrier musculation, planning entraînement, organisation fitness, suivi séances" />
 <meta property="og:title" content="Calendrier IronTrack - Planning musculation" />
 <meta property="og:description" content="Organisez vos séances de musculation avec le calendrier interactif IronTrack" />
 <meta property="og:type" content="website" />
 </Head>
 <div className="min-h-screen bg-background" suppressHydrationWarning>
 {/* Header */}
 <div className="border-b border-border bg-background/95">
 <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
 <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
 <div className="space-y-4">
 <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">
 Planning mobile-first
 </Badge>
 <div className="space-y-2">
 <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Calendrier</h1>
 <p className="max-w-2xl text-sm leading-6 text-safe-muted sm:text-base">
 Planifie tes séances, visualise les partages utiles et garde un accès rapide aux actions importantes, surtout sur mobile.
 </p>
 </div>
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
 <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-safe-muted">Ce mois-ci</p>
 <p className="mt-2 text-2xl font-semibold text-foreground">{currentMonthWorkouts.length}</p>
 <p className="text-sm text-safe-muted">séances personnelles</p>
 </div>
 <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-safe-muted">Terminées</p>
 <p className="mt-2 text-2xl font-semibold text-success">{completedWorkouts}</p>
 <p className="text-sm text-safe-muted">dans la vue courante</p>
 </div>
 <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm sm:col-span-1 col-span-2">
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-safe-muted">Partages visibles</p>
 <p className="mt-2 text-2xl font-semibold text-foreground">{visibleMonthPartnerWorkouts.length}</p>
 <p className="text-sm text-safe-muted">
 {showPartnersWorkouts ?'séances partenaires affichées' :'active le partage pour les voir ici'}
 </p>
 </div>
 </div>
 </div>
 <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:items-stretch">
 <Button
 onClick={() => {
 if (partnersWorkouts.length === 0) {
 router.push('/training-partners');
} else {
 setShowPartnersWorkouts(!showPartnersWorkouts);
}
}}
 variant="outline"
 className="min-h-[48px] justify-between gap-3 border-border bg-card text-foreground hover:bg-accent touch-manipulation"
 title={
 partnersWorkouts.length === 0 
 ?'Aucune séance partagée disponible - Gérer mes partenaires' 
 : (showPartnersWorkouts ?'Masquer les séances des partenaires' :'Afficher les séances des partenaires')
}
 >
 <span className="flex items-center gap-2">
 <Users className="h-4 w-4 text-primary" aria-hidden="true" />
 <span className="text-sm font-medium">
 {partnersWorkouts.length === 0
 ?'Gérer mes partenaires'
 : showPartnersWorkouts
 ?'Masquer les partages'
 :'Afficher les partages'}
 </span>
 </span>
 {partnersWorkouts.length > 0 && (
 <Badge className="bg-primary text-white hover:bg-primary">
 {partnersWorkouts.length}
 </Badge>
 )}
 </Button>
 <Button
 onClick={() => router.push('/workouts/new')}
 className="min-h-[48px] gap-2 bg-primary text-white shadow-sm transition-colors hover:bg-primary-hover touch-manipulation"
 >
 <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
 <span>Nouvelle séance</span>
 </Button>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
 {/* Calendrier et Vue Liste */}
 <div className="xl:col-span-2">
 <Card className="p-2 sm:p-6">
 {/* ShadCN UI Tabs Component - 3 onglets sur mobile */}
 <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as'calendar' |'list' |'stats')} className="w-full">
 <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 xl:grid-cols-2 mb-6">
 <TabsTrigger value="calendar" className="flex items-center space-x-2">
 <CalendarIcon className="h-4 w-4" />
 <span>{isMobileViewport ?'Mois' :'Calendrier'}</span>
 </TabsTrigger>
 <TabsTrigger value="list" className="flex items-center space-x-2">
 <List className="h-4 w-4" />
 <span>Liste</span>
 </TabsTrigger>
 {/* Troisième onglet Stats pour mobile/tablette */}
 <TabsTrigger value="stats" className="flex xl:hidden items-center space-x-2">
 <Activity className="h-4 w-4" />
 <span>Stats</span>
 </TabsTrigger>
 </TabsList>
 
 <TabsContent value="calendar" className="m-0">
 {/* Vue Calendrier */}
 {/* Navigation du calendrier */}
 <div className="flex items-center justify-between mb-4 sm:mb-6">
 <div>
 <Button
 onClick={() => {
 const newDate = new Date(currentDate);
 newDate.setMonth(newDate.getMonth() - 1);
 setCurrentDate(newDate);
}}
 variant="ghost"
 size="sm"
 className="p-2 touch-manipulation"
 >
 <ChevronLeft className="h-5 w-5" />
 </Button>
 </div>
 
 <h2 className="text-xl sm:text-2xl font-bold text-foreground capitalize">
 {monthName}
 </h2>
 
 <div className="flex items-center gap-2">
 <div>
 <Button
 onClick={() => setCurrentDate(new Date())}
 className="bg-gradient-to-r from-orange-600 to-red-500 text-white text-sm font-semibold shadow-md hover:shadow-lg touch-manipulation"
 >
 <span className="hidden sm:inline">Aujourd'hui</span>
 <span className="sm:hidden">Auj.</span>
 </Button>
 </div>
 
 <div>
 <Button
 onClick={() => {
 const newDate = new Date(currentDate);
 newDate.setMonth(newDate.getMonth() + 1);
 setCurrentDate(newDate);
}}
 variant="ghost"
 size="sm"
 className="p-2 touch-manipulation"
 >
 <ChevronRight className="h-5 w-5" />
 </Button>
 </div>
 </div>
 </div>

 {/* Grille du calendrier */}
 <div 
 ref={calendarRef}
 className="grid grid-cols-7 gap-1 calendar-swipe touch-pan-y"
 onTouchStart={handleTouchStart}
 onTouchEnd={handleTouchEnd}
 style={{ touchAction:'pan-y pinch-zoom'}}
 >
 {/* En-têtes des jours - Standard européen/belge (Lundi premier) */}
 {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(day => (
 <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
 {day}
 </div>
 ))}

 {/* Jours du mois */}
 {days.map((day, index) => {
 let sessions: CalendarSession[] = [];
 const dayYMD = formatDateToYMD(day.date);
 
 // Séances personnelles
 const workoutsForDate = workouts.filter(w => w.scheduled_date === dayYMD);
 const personalSessions = workoutsForDate.map(w => {
 const correctedType = getCorrectType(w);
 
 const sessionType = (['Musculation','Cardio','Étirement','Repos','Cours collectif','Gainage','Natation','Crossfit','Yoga','Pilates'].includes(correctedType) ? correctedType :'Musculation') as'Musculation' |'Cardio' |'Étirement' |'Repos' |'Cours collectif' |'Gainage' |'Natation' |'Crossfit' |'Yoga' |'Pilates';
 return {
 id: String(w.id),
 name: w.name,
 type: sessionType,
 status: w.status as'Planifié' |'Terminé' |'Annulé',
 duration: w.duration,
 isShared: false,
 participants: [],
 scheduled_date: w.scheduled_date,
 time: (w as { time?: string}).time ||'',
 exercises: w.exercises || [],
 color: getSessionGradient(sessionType),
};
});

 // Séances des partenaires (si activées)
 let partnerSessions: CalendarSession[] = [];
 if (showPartnersWorkouts) {
 const partnersForDate = partnersWorkouts.filter(pw => pw.scheduled_date === dayYMD);
 partnerSessions = partnersForDate.map(pw => {
 const partner = pw.profiles;
 const participant = {
 id: partner?.id ||'',
 name: partner?.pseudo || partner?.full_name || (partner?.email && partner.email.split('@')[0]) ||'Partenaire',
 avatarUrl: partner?.avatar_url ||'/default-avatar.png',
};
 const correctedType = getCorrectType(pw);
 const partnerSessionType = (['Musculation','Cardio','Étirement','Repos','Cours collectif','Gainage','Natation','Crossfit','Yoga','Pilates'].includes(correctedType) ? correctedType :'Musculation') as'Musculation' |'Cardio' |'Étirement' |'Repos' |'Cours collectif' |'Gainage' |'Natation' |'Crossfit' |'Yoga' |'Pilates';
 
 return {
 id: `partner-${pw.id}`,
 name: `${pw.name}`,
 type: partnerSessionType,
 status: pw.status as'Planifié' |'Planifie' |'Terminé' |'Réalisé' |'Annulé',
 duration: pw.duration,
 isShared: true,
 participants: [participant],
 scheduled_date: pw.scheduled_date,
 time: pw.start_time ||'',
 exercises: [],
 color: getSessionGradient(partnerSessionType),
};
});
}

 sessions = [...personalSessions, ...partnerSessions];
 
 // Trier par heure si disponible
 sessions.sort((a, b) => {
 if (a.time && b.time) {
 return a.time.localeCompare(b.time);
}
 return 0;
});
 const isCurrentDay = isToday(day.date);
 const isSelectedDay = isSelected(day.date);
 const cell = (
 <div
 key={index}
 onClick={() => setSelectedDate(day.date)}
 className={`w-full cursor-pointer transition-all touch-manipulation min-h-[44px] rounded-lg ${
 isSelectedDay 
 ?'ring-2 ring-secondary bg-tertiary/8' 
 : isCurrentDay 
 ?'ring-2 ring-primary' 
 :''
}`}
 role="button"
 tabIndex={0}
 onKeyDown={(e) => {
 if (e.key ==='Enter' || e.key ===' ') {
 e.preventDefault();
 setSelectedDate(day.date);
}
}}
 aria-label={`Sélectionner le ${day.date.getDate()} ${monthName}`}
 >
 <CalendarDayCell date={day.date.getDate()} sessions={sessions} isSelected={isSelectedDay} />
 </div>
 );
 return cell;
})}
 </div>
 </TabsContent>
 
 <TabsContent value="list" className="m-0">
 {/* Vue liste des séances */}
 <div className="space-y-4">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-foreground">Séances planifiées</h3>
 <Button
 onClick={() => router.push('/workouts/new')}
 size="sm"
 className="bg-primary hover:bg-primary-hover text-white"
 >
 <Plus className="h-4 w-4 mr-1" />
 Nouvelle séance
 </Button>
 </div>
 
{(() => {
 return combinedMonthWorkouts.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground">
 <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
 <p className="text-lg font-medium">Aucune séance planifiée</p>
 <p className="text-sm">Créez votre première séance pour commencer</p>
 </div>
 ) : (
 <div className="space-y-2">
 {combinedMonthWorkouts.slice(0, 10).map(workout => (
 <div key={`${workout.isPartnerWorkout ?'partner-' :'personal-'}${workout.id}`} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
 <div className={`w-3 h-3 rounded-full ${getTypeColor(getCorrectType(workout))}`}></div>
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <h4 className="font-medium text-foreground">{workout.name}</h4>
 {workout.isPartnerWorkout && (
 <span className="flex items-center gap-1 text-xs text-primary bg-orange-50 px-2 py-1 rounded-full">
 <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
 </svg>
 {(workout as WorkoutWithProfile).profiles?.pseudo || (workout as WorkoutWithProfile).profiles?.full_name ||'Partenaire'}
 </span>
 )}
 </div>
 <p className="text-sm text-muted-foreground">
 {new Date(workout.scheduled_date).toLocaleDateString('fr-FR', {
 weekday:'long',
 day:'numeric',
 month:'long'
})}
 {workout.start_time && ` • ${workout.start_time}`}
 {workout.duration && ` • ${workout.duration} min`}
 </p>
 </div>
 <Badge className={`text-white ${getTypeColor(getCorrectType(workout))}`}>
 {getCorrectType(workout)}
 </Badge>
 </div>
 ))}
 </div>
 );
})()}</div>
 </TabsContent>
 
 <TabsContent value="stats" className="m-0 xl:hidden">
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <Card className="p-4">
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-safe-muted">Planifiées</p>
 <p className="mt-2 text-2xl font-semibold text-foreground">{plannedWorkouts}</p>
 <p className="text-sm text-safe-muted">à venir ce mois-ci</p>
 </Card>
 <Card className="p-4">
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-safe-muted">Partages</p>
 <p className="mt-2 text-2xl font-semibold text-foreground">{visibleMonthPartnerWorkouts.length}</p>
 <p className="text-sm text-safe-muted">visibles sur mobile</p>
 </Card>
 </div>

 <Card className="p-4">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.16em] text-safe-muted">Prochaine séance</p>
 <h3 className="mt-2 text-lg font-semibold text-foreground">
 {nextPlannedWorkout ? nextPlannedWorkout.name :'Aucune séance planifiée'}
 </h3>
 <p className="mt-1 text-sm text-safe-muted">
 {nextPlannedWorkout
 ? `${new Date(nextPlannedWorkout.scheduled_date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long'})}${nextPlannedWorkout.start_time ? ` • ${nextPlannedWorkout.start_time}` :''}`
 :'Crée une séance pour remplir ton planning.'}
 </p>
 </div>
 <Button size="sm" onClick={() => router.push('/workouts/new')} className="shrink-0">
 <Plus className="mr-1 h-4 w-4" />
 Ajouter
 </Button>
 </div>
 </Card>

 {selectedDate && (
 <Card className="p-4">
 <h3 className="text-base font-semibold text-foreground">{formatDate(selectedDate)}</h3>
 <div className="mt-4 space-y-2">
 {selectedDateWorkouts.length === 0 ? (
 <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-safe-muted">
 Aucune séance planifiée pour cette date.
 </div>
 ) : (
 selectedDateWorkouts.map(workout => (
 <div key={`${workout.isPartnerWorkout ?'partner-' :'personal-'}${workout.id}`} className="rounded-xl border border-border bg-muted/30 p-3">
 <div className="flex items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="truncate font-medium text-foreground">{workout.name}</p>
 <p className="text-sm text-safe-muted">
 {getCorrectType(workout)}
 {workout.duration ? ` • ${workout.duration} min` :''}
 {workout.start_time ? ` • ${workout.start_time}` :''}
 </p>
 </div>
 {workout.isPartnerWorkout && (
 <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
 Partenaire
 </Badge>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 )}
 </div>
 </TabsContent>
 </Tabs>
 </Card>
 </div>

 {/* Panneau latéral simple */}
 <div className="hidden xl:block space-y-6">
 {/* Statistiques mensuelles */}
 <div className="bg-card border border-border rounded-xl shadow-md p-4 lg:p-6">
 <h3 className="text-base lg:text-lg font-bold text-foreground mb-4">
 Statistiques {monthName}
 </h3>
 <div className="space-y-4">
 {(() => {
 return (
 <>
 <div className="grid grid-cols-2 gap-2">
 <div className="text-center p-2 bg-green-50 rounded-lg">
 <div className="text-2xl font-bold text-green-600">{completedWorkouts}</div>
 <div className="text-xs text-green-700">Terminées</div>
 </div>
 <div className="text-center p-2 bg-orange-50 rounded-lg">
 <div className="text-2xl font-bold text-primary">{plannedWorkouts}</div>
 <div className="text-xs text-orange-700">Planifiées</div>
 </div>
 </div>
 
 {monthlyTypeStats.length > 0 && (
 <div className="space-y-2">
 <h4 className="text-sm font-medium text-foreground">Types d'entraînements</h4>
 {monthlyTypeStats.slice(0, 3).map(type => (
 <div key={type.name} className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
 <span className="text-sm text-foreground">{type.name}</span>
 </div>
 <span className="text-sm font-medium text-foreground">{type.count}</span>
 </div>
 ))}
 </div>
 )}
 </>
 );
})()}
 </div>
 </div>

 {/* Date sélectionnée */}
 {selectedDate && (
 <div className="bg-card border border-border rounded-xl shadow-md p-4 lg:p-6">
 <h3 className="text-base lg:text-lg font-bold text-foreground mb-4">
 {formatDate(selectedDate)}
 </h3>
 <div className="space-y-2">
 {(() => {
 if (selectedDateWorkouts.length === 0) {
 return (
 <div className="text-center py-6 text-muted-foreground">
 <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
 <p>Aucune séance planifiée</p>
 </div>
 );
}
 return selectedDateWorkouts.map(workout => (
 <div key={workout.id} className="p-2 bg-muted rounded-lg flex flex-col gap-1">
 <h4 className="font-medium text-foreground">
 {workout.name}
 </h4>
 <Badge className={`text-white ${getTypeColor(getCorrectType(workout))}`}>
 {getCorrectType(workout)}
 </Badge>
 {workout.duration && (
 <span className="flex items-center space-x-1 text-sm text-muted-foreground">
 <Clock className="h-4 w-4" />
 <span>{workout.duration} min</span>
 </span>
 )}
 {workout.isPartnerWorkout && (
 <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">
 Partenaire
 </Badge>
 )}
 </div>
 ));
})()}
 </div>
 <Button
 onClick={() => router.push('/workouts/new')}
 className="mt-4 min-h-[44px] w-full"
 >
 <Plus className="h-5 w-5" />
 <span>Ajouter une séance</span>
 </Button>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </>
 )
}
