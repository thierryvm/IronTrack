export interface UserProfileSummary {
  id: string
  pseudo: string | null
  full_name: string | null
  email: string
  avatar_url: string | null
}

export type WorkoutType =
  | 'Musculation'
  | 'Cardio'
  | 'Étirement'
  | 'Repos'
  | 'Cours collectif'
  | 'Gainage'
  | 'Natation'
  | 'Crossfit'
  | 'Yoga'
  | 'Pilates'

export type WorkoutStatus = 'Planifié' | 'Planifie' | 'Terminé' | 'Réalisé' | 'Annulé'

export interface Workout {
  id: number | string
  user_id: string
  scheduled_date: string
  name: string
  type: WorkoutType
  status: WorkoutStatus
  duration?: number | null
  exercises?: string[] | null
  notes?: string | null
  start_time?: string | null
  end_time?: string | null
  created_at?: string
  updated_at?: string
}

export interface WorkoutWithProfile extends Workout {
  profiles?: UserProfileSummary | null
}

export interface DisplayWorkout extends WorkoutWithProfile {
  isPartnerWorkout: boolean
}

export interface CalendarSession {
  id: string
  name: string
  type: WorkoutType
  status: WorkoutStatus
  duration?: number | null
  time: string
  scheduledDate: string
  isPartnerWorkout: boolean
  partner?: UserProfileSummary | null
}

export const WORKOUT_TYPES: WorkoutType[] = [
  'Musculation',
  'Cardio',
  'Étirement',
  'Cours collectif',
  'Gainage',
  'Natation',
  'Crossfit',
  'Yoga',
  'Pilates',
  'Repos',
]

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const TYPE_META: Record<
  WorkoutType,
  {
    badgeClass: string
    dotClass: string
    pillClass: string
    softCardClass: string
  }
> = {
  Musculation: {
    badgeClass: 'border-primary/20 bg-primary/10 text-primary',
    dotClass: 'bg-primary',
    pillClass: 'border-primary/20 bg-primary/10 text-primary',
    softCardClass: 'bg-primary/6',
  },
  Cardio: {
    badgeClass: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    dotClass: 'bg-sky-400',
    pillClass: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
    softCardClass: 'bg-sky-500/6',
  },
  'Étirement': {
    badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    dotClass: 'bg-emerald-400',
    pillClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    softCardClass: 'bg-emerald-500/6',
  },
  'Cours collectif': {
    badgeClass: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
    dotClass: 'bg-violet-400',
    pillClass: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
    softCardClass: 'bg-violet-500/6',
  },
  Gainage: {
    badgeClass: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    dotClass: 'bg-amber-400',
    pillClass: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    softCardClass: 'bg-amber-500/6',
  },
  Natation: {
    badgeClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    dotClass: 'bg-cyan-400',
    pillClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    softCardClass: 'bg-cyan-500/6',
  },
  Crossfit: {
    badgeClass: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    dotClass: 'bg-rose-400',
    pillClass: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    softCardClass: 'bg-rose-500/6',
  },
  Yoga: {
    badgeClass: 'border-pink-500/20 bg-pink-500/10 text-pink-300',
    dotClass: 'bg-pink-400',
    pillClass: 'border-pink-500/20 bg-pink-500/10 text-pink-300',
    softCardClass: 'bg-pink-500/6',
  },
  Pilates: {
    badgeClass: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
    dotClass: 'bg-indigo-400',
    pillClass: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
    softCardClass: 'bg-indigo-500/6',
  },
  Repos: {
    badgeClass: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
    dotClass: 'bg-slate-400',
    pillClass: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
    softCardClass: 'bg-slate-500/6',
  },
}

export function getWorkoutTypeMeta(type: WorkoutType) {
  return TYPE_META[type]
}

export function parseDateFromYMD(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return new Date(value)
  }

  return new Date(year, month - 1, day)
}

export function formatDateToYMD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatScheduledLongDate(value: string): string {
  return parseDateFromYMD(value).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function sortWorkouts<T extends { scheduled_date: string; start_time?: string | null }>(
  workouts: T[],
): T[] {
  return [...workouts].sort((left, right) => {
    const dateComparison = left.scheduled_date.localeCompare(right.scheduled_date)
    if (dateComparison !== 0) {
      return dateComparison
    }

    return (left.start_time || '').localeCompare(right.start_time || '')
  })
}

export function isWorkoutCompleted(status: WorkoutStatus | string): boolean {
  return status === 'Terminé' || status === 'Réalisé'
}

export function isWorkoutPlanned(status: WorkoutStatus | string): boolean {
  return status === 'Planifié' || status === 'Planifie'
}

export function getProfileDisplayName(profile?: UserProfileSummary | null): string {
  if (!profile) {
    return 'Partenaire'
  }

  return profile.pseudo || profile.full_name || profile.email.split('@')[0] || 'Partenaire'
}

export function normalizeWorkoutType(workout: Pick<Workout, 'name' | 'type'>): WorkoutType {
  const name = workout.name.toLowerCase()

  if (name.includes('cardio')) return 'Cardio'
  if (name.includes('étirement') || name.includes('etirement') || name.includes('stretch')) {
    return 'Étirement'
  }
  if (name.includes('cours') || name.includes('collectif') || name.includes('group')) {
    return 'Cours collectif'
  }
  if (name.includes('gainage') || name.includes('core') || name.includes('abs')) return 'Gainage'
  if (name.includes('natation') || name.includes('piscine') || name.includes('swim')) {
    return 'Natation'
  }
  if (name.includes('crossfit') || name.includes('cross fit') || name.includes('wod')) {
    return 'Crossfit'
  }
  if (name.includes('yoga')) return 'Yoga'
  if (name.includes('pilates')) return 'Pilates'
  if (name.includes('repos') || name.includes('rest')) return 'Repos'

  return workout.type
}

export function buildMonthDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
  const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

  for (let index = 1; index < startingDayOfWeek; index += 1) {
    days.push({
      date: new Date(year, month, -(startingDayOfWeek - index - 1)),
      isCurrentMonth: false,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({ date: new Date(year, month, day), isCurrentMonth: true })
  }

  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day += 1) {
    days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
  }

  return days
}

export function mapWorkoutToSession(
  workout: WorkoutWithProfile,
  isPartnerWorkout: boolean,
): CalendarSession {
  return {
    id: `${isPartnerWorkout ? 'partner-' : 'personal-'}${workout.id}`,
    name: workout.name,
    type: normalizeWorkoutType(workout),
    status: workout.status,
    duration: workout.duration,
    time: workout.start_time || '',
    scheduledDate: workout.scheduled_date,
    isPartnerWorkout,
    partner: isPartnerWorkout ? workout.profiles : null,
  }
}
