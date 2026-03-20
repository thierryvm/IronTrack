import { createServerSupabaseClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClientWrapper } from '@/components/profile/ProfileClientWrapper'
import type { UserProfile } from '@/types/user-profile'
import type { UserStats } from '@/types/user-stats'
import type { Achievement } from '@/types/achievement'

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth')
  }

  // 1. Fetch Profile
  let { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profileData) {
    // Création automatique du profil si absent
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
    })
    if (!insertError) {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profileData = result.data
    }
  }

  let userProfile: UserProfile | null = null
  if (profileData) {
    userProfile = {
      id: profileData.id,
      name: profileData.full_name || '',
      email: profileData.email,
      phone: profileData.phone || '',
      location: profileData.location || '',
      avatar: profileData.avatar_url || '',
      height: profileData.height || 0,
      weight: profileData.weight || 0,
      age: profileData.age || 0,
      gender: profileData.gender || 'Homme',
      goal: profileData.goal || 'Prise de masse',
      experience: profileData.experience || 'Débutant',
      joinDate: profileData.created_at,
      pseudo: profileData.pseudo || '',
      frequency: profileData.frequency,
      availability: profileData.availability,
      initial_weight: profileData.initial_weight
    }
  }

  // 2. Fetch Workouts for stats
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)

  let stats: UserStats | null = null
  if (workouts) {
    const totalWorkouts = workouts.length
    const totalWorkoutsDone = workouts.filter((w: any) => w.status === 'Réalisé').length
    const totalWorkoutsPlanned = workouts.filter((w: any) => w.status === 'Planifié').length
    const totalWorkoutsCancelled = workouts.filter((w: any) => w.status === 'Annulé').length
    
    const dates = workouts
      .map((w: any) => w.scheduled_date)
      .filter(Boolean)
      .map((d: any) => new Date(d).toISOString().slice(0, 10))
      .sort((a: any, b: any) => b.localeCompare(a))

    let streak = 0
    const day = new Date()
    for (;;) {
      const dayStr = day.toISOString().slice(0, 10)
      if (dates.includes(dayStr)) {
        streak++
        day.setDate(day.getDate() - 1)
      } else {
        break
      }
    }

    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 6)
    const workoutsThisWeek = dates.filter((d: any) => d >= weekAgo.toISOString().slice(0, 10) && d <= now.toISOString().slice(0, 10)).length

    const totalMinutes = workouts
      .map((w: any) => w.duration || 0)
      .reduce((a: any, b: any) => a + b, 0)

    stats = {
      totalWorkouts,
      totalWorkoutsDone,
      totalWorkoutsPlanned,
      totalWorkoutsCancelled,
      currentStreak: streak,
      longestStreak: 0,
      averageWorkoutsPerWeek: workoutsThisWeek,
      favoriteExercise: '',
      totalTime: totalMinutes,
      achievements: 0,
      totalWeight: 0,
    }
  }

  // 3. Fetch achievements
  const { data: achievementsData } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })

  const achievements = (achievementsData as Achievement[]) || []

  return (
    <ProfileClientWrapper 
      initialProfile={userProfile} 
      initialStats={stats} 
      initialAchievements={achievements} 
    />
  )
}