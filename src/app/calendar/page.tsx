'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Dumbbell,
  CheckCircle,
  Target,
  Info,
  Activity,
  Waves,
  Zap,
  Flower,
  Smile,
  Menu,
  List,
  X
} from 'lucide-react'
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
  { name: 'Musculation', color: 'bg-orange-500', icon: Dumbbell },
  { name: 'Cardio', color: 'bg-blue-500', icon: Clock },
  { name: 'Étirement', color: 'bg-green-500', icon: Target },
  { name: 'Cours collectif', color: 'bg-purple-500', icon: Users },
  { name: 'Gainage', color: 'bg-yellow-500', icon: Activity },
  { name: 'Natation', color: 'bg-cyan-500', icon: Waves },
  { name: 'Crossfit', color: 'bg-red-500', icon: Zap },
  { name: 'Yoga', color: 'bg-pink-500', icon: Flower },
  { name: 'Pilates', color: 'bg-indigo-500', icon: Smile },
  { name: 'Repos', color: 'bg-gray-500', icon: CheckCircle }
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
}

// Fonction utilitaire pour formater en DD-MM-YYYY
function toDDMMYYYY(date: Date | string): string {
  if (typeof date === 'string') {
    // Si déjà au format DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) return date;
    // Si format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.split('-');
      return `${d}-${m}-${y}`;
    }
    // Sinon, tenter de parser
    date = new Date(date);
  }
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [partnersWorkouts, setPartnersWorkouts] = useState<WorkoutWithProfile[]>([])
  const [showPartnersWorkouts, setShowPartnersWorkouts] = useState(false)
  const [, setSharePlanning] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  
  // État pour la navigation swipe
  const [isSwipeTransition, setIsSwipeTransition] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

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
    const selected = toDDMMYYYY(date);
    return workouts.filter(workout => toDDMMYYYY(workout.scheduled_date) === selected);
  }



  const getTypeColor = (type: string) => {
    const workoutType = workoutTypes.find(wt => wt.name === type)
    return workoutType?.color || 'bg-gray-500'
  }

  // Système de couleurs modernes inspiré Apple/Fitness
  const getModernTypeColor = (type: string) => {
    const modernColors: Record<string, string> = {
      'Musculation': 'linear-gradient(135deg, #FF6B35, #F7931E)', // Orange dynamique
      'Cardio': 'linear-gradient(135deg, #4FC3F7, #29B6F6)',      // Bleu ciel
      'Étirement': 'linear-gradient(135deg, #81C784, #66BB6A)',   // Vert nature
      'Repos': 'linear-gradient(135deg, #90A4AE, #78909C)',       // Gris relaxant
      'Cours collectif': 'linear-gradient(135deg, #BA68C8, #AB47BC)', // Violet énergique
      'Gainage': 'linear-gradient(135deg, #FFB74D, #FFA726)',     // Orange chaud
      'Natation': 'linear-gradient(135deg, #4DD0E1, #26C6DA)',    // Cyan aquatique
      'Crossfit': 'linear-gradient(135deg, #E57373, #EF5350)',    // Rouge intense
      'Yoga': 'linear-gradient(135deg, #AED581, #9CCC65)',        // Vert zen
      'Pilates': 'linear-gradient(135deg, #F48FB1, #EC407A)'      // Rose doux
    }
    return modernColors[type] || modernColors['Musculation']
  }

  const getPartnerTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'bg-orange-500': 'linear-gradient(135deg, #e65100, #ff6f00)', // Musculation - orange foncé
      'bg-blue-500': 'linear-gradient(135deg, #0d47a1, #1976d2)',   // Cardio - bleu foncé
      'bg-green-500': 'linear-gradient(135deg, #1b5e20, #388e3c)',  // Étirement - vert foncé
      'bg-purple-500': 'linear-gradient(135deg, #4a148c, #7b1fa2)', // Cours collectif - violet foncé
      'bg-yellow-500': 'linear-gradient(135deg, #f57f17, #fbc02d)', // Gainage - jaune foncé
      'bg-cyan-500': 'linear-gradient(135deg, #006064, #00acc1)',   // Natation - cyan foncé
      'bg-red-500': 'linear-gradient(135deg, #b71c1c, #d32f2f)',    // Crossfit - rouge foncé
      'bg-pink-500': 'linear-gradient(135deg, #880e4f, #c2185b)',   // Yoga - rose foncé
      'bg-indigo-500': 'linear-gradient(135deg, #1a237e, #3f51b5)', // Pilates - indigo foncé
      'bg-gray-500': 'linear-gradient(135deg, #424242, #616161)'    // Repos - gris foncé
    }
    
    const baseColor = getTypeColor(type)
    return colorMap[baseColor] || 'linear-gradient(135deg, #424242, #616161)'
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

  const handlePanEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50 // Distance minimale pour déclencher swipe
    const velocityThreshold = 500 // Vélocité minimale
    
    const { offset, velocity } = info
    
    // Détection swipe horizontal uniquement
    if (Math.abs(offset.x) > Math.abs(offset.y) && 
        (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold)) {
      
      if (offset.x > 0) {
        handleSwipeNavigation('right') // Swipe vers droite
      } else {
        handleSwipeNavigation('left')  // Swipe vers gauche
      }
    }
  }, [handleSwipeNavigation])

  // Calculs statistiques avancés pour le mois courant
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const workoutsMonth = workouts.filter(w => {
    const d = new Date(w.scheduled_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const totalSeances = workoutsMonth.length;
  const totalDurees = workoutsMonth.reduce((acc, w) => acc + (w.duration || 0), 0);
  const moyenneDuree = totalSeances > 0 ? Math.round(totalDurees / totalSeances) : 0;
  const maxDuree = Math.max(...workoutsMonth.map(w => w.duration || 0), 0);
  const durationsWithValue = workoutsMonth.map(w => w.duration || 0).filter(x => x > 0);
  const minDuree = durationsWithValue.length > 0 ? Math.min(...durationsWithValue) : 0;
  const seanceMax = workoutsMonth.find(w => (w.duration || 0) === maxDuree);
  const seanceMin = workoutsMonth.find(w => (w.duration || 0) === minDuree && (w.duration || 0) > 0);
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

  const repartitionTypes = workoutTypes.map(type => ({
    name: type.name,
    count: workoutsMonth.filter(w => getCorrectType(w) === type.name).length
  }));
  
  
  // Calcul des séances terminées (incluant celles avec dates passées)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Réinitialiser à minuit pour une comparaison correcte
  const seancesTerminees = workoutsMonth.filter(w => {
    const workoutDate = new Date(w.scheduled_date);
    workoutDate.setHours(0, 0, 0, 0);
    return w.status === 'Terminé' || w.status === 'Réalisé' || (workoutDate < today && (w.status === 'Planifié' || w.status === 'Planifie'));
  }).length;
  
  // Calcul des séances planifiées (futures uniquement)
  const seancesPlanifiees = workoutsMonth.filter(w => {
    const workoutDate = new Date(w.scheduled_date);
    workoutDate.setHours(0, 0, 0, 0);
    return (w.status === 'Planifié' || w.status === 'Planifie') && workoutDate >= today;
  }).length;
  
  // Temps total des séances terminées ou passées
  const tempsTotal = workoutsMonth.filter(w => {
    const workoutDate = new Date(w.scheduled_date);
    workoutDate.setHours(0, 0, 0, 0);
    return w.status === 'Terminé' || w.status === 'Réalisé' || (workoutDate < today && (w.status === 'Planifié' || w.status === 'Planifie'));
  }).reduce((total, w) => total + (w.duration || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Calendrier</h1>
              <p className="text-orange-100 text-sm sm:text-base">Planifie et organise tes séances</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Bouton vue mobile */}
              <button
                onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                className="lg:hidden bg-white/10 text-orange-100 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                title={viewMode === 'calendar' ? 'Passer en vue liste' : 'Passer en vue calendrier'}
              >
                {viewMode === 'calendar' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <CalendarIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {viewMode === 'calendar' ? 'Liste' : 'Calendrier'}
                </span>
              </button>
              
              {/* Bouton sidebar mobile/tablette */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="xl:hidden bg-white/10 text-orange-100 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                title="Afficher les statistiques"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              
              <button
                onClick={() => {
                  if (partnersWorkouts.length === 0) {
                    router.push('/training-partners');
                  } else {
                    setShowPartnersWorkouts(!showPartnersWorkouts);
                  }
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                  showPartnersWorkouts 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-white/10 text-orange-100 hover:bg-white/20'
                }`}
                title={
                  partnersWorkouts.length === 0 
                    ? 'Aucune séance partagée disponible - Gérer mes partenaires' 
                    : (showPartnersWorkouts ? 'Masquer les séances des partenaires' : 'Afficher les séances des partenaires')
                }
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Partenaires</span>
                <span className="sm:hidden">Part.</span>
                {partnersWorkouts.length > 0 ? (
                  <span className="bg-white/20 text-white rounded-full px-2 py-0.5 text-xs">
                    {partnersWorkouts.length}
                  </span>
                ) : (
                  <span className="bg-white/20 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                    0
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/workouts/new')}
                className="bg-white text-orange-600 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="hidden sm:inline">Nouvelle séance</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          {/* Calendrier et Vue Liste */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-6">
              {viewMode === 'calendar' ? (
                <>
                  {/* Navigation du calendrier améliorée */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <motion.button
                      onClick={() => !isSwipeTransition && handleSwipeNavigation('right')}
                      className="p-3 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                      whileTap={{ scale: 0.95 }}
                      disabled={isSwipeTransition}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    
                    <motion.h2 
                      key={monthName}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-xl sm:text-2xl font-bold text-gray-900 capitalize"
                    >
                      {monthName}
                    </motion.h2>
                    
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all touch-manipulation"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="hidden sm:inline">Aujourd'hui</span>
                        <span className="sm:hidden">Auj.</span>
                      </motion.button>
                      
                      <motion.button
                        onClick={() => !isSwipeTransition && handleSwipeNavigation('left')}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                        whileTap={{ scale: 0.95 }}
                        disabled={isSwipeTransition}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Grille du calendrier avec navigation swipe */}
                  <motion.div 
                    ref={calendarRef}
                    className="grid grid-cols-7 gap-1 touch-pan-y"
                    onPanEnd={handlePanEnd}
                    drag={false}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  >
                    {/* En-têtes des jours - Standard européen/belge (Lundi premier) */}
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}

                    {/* Jours du mois */}
                    {days.map((day, index) => {
                      let sessions: CalendarSession[] = [];
                      const dayYMD = formatDateToYMD(day.date);
                      
                      // Séances personnelles avec couleurs modernes
                      const workoutsForDate = workouts.filter(w => w.scheduled_date === dayYMD);
                      const personalSessions = workoutsForDate.map(w => {
                        const correctedType = getCorrectType(w);
                        const modernColor = getModernTypeColor(correctedType);
                        
                        return {
                          id: String(w.id),
                          name: w.name,
                          type: (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                          status: w.status as 'Planifié' | 'Terminé' | 'Annulé',
                          duration: w.duration,
                          isShared: false,
                          participants: [],
                          scheduled_date: w.scheduled_date,
                          time: (w as { time?: string }).time || '',
                          exercises: w.exercises || [],
                          color: modernColor, // Nouvelle couleur moderne Apple-style
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
                          
                          // Couleur différente pour les séances partagées (dégradé plus sombre)
                          const partnerColor = getPartnerTypeColor(correctedType);
                          
                          return {
                            id: `partner-${pw.id}`,
                            name: `👥 ${pw.name}`, // Préfixe pour identifier visuellement
                            type: (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                            status: pw.status as 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé',
                            duration: pw.duration,
                            isShared: true,
                            participants: [participant],
                            scheduled_date: pw.scheduled_date,
                            time: pw.start_time || '',
                            exercises: [],
                            color: partnerColor, // Couleur personnalisée pour les séances partagées
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
                          className={`cursor-pointer transition-all ${isCurrentDay ? 'ring-2 ring-orange-500' : ''} ${isSelectedDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                        >
                          <CalendarDayCell date={day.date.getDate()} sessions={sessions} />
                        </div>
                      );
                      return cell;
                    })}
                  </motion.div>
                  
                  {/* Indicateur swipe pour mobile */}
                  <div className="block sm:hidden mt-4 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                      <span>←</span>
                      <span>Glissez pour naviguer</span>
                      <span>→</span>
                    </p>
                  </div>
                </>
              ) : (
                /* Vue liste mobile */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Vue agenda</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-lg font-medium capitalize px-4">{monthName}</span>
                      <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {(() => {
                      // Récupérer toutes les séances du mois avec dates
                      const monthWorkouts = workouts.filter(w => {
                        const date = new Date(w.scheduled_date);
                        return date.getFullYear() === currentDate.getFullYear() && 
                               date.getMonth() === currentDate.getMonth();
                      }).sort((a, b) => {
                        const dateA = new Date(a.scheduled_date);
                        const dateB = new Date(b.scheduled_date);
                        if (dateA.getTime() !== dateB.getTime()) {
                          return dateA.getTime() - dateB.getTime();
                        }
                        // Si même jour, trier par heure si disponible
                        const timeA = (a as { time?: string }).time || '';
                        const timeB = (b as { time?: string }).time || '';
                        return timeA.localeCompare(timeB);
                      });
                      
                      if (monthWorkouts.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-500">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Aucune séance planifiée</p>
                            <p className="text-sm">Commence par ajouter une séance !</p>
                          </div>
                        );
                      }
                      
                      return monthWorkouts.map(workout => {
                        const date = new Date(workout.scheduled_date);
                        const correctedType = getCorrectType(workout);
                        const typeObj = workoutTypes.find(t => t.name === correctedType);
                        const Icon = typeObj?.icon;
                        
                        return (
                          <div key={workout.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {Icon && <Icon className="h-5 w-5 text-orange-600" />}
                                <div>
                                  <h3 className="font-semibold text-gray-900">{workout.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    {date.toLocaleDateString('fr-FR', { 
                                      weekday: 'long', 
                                      day: 'numeric', 
                                      month: 'long' 
                                    })}
                                    {(workout as { time?: string }).time && ` à ${(workout as { time?: string }).time?.slice(0,5)}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(correctedType)}`}>
                                  {correctedType}
                                </span>
                                {workout.duration && (
                                  <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    {workout.duration}min
                                  </span>
                                )}
                              </div>
                            </div>
                            {workout.exercises && workout.exercises.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <strong>Exercices :</strong> {workout.exercises.slice(0, 3).join(', ')}
                                {workout.exercises.length > 3 && ` +${workout.exercises.length - 3} autres`}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Panneau latéral - Visible sur desktop, caché sur mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden xl:block space-y-6"
          >
            {/* Date sélectionnée */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">
                  {formatDate(selectedDate)}
                </h3>
                <div className="space-y-3">
                  {(() => {
                    let sessions: CalendarSession[] = [];
                    const dayYMD = formatDateToYMD(selectedDate);
                    
                    // Séances personnelles
                    const personalSessions = getWorkoutsForDate(selectedDate).map(workout => ({
                      id: `perso-${String(workout.id)}`,
                      name: workout.name,
                      type: getCorrectType(workout) as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                      status: workout.status,
                      duration: workout.duration,
                      isShared: false,
                      participants: [],
                      scheduled_date: workout.scheduled_date,
                      time: (workout as { time?: string }).time || '',
                      exercises: workout.exercises || [],
                    }));

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
                        
                        return {
                          id: `partner-${pw.id}`,
                          name: `👥 ${pw.name}`,
                          type: (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                          status: pw.status as 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé',
                          duration: pw.duration,
                          isShared: true,
                          participants: [participant],
                          scheduled_date: pw.scheduled_date,
                          time: pw.start_time || '',
                          exercises: [],
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
                    
                    if (sessions.length === 0) {
                      return (
                        <div className="text-center py-6 text-gray-500">
                          <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>Aucune séance planifiée</p>
                        </div>
                      );
                    }
                    return sessions.map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            {item.name}
                            {item.isShared && <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold ml-2">👥 Partagée</span>}
                          </h4>
                          <div className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`} title={`Type: ${item.type}`} />
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getTypeColor(item.type)}`}>{item.type}</span>
                        {item.duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.duration} min</span>
                          </span>
                        )}
                        {item.time && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.time}</span>
                          </span>
                        )}
                        {item.participants && item.participants.length > 0 && item.participants[0] && (
                          <span className="ml-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="text-blue-600">👥</span>
                            Partagée avec {item.participants.map(p => p.name || 'Utilisateur IronTrack').join(', ')}
                          </span>
                        )}
                        {item.exercises && item.exercises.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            {item.exercises.slice(0, 2).join(', ')}
                            {item.exercises.length > 2 && ` +${item.exercises.length - 2}`}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
                <button
                  onClick={() => router.push('/workouts/new')}
                  className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter une séance</span>
                </button>
              </div>
            )}

            {/* Statistiques du mois */}
            <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-orange-500" /> Ce mois
                <div className="group relative">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Statistiques basées sur vos séances du mois courant
                  </div>
                </div>
              </h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Séances terminées</span>
                  <div className="group relative">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-5 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Séances terminées + séances passées
                    </div>
                  </div>
                  <span className="ml-auto bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                    {seancesTerminees}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Séances planifiées</span>
                  <div className="group relative">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-5 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Séances futures à venir
                    </div>
                  </div>
                  <span className="ml-auto bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                    {seancesPlanifiees}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <span className="text-gray-700">Temps total</span>
                  <div className="group relative">
                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    <div className="absolute bottom-5 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Durée des séances effectuées
                    </div>
                  </div>
                  <span className="ml-auto bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                    {tempsTotal} min
                  </span>
                </div>
                <hr className="my-2" />
                <div className="text-sm text-gray-700 font-semibold mb-1">Statistiques avancées</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Total séances</span>
                    <span className="font-bold text-gray-900 text-lg">{totalSeances}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Durée moyenne</span>
                    <span className="font-bold text-gray-900 text-lg">{moyenneDuree} min</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs text-gray-500">Séance la plus longue</span>
                    <span className="font-bold text-orange-700 text-base">{maxDuree > 0 && seanceMax ? `${seanceMax.name} (${maxDuree} min)` : '-'}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-xs text-gray-500">Séance la plus courte</span>
                    <span className="font-bold text-orange-700 text-base">{minDuree > 0 && seanceMin ? `${seanceMin.name} (${minDuree} min)` : '-'}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-semibold">Répartition par type :</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {repartitionTypes.map(type => {
                      const typeObj = workoutTypes.find(t => t.name === type.name)
                      const Icon = typeObj?.icon
                      return (
                        <span key={type.name} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow ${typeObj?.color} bg-opacity-20 text-gray-800`}>
                          {Icon && <Icon className="h-4 w-4 mr-1" />} {type.name} : {type.count}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Aide partage */}
            {partnersWorkouts.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Info className="h-4 lg:h-5 w-4 lg:w-5" />
                  Séances partagées
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>
                    <strong>Aucune séance partagée disponible.</strong>
                  </p>
                  <div className="space-y-2">
                    <p>Pour voir les séances de tes partenaires :</p>
                    <ul className="ml-4 space-y-1">
                      <li>• Assure-toi d'avoir des partenaires acceptés</li>
                      <li>• Vérifie que tes partenaires ont activé le partage des entraînements</li>
                      <li>• Demande-leur de configurer leurs paramètres de partage</li>
                    </ul>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => router.push('/training-partners')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Gérer mes partenaires
                    </button>
                    <button
                      onClick={() => router.push('/shared/dashboard')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Dashboard partage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Légende */}
            <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Légende</h3>
              
              <div className="space-y-2">
                {workoutTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <div key={type.name} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-xs sm:text-sm text-gray-600">{type.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sidebar Mobile/Tablette Modal/Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileSidebar(false)}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Statistiques</h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Contenu */}
            <div className="p-4 space-y-6">
              {/* Date sélectionnée */}
              {selectedDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {formatDate(selectedDate)}
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      let sessions: CalendarSession[] = [];
                      const dayYMD = formatDateToYMD(selectedDate);
                      
                      // Séances personnelles
                      const personalSessions = getWorkoutsForDate(selectedDate).map(workout => ({
                        id: `perso-${String(workout.id)}`,
                        name: workout.name,
                        type: getCorrectType(workout) as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                        status: workout.status,
                        duration: workout.duration,
                        isShared: false,
                        participants: [],
                        scheduled_date: workout.scheduled_date,
                        time: (workout as { time?: string }).time || '',
                        exercises: workout.exercises || [],
                      }));

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
                          
                          return {
                            id: `partner-${pw.id}`,
                            name: `👥 ${pw.name}`,
                            type: (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                            status: pw.status as 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé',
                            duration: pw.duration,
                            isShared: true,
                            participants: [participant],
                            scheduled_date: pw.scheduled_date,
                            time: pw.start_time || '',
                            exercises: [],
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
                      
                      if (sessions.length === 0) {
                        return (
                          <div className="text-center py-6 text-gray-500">
                            <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Aucune séance planifiée</p>
                          </div>
                        );
                      }
                      return sessions.map(item => (
                        <div key={item.id} className="p-3 bg-white rounded-lg border flex flex-col gap-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {item.name}
                              {item.isShared && <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold ml-2">👥 Partagée</span>}
                            </h4>
                            <div className={`w-3 h-3 rounded-full ${getTypeColor(item.type)}`} title={`Type: ${item.type}`} />
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getTypeColor(item.type)}`}>{item.type}</span>
                          {item.duration && (
                            <span className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{item.duration} min</span>
                            </span>
                          )}
                          {item.time && (
                            <span className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{item.time}</span>
                            </span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileSidebar(false);
                      router.push('/workouts/new');
                    }}
                    className="w-full mt-4 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Ajouter une séance</span>
                  </button>
                </div>
              )}

              {/* Statistiques du mois */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-orange-500" /> Ce mois
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Terminées</span>
                    </div>
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">
                      {seancesTerminees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">Planifiées</span>
                    </div>
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
                      {seancesPlanifiees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-700">Temps total</span>
                    </div>
                    <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">
                      {tempsTotal} min
                    </span>
                  </div>
                </div>
                
                {/* Répartition par type en version compacte */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Types d'exercices</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {repartitionTypes.filter(type => type.count > 0).map(type => {
                      const typeObj = workoutTypes.find(t => t.name === type.name)
                      const Icon = typeObj?.icon
                      return (
                        <div key={type.name} className="flex items-center gap-2 p-2 bg-white rounded border">
                          {Icon && <Icon className="h-4 w-4 text-gray-600" />}
                          <span className="text-sm">{type.name}</span>
                          <span className="ml-auto font-bold text-orange-600">{type.count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 