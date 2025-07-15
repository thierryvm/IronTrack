'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
  Smile
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
  const [partnersWorkouts, setPartnersWorkouts] = useState<Workout[]>([])
  const [showPartnersWorkouts, setShowPartnersWorkouts] = useState(false)
  const [sharePlanning] = useState(false)

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

    // Récupérer les séances des partenaires avec vérification des paramètres de partage
    const { data: workoutsData } = await supabase
      .from('workouts')
      .select(`
        *,
        profiles:user_id(id, pseudo, full_name, email, avatar_url)
      `)
      .in('user_id', partnerIds)
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
      
      // Charger les données initiales selon le paramètre de partage
      if (shareEnabled) {
      } else {
        loadWorkouts();
        loadPartnersWorkouts();
      }
    };
    fetchProfile();
  }, [router, loadWorkouts, loadPartnersWorkouts])


  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Ajouter les jours du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Ajouter les jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Compléter avec les jours du mois suivant
    const remainingDays = 42 - days.length // 6 semaines * 7 jours
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

  // Ajout d'une fonction pour récupérer les créneaux partagés d'une date
  const getSharedForDate = (date: Date) => {
    const dateStr = toDDMMYYYY(date);
    return [];
  }


  const getTypeColor = (type: string) => {
    const workoutType = workoutTypes.find(wt => wt.name === type)
    return workoutType?.color || 'bg-gray-500'
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Calendrier</h1>
              <p className="text-orange-100">Planifie et organise tes séances</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPartnersWorkouts(!showPartnersWorkouts)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  showPartnersWorkouts 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-white/10 text-orange-100 hover:bg-white/20'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Partenaires</span>
              </button>
              <button
                onClick={() => router.push('/workouts/new')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Nouvelle séance</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Navigation du calendrier */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm font-semibold shadow hover:bg-orange-600 transition-colors"
                  >
                    Aujourd&apos;hui
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {/* En-têtes des jours */}
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
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
                      const correctedType = getCorrectType(pw as Workout);
                      return {
                        id: `partner-${pw.id}`,
                        name: pw.name,
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
              </div>
            </div>
          </motion.div>

          {/* Panneau latéral */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Date sélectionnée */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {formatDate(selectedDate)}
                </h3>
                <div className="space-y-3">
                  {(() => {
                    let sessions: CalendarSession[] = [];
                    // Training Partners view will be added here
                    if (false) {
                      sessions = getSharedForDate(selectedDate).map(sw => {
                        const correctedType = getCorrectType(sw as Workout);
                        return {
                        id: `shared-${String(sw.id)}`,
                        name: sw.name,
                        type: (['Musculation', 'Cardio', 'Étirement', 'Repos', 'Cours collectif', 'Gainage', 'Natation', 'Crossfit', 'Yoga', 'Pilates'].includes(correctedType) ? correctedType : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates',
                        status: sw.status as 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé',
                        duration: undefined,
                        isShared: true,
                        participants: [
                          {
                            id: sw.user_id || sw.profiles?.id || '',
                            name: sw.profiles?.pseudo || sw.profiles?.full_name || (sw.profiles?.email && sw.profiles.email.split('@')[0]) || '',
                            avatarUrl: sw.profiles?.avatar_url || '/window.svg',
                          }
                        ],
                        time: sw.start_time || '',
                        exercises: [],
                        scheduled_date: sw.scheduled_date
                      };
                      });
                    } else {
                      sessions = getWorkoutsForDate(selectedDate).map(workout => ({
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
                    }
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
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
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

            {/* Légende */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Légende</h3>
              
              <div className="space-y-2">
                {workoutTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <div key={type.name} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">{type.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 