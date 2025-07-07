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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const router = useRouter()

  useEffect(() => {
    loadWorkouts()
  }, [])

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
    return workouts.filter(workout => {
      const wDate = new Date(workout.scheduled_date)
      return (
        wDate.getFullYear() === date.getFullYear() &&
        wDate.getMonth() === date.getMonth() &&
        wDate.getDate() === date.getDate()
      )
    })
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
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
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
                  const dayWorkouts = getWorkoutsForDate(day.date)
                  const isCurrentDay = isToday(day.date)
                  const isSelectedDay = isSelected(day.date)

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-all
                        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isCurrentDay ? 'ring-2 ring-orange-500' : ''}
                        ${isSelectedDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                        hover:bg-gray-50
                      `}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {day.date.getDate()}
                      </div>
                      
                      {/* Indicateurs de séances */}
                      <div className="space-y-1">
                        {dayWorkouts.slice(0, 2).map((workout) => (
                          <div
                            key={workout.id}
                            className={`h-2 rounded-full ${getTypeColor(workout.type)}`}
                            title={`${workout.name} - ${workout.status}`}
                          />
                        ))}
                        {dayWorkouts.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayWorkouts.length - 2}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
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
                  {getWorkoutsForDate(selectedDate).map(workout => (
                    <div key={workout.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{workout.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(workout.status)}`} />
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getTypeColor(workout.type)}`}>
                          {workout.type}
                        </span>
                        {workout.duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{workout.duration} min</span>
                          </span>
                        )}
                      </div>
                      {workout.exercises && (
                        <div className="mt-2 text-xs text-gray-500">
                          {workout.exercises.slice(0, 2).join(', ')}
                          {workout.exercises.length > 2 && ` +${workout.exercises.length - 2}`}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getWorkoutsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Aucune séance planifiée</p>
                    </div>
                  )}
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ce mois</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Séances terminées</span>
                  <span className="font-bold text-green-600">
                    {workouts.filter(w => w.status === 'Terminé' && new Date(w.scheduled_date).getMonth() === currentDate.getMonth()).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Séances planifiées</span>
                  <span className="font-bold text-blue-600">
                    {workouts.filter(w => w.status === 'Planifié' && new Date(w.scheduled_date).getMonth() === currentDate.getMonth()).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Temps total</span>
                  <span className="font-bold text-orange-600">
                    {workouts
                      .filter(w => w.status === 'Terminé' && new Date(w.scheduled_date).getMonth() === currentDate.getMonth())
                      .reduce((total, w) => total + (w.duration || 0), 0)} min
                  </span>
                </div>
                {/* Statistiques avancées */}
                <hr className="my-2" />
                <div className="text-sm text-gray-700 font-semibold mb-1">Statistiques avancées</div>
                <div className="flex items-center justify-between">
                  <span>Total séances</span>
                  <span>{totalSeances}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Durée moyenne</span>
                  <span>{moyenneDuree} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Séance la plus longue</span>
                  <span>{maxDuree > 0 && seanceMax ? `${seanceMax.name} (${maxDuree} min)` : '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Séance la plus courte</span>
                  <span>{minDuree > 0 && seanceMin ? `${seanceMin.name} (${minDuree} min)` : '-'}</span>
                </div>
                <div className="mt-2">
                  <span className="font-semibold">Répartition par type :</span>
                  <ul className="ml-2 mt-1">
                    {repartitionTypes.map(type => (
                      <li key={type.name} className="flex items-center text-xs">
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{backgroundColor: type.count > 0 ? undefined : '#e5e7eb'}}></span>
                        {type.name} : {type.count}
                      </li>
                    ))}
                  </ul>
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