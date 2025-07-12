'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  CheckCircle,
  Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import CalendarDayCell from '@/components/ui/CalendarDayCell';

interface Workout {
  id: number
  scheduled_date: string
  name: string
  type: 'Musculation' | 'Cardio' | 'Étirement' | 'Repos'
  status: 'Planifié' | 'Terminé' | 'Annulé'
  duration?: number
  exercises?: string[]
  notes?: string
}

const workoutTypes = [
  { name: 'Musculation', color: 'bg-orange-500', icon: Dumbbell },
  { name: 'Cardio', color: 'bg-blue-500', icon: Clock },
  { name: 'Étirement', color: 'bg-green-500', icon: Target },
  { name: 'Repos', color: 'bg-gray-500', icon: CheckCircle }
]

// Ajouter l'interface SharedWorkout
interface SharedWorkout {
  id: number;
  user_id: string;
  name: string;
  type: string;
  status: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    avatar_url?: string;
    full_name?: string;
    id?: string;
    pseudo?: string; // Added pseudo to the interface
    email?: string; // Added email to the interface
  };
}

// Type commun pour les séances du calendrier
interface CalendarSession {
  id: string;
  name: string;
  type: 'Musculation' | 'Cardio' | 'Étirement' | 'Repos';
  status: 'Planifié' | 'Terminé' | 'Annulé';
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
  }, []);
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([])
  const [userProfile, setUserProfile] = useState<{ avatar_url?: string; full_name?: string; pseudo?: string }>( {} );
  const [sharePlanning, setSharePlanning] = useState(false);

  useEffect(() => {
    loadWorkouts()
    loadSharedWorkouts()
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
        // Si pseudo est vide, on le remplit automatiquement
        if (!profile.pseudo || profile.pseudo.trim() === '') {
          const pseudo = (profile.email && profile.email.split('@')[0]) || 'Utilisateur IronTrack';
          await supabase
            .from('profiles')
            .update({ pseudo })
            .eq('id', user.id);
          // setUserProfile({ ...profile, pseudo }); // Variable inutilisée
        } else {
          // setUserProfile(profile); // Variable inutilisée
        }
      }
      // Récupérer la préférence de partage
      const { data: settings } = await supabase
        .from('user_settings')
        .select('share_planning')
        .eq('user_id', user.id)
        .single();
      setSharePlanning(!!settings?.share_planning);
    };
    fetchProfile();
  }, [router])

  useEffect(() => {
  }, [sharedWorkouts])

  const loadWorkouts = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true })
      if (!error && data) {
        setWorkouts(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error)
    }
  }

  const loadSharedWorkouts = async () => {
    try {
      const res = await fetch('/calendar/shared')
      const { workouts } = await res.json()
      setSharedWorkouts(workouts || [])
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux partagés:', error)
    }
  }

  // Après avoir récupéré les séances (workouts et sharedWorkouts)

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
    const selected = toDDMMYYYY(date);
    return sharedWorkouts.filter(sw => toDDMMYYYY(sw.scheduled_date) === selected);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-500'
      case 'Planifié': return 'bg-blue-500'
      case 'Annulé': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
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
  const minDuree = Math.min(...workoutsMonth.map(w => w.duration || 0).filter(x => x > 0), 0);
  const seanceMax = workoutsMonth.find(w => (w.duration || 0) === maxDuree);
  const seanceMin = workoutsMonth.find(w => (w.duration || 0) === minDuree);
  const repartitionTypes = workoutTypes.map(type => ({
    name: type.name,
    count: workoutsMonth.filter(w => w.type === type.name).length
  }));

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
                  if (sharePlanning) {
                    const sharedForDate = sharedWorkouts.filter(sw => sw.scheduled_date === dayYMD);
                    sessions = sharedForDate.map(sw => {
                      const participant = {
                        id: sw.user_id || sw.profiles?.id || '',
                        name: sw.profiles?.pseudo || sw.profiles?.full_name || (sw.profiles?.email && sw.profiles.email.split('@')[0]) || '',
                        avatarUrl: sw.profiles?.avatar_url || '/window.svg',
                      };
                      return {
                        id: `shared-${String(sw.id)}`,
                        name: sw.name,
                        type: (['Musculation', 'Cardio', 'Étirement', 'Repos'].includes(sw.type) ? sw.type : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos',
                        status: sw.status as 'Planifié' | 'Terminé' | 'Annulé',
                        duration: undefined,
                        isShared: true,
                        participants: [participant],
                        scheduled_date: sw.scheduled_date,
                        time: sw.start_time || '',
                        exercises: [],
                      };
                    });
                  } else {
                    const workoutsForDate = workouts.filter(w => w.scheduled_date === dayYMD);
                    sessions = workoutsForDate.map(w => ({
                      id: String(w.id),
                      name: w.name,
                      type: (['Musculation', 'Cardio', 'Étirement', 'Repos'].includes(w.type) ? w.type : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos',
                      status: w.status as 'Planifié' | 'Terminé' | 'Annulé',
                      duration: w.duration,
                      isShared: false,
                      participants: [],
                      scheduled_date: w.scheduled_date,
                      time: (w as { time?: string }).time || '',
                      exercises: w.exercises || [],
                    }));
                  }
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
                    if (sharePlanning) {
                      sessions = getSharedForDate(selectedDate).map(sw => ({
                        id: `shared-${String(sw.id)}`,
                        name: sw.name,
                        type: (['Musculation', 'Cardio', 'Étirement', 'Repos'].includes(sw.type) ? sw.type : 'Musculation') as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos',
                        status: sw.status as 'Planifié' | 'Terminé' | 'Annulé',
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
                      }));
                    } else {
                      sessions = getWorkoutsForDate(selectedDate).map(workout => ({
                        id: `perso-${String(workout.id)}`,
                        name: workout.name,
                        type: workout.type,
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
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
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
                          <span className="ml-2 text-xs text-gray-500">avec {item.participants.map(p => p.name).join(', ')}</span>
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
              </h3>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">Séances terminées</span>
                  <span className="ml-auto bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                    {workouts.filter(w => w.status === 'Terminé' && new Date(w.scheduled_date).getMonth() === currentDate.getMonth()).length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Séances planifiées</span>
                  <span className="ml-auto bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                    {workouts.filter(w => w.status === 'Planifié' && new Date(w.scheduled_date).getMonth() === currentDate.getMonth()).length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <span className="text-gray-700">Temps total</span>
                  <span className="ml-auto bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                    {workouts.filter(w => w.status === 'Terminé' && new Date(w.scheduled_date).getMonth() === currentDate.getMonth()).reduce((total, w) => total + (w.duration || 0), 0)} min
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