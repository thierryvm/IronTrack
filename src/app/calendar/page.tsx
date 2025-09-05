'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'

// Import statique pour éviter les erreurs webpack
import { ClientOnlyIcon } from '@/components/ui/ClientOnlyIcons'


// MIGRATION SHADCN/UI CALENDAR
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import CalendarDayCell from '@/components/ui/CalendarDayCell';

interface Workout {
  id: number
  user_id: string
  scheduled_date: string
  name: string
  type: 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates'
  status: 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé'
  duration?: number
  exercises?: string[]
  notes?: string
  start_time?: string
  end_time?: string
  created_at?: string
  updated_at?: string
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
  { name: 'Musculation', color: 'bg-orange-600', iconName: 'Dumbbell' },
  { name: 'Cardio', color: 'bg-blue-500', iconName: 'Clock' },
  { name: 'Étirement', color: 'bg-green-500', iconName: 'Target' },
  { name: 'Cours collectif', color: 'bg-purple-500', iconName: 'Users' },
  { name: 'Gainage', color: 'bg-yellow-500', iconName: 'Activity' },
  { name: 'Natation', color: 'bg-cyan-500', iconName: 'Waves' },
  { name: 'Crossfit', color: 'bg-red-500', iconName: 'Zap' },
  { name: 'Yoga', color: 'bg-pink-500', iconName: 'Flower' },
  { name: 'Pilates', color: 'bg-indigo-500', iconName: 'Smile' },
  { name: 'Repos', color: 'bg-gray-500', iconName: 'CheckCircle' }
]


// Type commun pour les séances du calendrier
interface CalendarSession {
  id: string;
  name: string;
  type: 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates';
  status: 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé';
  duration?: number;
  isShared: boolean;
  participants: { id: string; name: string; avatarUrl: string }[];
  time: string;
  exercises: string[];
  scheduled_date: string;
  color?: string;
}


// Ajoute une fonction utilitaire pour formater une date JS en 'YYYY-MM-DD' en local (pas UTC)
function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayNum = String(date.getDate()).padStart(2, '0');
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
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'stats'>('calendar')
  
  // État pour la navigation swipe
  const [isSwipeTransition, setIsSwipeTransition] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Fonctions de navigation swipe (Apple pattern)
  const handleSwipeNavigation = useCallback((direction: 'left' | 'right') => {
    if (isSwipeTransition) return
    
    setIsSwipeTransition(true)
    const newDate = new Date(currentDate)
    
    if (direction === 'left') {
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
    const startX = parseFloat(calendarRef.current.dataset.startX || '0')
    const startY = parseFloat(calendarRef.current.dataset.startY || '0')
    const startTime = parseInt(calendarRef.current.dataset.startTime || '0')
    
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
        handleSwipeNavigation('left')  // Swipe vers gauche = mois suivant
      }
    }
    
    // Nettoyer les données
    delete calendarRef.current.dataset.startX
    delete calendarRef.current.dataset.startY
    delete calendarRef.current.dataset.startTime
  }, [handleSwipeNavigation, isSwipeTransition])

  // Charger les séances personnelles
  const loadWorkouts = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: workoutsData } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true });
    
    if (workoutsData) {
      setWorkouts(workoutsData);
    }
  }, []);

  // Charger les séances des partenaires
  const loadPartnersWorkouts = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Récupérer les partenaires acceptés avec leurs séances partagées
    const { data: partnersData } = await supabase
      .from('training_partners')
      .select(`
        *,
        requester:requester_id(id, pseudo, full_name, email, avatar_url),
        partner:partner_id(id, pseudo, full_name, email, avatar_url)
      `)
      .or(`requester_id.eq.${user.id},partner_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (!partnersData || partnersData.length === 0) {
      setPartnersWorkouts([]);
      return;
    }

    const partnerIds = partnersData.map(p => 
      p.requester_id === user.id ? p.partner_id : p.requester_id
    );

    // Récupérer les paramètres de partage pour chaque partenaire
    const { data: sharingSettings } = await supabase
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
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select(`
        *,
        profiles:user_id(id, pseudo, full_name, email, avatar_url)
      `)
      .in('user_id', sharingPartnerIds)
      .order('scheduled_date', { ascending: true });

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, email, pseudo')
        .eq('id', user.id)
        .single();
      if (profile) {
        if (!profile.pseudo || profile.pseudo.trim() === '') {
          const pseudo = (profile.email && profile.email.split('@')[0]) || 'Utilisateur IronTrack';
          await supabase
            .from('profiles')
            .update({ pseudo })
            .eq('id', user.id);
        }
      }
      const { data: settings } = await supabase
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
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Ajouter les jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Compléter avec les jours du mois suivant pour faire 42 jours (6 semaines)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }

  const getWorkoutsForDate = (date: Date) => {
    const selected = formatDateToYMD(date);
    return workouts.filter(workout => workout.scheduled_date === selected);
  }

  const getTypeColor = (type: string) => {
    const workoutType = workoutTypes.find(wt => wt.name === type)
    return workoutType?.color || 'bg-gray-500'
  }

  // Conversion des classes CSS vers gradients pour le calendrier
  const getSessionGradient = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-orange-600': 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', // Musculation
      'bg-blue-500': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',   // Cardio
      'bg-green-500': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',  // Étirement
      'bg-purple-500': 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)', // Cours collectif
      'bg-yellow-500': 'linear-gradient(135deg, #eab308 0%, #facc15 100%)', // Gainage
      'bg-cyan-500': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',   // Natation
      'bg-red-500': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',    // Crossfit
      'bg-pink-500': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',   // Yoga
      'bg-indigo-500': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Pilates
      'bg-gray-500': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',   // Repos
    }
    const colorClass = getTypeColor(type)
    return colorMap[colorClass] || colorMap['bg-gray-500']
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Fonction pour corriger automatiquement le type basé sur le nom
  const getCorrectType = (workout: Workout): string => {
    const name = workout.name.toLowerCase();
    if (name.includes('cardio')) return 'Cardio';
    if (name.includes('étirement') || name.includes('etirement') || name.includes('stretch')) return 'Étirement';
    if (name.includes('cours') || name.includes('collectif') || name.includes('group')) return 'Cours collectif';
    if (name.includes('gainage') || name.includes('core') || name.includes('abs')) return 'Gainage';
    if (name.includes('natation') || name.includes('piscine') || name.includes('swim')) return 'Natation';
    if (name.includes('crossfit') || name.includes('cross fit') || name.includes('wod')) return 'Crossfit';
    if (name.includes('yoga')) return 'Yoga';
    if (name.includes('pilates')) return 'Pilates';
    if (name.includes('repos') || name.includes('rest')) return 'Repos';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Calendrier</h1>
              <p className="text-orange-100 text-sm sm:text-base">Planifie et organise tes séances</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                onClick={() => {
                  if (partnersWorkouts.length === 0) {
                    router.push('/training-partners');
                  } else {
                    setShowPartnersWorkouts(!showPartnersWorkouts);
                  }
                }}
                variant="outline"
                className="bg-white dark:bg-gray-800 border-white dark:border-gray-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                title={
                  partnersWorkouts.length === 0 
                    ? 'Aucune séance partagée disponible - Gérer mes partenaires' 
                    : (showPartnersWorkouts ? 'Masquer les séances des partenaires' : 'Afficher les séances des partenaires')
                }
              >
                <span className="text-sm font-bold">👥</span>
                <span className="hidden sm:inline">Partenaires</span>
                <span className="sm:hidden">Part.</span>
                {partnersWorkouts.length > 0 ? (
                  <span className="bg-orange-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm">
                    {partnersWorkouts.length}
                  </span>
                ) : (
                  <span className="bg-gray-400 dark:bg-gray-600 text-white rounded-full px-2 py-0.5 text-xs font-bold shadow-sm">
                    0
                  </span>
                )}
              </Button>
              <Button
                onClick={() => router.push('/workouts/new')}
                className="bg-orange-600 dark:bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-700 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base min-h-[44px] touch-manipulation text-white shadow-sm transition-colors"
              >
                <ClientOnlyIcon name="Plus" className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="hidden sm:inline">Nouvelle séance</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          {/* Calendrier et Vue Liste */}
          <div className="xl:col-span-2">
            <Card className="p-3 sm:p-6">
              {/* ShadCN UI Tabs Component - 3 onglets sur mobile */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'list' | 'stats')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 xl:grid-cols-2 md:grid-cols-3 mb-6">
                  <TabsTrigger value="calendar" className="flex items-center space-x-2">
                    <ClientOnlyIcon name="CalendarIcon" className="h-4 w-4" />
                    <span>Calendrier</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center space-x-2">
                    <ClientOnlyIcon name="List" className="h-4 w-4" />
                    <span>Liste</span>
                  </TabsTrigger>
                  {/* Troisième onglet Stats pour mobile/tablette */}
                  <TabsTrigger value="stats" className="xl:hidden flex items-center space-x-2">
                    <ClientOnlyIcon name="Activity" className="h-4 w-4" />
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
                        className="p-3 touch-manipulation"
                      >
                        <ClientOnlyIcon name="ChevronLeft" className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                      {monthName}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <div>
                        <Button
                          onClick={() => setCurrentDate(new Date())}
                          className="bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white text-sm font-semibold shadow-md hover:shadow-lg touch-manipulation"
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
                          className="p-3 touch-manipulation"
                        >
                          <ClientOnlyIcon name="ChevronRight" className="h-5 w-5" />
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
                    style={{ touchAction: 'pan-y pinch-zoom' }}
                  >
                    {/* En-têtes des jours - Standard européen/belge (Lundi premier) */}
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
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
                        
                        const sessionType = (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates';
                        return {
                          id: String(w.id),
                          name: w.name,
                          type: sessionType,
                          status: w.status as 'Planifié' | 'Terminé' | 'Annulé',
                          duration: w.duration,
                          isShared: false,
                          participants: [],
                          scheduled_date: w.scheduled_date,
                          time: (w as { time?: string }).time || '',
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
                            id: partner?.id || '',
                            name: partner?.pseudo || partner?.full_name || (partner?.email && partner.email.split('@')[0]) || 'Partenaire',
                            avatarUrl: partner?.avatar_url || '/default-avatar.png',
                          };
                          const correctedType = getCorrectType(pw);
                          const partnerSessionType = (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates';
                          
                          return {
                            id: `partner-${pw.id}`,
                            name: `${pw.name}`,
                            type: partnerSessionType,
                            status: pw.status as 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé',
                            duration: pw.duration,
                            isShared: true,
                            participants: [participant],
                            scheduled_date: pw.scheduled_date,
                            time: pw.start_time || '',
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
                              ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                              : isCurrentDay 
                                ? 'ring-2 ring-orange-500 dark:ring-orange-400' 
                                : ''
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Séances planifiées</h3>
                      <Button
                        onClick={() => router.push('/workouts/new')}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <ClientOnlyIcon name="Plus" className="h-4 w-4 mr-1" />
                        Nouvelle séance
                      </Button>
                    </div>
                    
{(() => {
                      // Combiner séances personnelles et partenaires avec identification
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Début de la journée
                      
                      const personalWorkouts = workouts
                        .filter(workout => new Date(workout.scheduled_date) >= today)
                        .map(workout => ({ ...workout, isPartnerWorkout: false }));
                        
                      const partnerWorkouts = partnersWorkouts
                        .filter(workout => new Date(workout.scheduled_date) >= today)
                        .map(workout => ({ ...workout, isPartnerWorkout: true }));
                        
                      const allUpcomingWorkouts = [...personalWorkouts, ...partnerWorkouts]
                        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
                      

                      return allUpcomingWorkouts.length === 0 ? (
                        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                          <ClientOnlyIcon name="CalendarIcon" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Aucune séance planifiée</p>
                          <p className="text-sm">Créez votre première séance pour commencer</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {allUpcomingWorkouts.slice(0, 10).map(workout => (
                            <div key={`${workout.isPartnerWorkout ? 'partner-' : 'personal-'}${workout.id}`} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className={`w-3 h-3 rounded-full ${getTypeColor(getCorrectType(workout))}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{workout.name}</h4>
                                  {workout.isPartnerWorkout && (
                                    <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded-full">
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                      </svg>
                                      {workout.profiles?.pseudo || workout.profiles?.full_name || 'Partenaire'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(workout.scheduled_date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
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
                    })()}
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="m-0 xl:hidden">
                  {/* Vue stats simplifiée */}
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    <ClientOnlyIcon name="Activity" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Statistiques</p>
                    <p className="text-sm">Fonctionnalité disponible prochainement</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Panneau latéral simple */}
          <div className="space-y-6">
            {/* Statistiques mensuelles */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Statistiques {monthName}
              </h3>
              <div className="space-y-4">
                {(() => {
                  const currentMonthWorkouts = workouts.filter(workout => {
                    const workoutDate = new Date(workout.scheduled_date);
                    return workoutDate.getMonth() === currentDate.getMonth() && 
                           workoutDate.getFullYear() === currentDate.getFullYear();
                  });
                  
                  const completedWorkouts = currentMonthWorkouts.filter(w => w.status === 'Terminé' || w.status === 'Réalisé').length;
                  const plannedWorkouts = currentMonthWorkouts.filter(w => w.status === 'Planifié' || w.status === 'Planifie').length;
                  
                  const typeStats = workoutTypes.map(type => ({
                    ...type,
                    count: currentMonthWorkouts.filter(w => getCorrectType(w) === type.name).length
                  })).filter(type => type.count > 0);

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedWorkouts}</div>
                          <div className="text-xs text-green-700 dark:text-green-300">Terminées</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{plannedWorkouts}</div>
                          <div className="text-xs text-orange-700 dark:text-orange-300">Planifiées</div>
                        </div>
                      </div>
                      
                      {typeStats.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Types d'entraînements</h4>
                          {typeStats.slice(0, 3).map(type => (
                            <div key={type.name} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{type.name}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{type.count}</span>
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
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {formatDate(selectedDate)}
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const workoutsForDate = getWorkoutsForDate(selectedDate);
                    
                    if (workoutsForDate.length === 0) {
                      return (
                        <div className="text-center py-6 text-gray-600 dark:text-gray-400">
                          <ClientOnlyIcon name="CalendarIcon" className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Aucune séance planifiée</p>
                        </div>
                      );
                    }
                    return workoutsForDate.map(workout => (
                      <div key={workout.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col gap-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {workout.name}
                        </h4>
                        <Badge className={`text-white ${getTypeColor(getCorrectType(workout))}`}>
                          {getCorrectType(workout)}
                        </Badge>
                        {workout.duration && (
                          <span className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                            <ClientOnlyIcon name="Clock" className="h-4 w-4" />
                            <span>{workout.duration} min</span>
                          </span>
                        )}
                      </div>
                    ));
                  })()}
                </div>
                <button
                  onClick={() => router.push('/workouts/new')}
                  className="w-full mt-4 bg-orange-600 dark:bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 min-h-[44px] touch-manipulation"
                >
                  <ClientOnlyIcon name="Plus" className="h-5 w-5" />
                  <span>Ajouter une séance</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}