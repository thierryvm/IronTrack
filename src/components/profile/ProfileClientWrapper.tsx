'use client'

import { useState, useEffect, useCallback, useRef} from'react'
import { motion} from'framer-motion'
import { 
 User, 
 TrendingUp, 
 Settings, 
 Camera, 
 Trophy, 
 Calendar, 
 Activity, 
 Target, 
 Dumbbell, 
 Award, 
 Star, 
 Bell, 
 Shield, 
 X, 
 Download, 
 HelpCircle, 
 Cat, 
 Bot 
} from'lucide-react'
import { createClient} from'@/utils/supabase/client'
import { useRouter} from'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from'@/components/ui/dialog'
import { Input} from'@/components/ui/input'
import { Label} from'@/components/ui/label'
import Avatar from'@/components/ui/Avatar'
import { Button} from'@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent} from'@/components/ui/card'
import dynamic from'next/dynamic'

import { ImagePicker} from'@/components/shared/ImagePicker'
import { useBadges} from'@/hooks/useBadges'
import { useProgressionStats} from'@/hooks/useProgressionStats'
import { ProfileInfoSection} from'@/components/profile/ProfileInfoSection'
// import { UserTicketsSection} from'@/components/profile/UserTicketsSection' // Déplacé vers /notifications
// import type { TrainingGoal} from'@/types/training-goal.d'; // Non utilisé actuellement
import type { UserProfile} from'@/types/user-profile';
import type { UserStats} from'@/types/user-stats';
import type { Achievement} from'@/types/achievement';

// Définir un type pour le profil Supabase
interface SupabaseProfile {
 id: string;
 full_name?: string;
 email: string;
 phone?: string;
 location?: string;
 avatar_url?: string;
 height?: number;
 weight?: number;
 age?: number;
 gender?:'Homme' |'Femme' |'Autre';
 goal?:'Prise de masse' |'Perte de poids' |'Maintien' |'Performance';
 experience?:'Débutant' |'Intermédiaire' |'Avancé';
 created_at: string;
 pseudo?: string;
 frequency?:'Faible' |'Modérée' |'Élevée';
 availability?: number;
 initial_weight?: number;
}

// Définition des badges par défaut (commenté car non utilisé actuellement)
/* const defaultBadges = [
 {
 key:'bench-50',
 icon:'🏋️‍♂️',
 title:'Développé couché',
 description:'50kg développé couché',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name ==='Développé couché' && (g.target_weight ?? 0) >= 50),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => g.exercises?.name ==='Développé couché' && (g.target_weight ?? 0) >= 50);
 return g?.updated_at || g?.created_at;
}
},
 {
 key:'bench-100',
 icon:'🏋️‍♂️',
 title:'Développé couché',
 description:'100kg développé couché',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name ==='Développé couché' && (g.target_weight ?? 0) >= 100),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => g.exercises?.name ==='Développé couché' && (g.target_weight ?? 0) >= 100);
 return g?.updated_at || g?.created_at;
}
},
 {
 key:'squat-100',
 icon:'🏋️‍♀️',
 title:'Squat',
 description:'100kg squat',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name ==='Squat' && (g.target_weight ?? 0) >= 100),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => g.exercises?.name ==='Squat' && (g.target_weight ?? 0) >= 100);
 return g?.updated_at || g?.created_at;
}
},
 {
 key:'pompes-20',
 icon:'🤸‍♂️',
 title:'Pompes',
 description:'20 pompes d\'affilée',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name ==='Pompes' && (g.target_reps ?? 0) >= 20),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => g.exercises?.name ==='Pompes' && (g.target_reps ?? 0) >= 20);
 return g?.updated_at || g?.created_at;
}
},
 {
 key:'tractions-10',
 icon:'🧗‍♂️',
 title:'Tractions',
 description:'10 tractions',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name ==='Tractions' && (g.target_reps ?? 0) >= 10),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => g.exercises?.name ==='Tractions' && (g.target_reps ?? 0) >= 10);
 return g?.updated_at || g?.created_at;
}
},
 {
 key:'abdos-100',
 icon:'💪',
 title:'Abdos',
 description:'100 crunchs',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name ==='Abdos' && (g.target_reps ?? 0) >= 100),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => g.exercises?.name ==='Abdos' && (g.target_reps ?? 0) >= 100);
 return g?.updated_at || g?.created_at;
}
},
 {
 key:'force-brute',
 icon:'🔥',
 title:'Force brute',
 description:'+1000kg soulevés au total',
 validate: (_goals: TrainingGoal[], stats?: UserStats) => (stats?.totalWeight ?? 0) >= 1000,
 getDate: () => new Date().toISOString() // Date actuelle pour les badges basés sur les stats
},
 {
 key:'regulier',
 icon:'📅',
 title:'Régulier',
 description:'30 jours consécutifs',
 validate: (_goals: TrainingGoal[], stats?: UserStats) => (stats?.currentStreak ?? 0) >= 30,
 getDate: () => new Date().toISOString() // Date actuelle pour les badges basés sur les stats
},
 {
 key:'polyvalent',
 icon:'🌟',
 title:'Polyvalent',
 description:'Objectif atteint sur 3 exercices différents',
 validate: (goals: TrainingGoal[]) => {
 const unique = new Set(goals.map((g: TrainingGoal) => g.exercises?.name));
 return unique.size >= 3;
},
 getDate: () => null // À améliorer si tu veux la date du 3e objectif
},
 {
 key:'cardio-libre',
 icon:'🚴‍♂️', // À remplacer par une icône SVG plus tard si besoin
 title:'Cardio Libre',
 description:'Séance cardio sans séries !',
 validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => {
 const nom = g.exercises?.name?.toLowerCase() ||'';
 // On tente d'accéder à g.exercises?.sets, sinon on considère 0 si non défini
 const sets = ((g.exercises as unknown) as Record<string, unknown>).sets ?? 0;
 return (
 (nom.includes('vélo') || nom.includes('tapis') || nom.includes('rameur') || nom.includes('course')) &&
 (sets === 0)
 );
}),
 getDate: (goals: TrainingGoal[]) => {
 const g = goals.find((g: TrainingGoal) => {
 const nom = g.exercises?.name?.toLowerCase() ||'';
 const sets = ((g.exercises as unknown) as Record<string, unknown>).sets ?? 0;
 return (
 (nom.includes('vélo') || nom.includes('tapis') || nom.includes('rameur') || nom.includes('course')) &&
 (sets === 0)
 );
});
 return g?.updated_at || g?.created_at;
}
},
]; */

interface ProfileClientWrapperProps {
 initialProfile: UserProfile | null;
 initialStats: UserStats | null;
 initialAchievements: Achievement[];
}

export function ProfileClientWrapper({ initialProfile, initialStats, initialAchievements}: ProfileClientWrapperProps) {
 const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
 const [stats, setStats] = useState<UserStats | null>(initialStats)
 const [loading, setLoading] = useState(false)
 const [activeTab, setActiveTab] = useState('profile')
 const [ironBuddyLevel, setIronBuddyLevel] = useState<'discret' |'normal' |'ambianceur'>('normal')
 const router = useRouter();
 const { userBadges} = useBadges();
 const { progressionStats, personalRecords, loading: progressionLoading, reload: reloadProgressionStats} = useProgressionStats();
 // États pour les modales
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showAvatarModal, setShowAvatarModal] = useState(false);
 const [showMascotModal, setShowMascotModal] = useState(false);
 const [exporting, setExporting] = useState(false);
 const [exportError, setExportError] = useState<string|null>(null);
 // Ajout des états pour l'upload d'avatar
 const [avatarUploading, setAvatarUploading] = useState(false);
 const [avatarError, setAvatarError] = useState<string|null>(null);
 // Ajoute un état pour stocker le profil original
;
 // Ajoute les états pour le crop
 const [selectedFile, setSelectedFile] = useState<File|null>(null);
 const [crop, setCrop] = useState({ x: 0, y: 0});
 const [zoom, setZoom] = useState(1);
 const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number} | null>(null);
 // Ajout d'un état pour l'animation et le message IronBuddy
 const [showAvatarCongrats, setShowAvatarCongrats] = useState(false);
 const [avatarAnimationKey, setAvatarAnimationKey] = useState(0);
 const avatarMessages = [
"Bravo, t'es canon !",
"IronBuddy valide le style !",
"Nouveau look, nouveaux PRs !",
"Avatar au top, prêt à soulever !",
"Stylé comme jamais !"
 ];
 const [avatarCongratsMsg, setAvatarCongratsMsg] = useState(avatarMessages[0]);
 // Ajout état pour la mascotte sélectionnée
 const [selectedMascot, setSelectedMascot] = useState<string>(() => (typeof window !=='undefined' && localStorage.getItem('mascot') ? localStorage.getItem('mascot')! :'ironbuddy'));
 // Ajout d'une ref pour la section mascotte
 const mascotSectionRef = useRef<HTMLDivElement>(null);
 const [notificationsEnabled, setNotificationsEnabled] = useState(false);
 const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);

 // useEffect pour la mascotte (OK)
 useEffect(() => {
 if (typeof window !=='undefined') {
 localStorage.setItem('mascot', selectedMascot);
}
}, [selectedMascot]);

 // useEffect pour charger le profil (OK)
 // loadProfileData removed in favor of Server Component data fetching

 // useEffect pour charger la préférence notification (OK)
 useEffect(() => {
 const fetchNotifPref = async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) return;
 try {
 const res = await supabase.from('user_settings').select('notifications_enabled').eq('user_id', user.id).single();
 if (!res.data) {
 await supabase.from('user_settings').upsert([{ user_id: user.id}], { onConflict:'user_id'});
}
 if (res.data && res.data.notifications_enabled) setNotificationsEnabled(true);
} catch (err) {
 console.error('[user_settings] fetchNotifPref error:', err);
}
};
 fetchNotifPref();
}, []);


 // useEffect pour la redirection si non connecté (OK)
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


 // Récupérer les badges de l'utilisateur
 const loadAchievements = async (userId: string) => {
 const supabase = createClient();
 // Forcer le rafraîchissement en ajoutant un timestamp pour éviter le cache
 const { data, error} = await supabase
 .from('achievements')
 .select('*')
 .eq('user_id', userId)
 .order('unlocked_at', { ascending: false});
 
 if (error) {
 console.error('Erreur chargement badges:', error.message);
} else {
 setAchievements(data as Achievement[]);
}
};

 // Fonction pour récupérer les objectifs atteints (remplacée par le système de badges)
 /* const loadAchievedGoals = async (userId: string) => {
 const supabase = createClient();
 const { data, error} = await supabase
 .from('training_goals')
 .select('*, exercises(name)')
 .eq('user_id', userId)
 .eq('status','Atteint')
 .order('updated_at', { ascending: false});
 if (!error && data) setAchievedGoals(data);
}; */

 // Charger les badges en même temps que le profil
 const loadProfileData = async () => {
 setLoading(true)
 const supabase = createClient()
 const { data: { user}, error: userError} = await supabase.auth.getUser()
 if (userError || !user) {
 setProfile(null)
 setStats(null)
 setLoading(false)
 return
}
 let { data: profileData, error: profileError}: { data: SupabaseProfile | null; error: Error | null} = await supabase
 .from('profiles')
 .select('*')
 .eq('id', user.id)
 .single()
 if (profileError || !profileData) {
 // Création automatique du profil si absent
 const { error: insertError} = await supabase.from('profiles').insert({
 id: user.id,
 email: user.email,
 // Ajoute d'autres champs par défaut si tu veux
})
 if (!insertError) {
 // Recharge le profil après création
 const result = await supabase
 .from('profiles')
 .select('*')
 .eq('id', user.id)
 .single();
 profileData = result.data;
 profileError = result.error;
} else {
 setProfile(null)
 setLoading(false)
 return
}
}
 if (!profileData) {
 setProfile(null)
 setLoading(false)
 return
}
 const userProfile: UserProfile = {
 id: profileData.id,
 name: profileData.full_name ||'',
 email: profileData.email,
 phone: profileData.phone ||'',
 location: profileData.location ||'',
 avatar: profileData.avatar_url ||'',
 height: profileData.height || 0,
 weight: profileData.weight || 0,
 age: profileData.age || 0,
 gender: profileData.gender ||'Homme',
 goal: profileData.goal ||'Prise de masse',
 experience: profileData.experience ||'Débutant',
 joinDate: profileData.created_at,
 pseudo: profileData.pseudo ||'',
 frequency: profileData.frequency,
 availability: profileData.availability,
 initial_weight: profileData.initial_weight
}
 setProfile(userProfile)
 await loadWorkoutStats(user.id)
 await loadAchievements(user.id)
 // await loadAchievedGoals(user.id) // Remplacé par les badges
 setLoading(false)
}

 const handleIronBuddyLevelChange = async (level:'discret' |'normal' |'ambianceur') => {
 setIronBuddyLevel(level)
 const supabase = createClient()
 const { data: { user}} = await supabase.auth.getUser()
 if (!user) return
 const { error} = await supabase.from('user_settings').update({ ironbuddy_level: level}).eq('user_id', user.id)
 if (error) throw error
}



 const calculateBMI = () => {
 if (!profile || !profile.height || !profile.weight) return"0"
 const heightInMeters = profile.height / 100
 return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1)
}

 const tabs = [
 { id:'profile', name:'Profil', icon: User},
 { id:'stats', name:'Statistiques', icon: TrendingUp},
 { id:'settings', name:'Paramètres', icon: Settings}
 ]

 // Handler : Changer mot de passe
 const handleChangePassword = () => {
 router.push('/auth?change_password=1');
};
 // Handler : Supprimer compte
 const handleDeleteAccount = () => {
 setShowDeleteModal(true);
};
 const confirmDeleteAccount = async () => {
 // Ici, suppression réelle du compte côté Supabase
 // (à adapter selon ta logique, ici on simule)
 setShowDeleteModal(false);
 alert("Compte supprimé ! IronBuddy verse une larme... ��");
 router.push('/auth');
};
 // Handler : Exporter données
 const handleExportData = async () => {
 setExporting(true);
 setExportError(null);
 try {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) throw new Error('Utilisateur non connecté');
 // Récupère toutes les données importantes
 const [profileRes, statsRes, workoutsRes, nutritionRes, settingsRes] = await Promise.all([
 supabase.from('profiles').select('*').eq('id', user.id).single(),
 Promise.resolve({ data: stats}), // stats déjà calculées côté front
 supabase.from('workouts').select('*').eq('user_id', user.id),
 supabase.from('nutrition_logs').select('*').eq('user_id', user.id),
 supabase.from('user_settings').select('*').eq('user_id', user.id).single()
 ]);
 const exportData = {
 profile: profileRes.data,
 stats: statsRes.data,
 workouts: workoutsRes.data,
 nutrition_logs: nutritionRes.data,
 user_settings: settingsRes.data
};
 const blob = new Blob([JSON.stringify(exportData, null, 2)], { type:'application/json'});
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download ='irontrack-donnees.json';
 a.click();
 URL.revokeObjectURL(url);
} catch {
 setExportError("Erreur lors de l'export. Même IronBuddy ne comprend pas !");
 // Erreur gérée via l'interface utilisateur
}
 setExporting(false);
};
 // Handler : Changer avatar
 const handleChangeAvatar = () => setShowAvatarModal(true);
 // Handler : Support
 const handleSupport = () => router.push('/support');
 // Handler : FAQ
 const handleFAQ = () => router.push('/faq');

 const handleImageCropped = async (file: File) => {
 if (!profile) return;
 setAvatarUploading(true);
 setAvatarError(null);
 try {
 const supabase = createClient();
 const userId = profile.id;
 const filePath = `${userId}/avatar.jpg`;
 
 const { error: uploadError} = await supabase.storage.from('avatars').upload(filePath, file, {
 upsert: true,
 contentType:'image/jpeg',
 cacheControl:'3600',
});
 if (uploadError) throw uploadError;
 
 const { data} = supabase.storage.from('avatars').getPublicUrl(filePath);
 if (!data?.publicUrl) throw new Error("Impossible de récupérer l'URL publique");
 
 const cacheBustedUrl = data.publicUrl +'?t=' + Date.now();
 const { error: updateError} = await supabase.from('profiles').update({ avatar_url: cacheBustedUrl}).eq('id', userId);
 if (updateError) throw updateError;
 
 setProfile({ ...profile, avatar: cacheBustedUrl});
 setShowAvatarModal(false);
 
 setAvatarCongratsMsg(avatarMessages[Math.floor(Math.random() * avatarMessages.length)]);
 setShowAvatarCongrats(true);
 setAvatarAnimationKey(prev => prev + 1);
 setTimeout(() => setShowAvatarCongrats(false), 2500);
} catch (err: any) {
 setAvatarError(err.message ||"Erreur lors de l'upload");
} finally {
 setAvatarUploading(false);
}
};



 // Nouvelle fonction pour charger toutes les séances et compter par statut
 const loadWorkoutStats = async (userId: string) => {
 const supabase = createClient();
 const { data: workouts, error} = await supabase
 .from('workouts')
 .select('*')
 .eq('user_id', userId);
 if (error || !workouts) {
 setStats({
 totalWorkouts: 0,
 totalWorkoutsDone: 0,
 totalWorkoutsPlanned: 0,
 totalWorkoutsCancelled: 0,
 totalWeight: 0,
 currentStreak: 0,
 longestStreak: 0,
 averageWorkoutsPerWeek: 0,
 favoriteExercise:'',
 totalTime: 0,
 achievements: 0,
});
 return;
}
 const totalWorkouts = workouts.length;
 const totalWorkoutsDone = workouts.filter(w => w.status ==='Réalisé').length;
 const totalWorkoutsPlanned = workouts.filter(w => w.status ==='Planifié').length;
 const totalWorkoutsCancelled = workouts.filter(w => w.status ==='Annulé').length;
 // On garde le reste de la logique pour les autres stats (streak, temps, etc.)
 // 2. Série en cours (current streak)
 // On récupère les dates, on trie, et on compte les jours consécutifs jusqu'à aujourd'hui
 const dates = workouts
 .map(w => w.scheduled_date)
 .filter(Boolean)
 .map(d => new Date(d).toISOString().slice(0, 10))
 .sort((a, b) => b.localeCompare(a)); // du plus récent au plus ancien

 let streak = 0;
 const day = new Date();
 for (;;) {
 const dayStr = day.toISOString().slice(0, 10);
 if (dates.includes(dayStr)) {
 streak++;
 day.setDate(day.getDate() - 1);
} else {
 break;
}
}

 // 3. Séances/semaine (7 derniers jours)
 const now = new Date();
 const weekAgo = new Date();
 weekAgo.setDate(now.getDate() - 6);
 const workoutsThisWeek = dates.filter(d => d >= weekAgo.toISOString().slice(0, 10) && d <= now.toISOString().slice(0, 10)).length;

 // 4. Temps total d'entraînement (en minutes)
 const totalMinutes = workouts
 .map(w => w.duration || 0)
 .reduce((a, b) => a + b, 0);
 // Conversion en heures et minutes pour l'affichage
 const totalTime = totalMinutes;

 setStats({
 totalWorkouts,
 totalWorkoutsDone,
 totalWorkoutsPlanned,
 totalWorkoutsCancelled,
 currentStreak: streak,
 longestStreak: 0, // à calculer si besoin
 averageWorkoutsPerWeek: workoutsThisWeek,
 favoriteExercise:'', // à calculer si tu veux
 totalTime,
 achievements: 0,
 totalWeight: 0,
});
};

 const handleToggleNotifications = async () => {
 const supabase = createClient();
 const { data: { user}} = await supabase.auth.getUser();
 if (!user) return;
 try {
 const newValue = !notificationsEnabled;
 setNotificationsEnabled(newValue);
 await supabase.from('user_settings').upsert(
 [{ user_id: user.id, notifications_enabled: newValue}],
 { onConflict:'user_id'}
 );
 if (newValue &&'Notification' in window) {
 const permission = await Notification.requestPermission();
 if (permission ==='granted') {
 new Notification('IronBuddy', { body:"C'est l'heure de ta séance !"});
} else {
 alert('Permission de notification refusée. IronBuddy ne pourra pas te réveiller !');
}
}
} catch (err) {
 console.error('[user_settings] handleToggleNotifications error:', err);
}
};



 if (loading) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
 <p className="mt-4 text-muted-foreground">Chargement du profil...</p>
 </div>
 </div>
 )
}

 if (!profile) {
 return (
 <div className="min-h-screen bg-background flex items-center justify-center">
 <div className="text-center">
 <User className="h-12 w-12 text-foreground mx-auto mb-4" />
 <p className="text-muted-foreground">Profil non trouvé</p>
 </div>
 </div>
 )
}

 return (
 <div className="min-h-screen bg-background">
 {/* Header */}
 <div className="border-b border-border bg-card py-8">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-bold text-foreground">Profil</h1>
 <p className="text-muted-foreground">Gère tes informations et paramètres</p>
 </div>
 </div>
 </div>
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Onglets */}
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="bg-card border border-border rounded-xl shadow-sm p-2 mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-border"
 >
 <div className="flex space-x-1 min-w-[300px] md:min-w-0 w-full flex-nowrap">
 {tabs.map(tab => {
 const Icon = tab.icon
 return (
 <Button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 variant={activeTab === tab.id ?"default" :"ghost"}
 className="flex-1 flex items-center justify-center space-x-1 py-2 px-2 font-medium transition-colors min-w-[90px] md:min-w-[120px] text-xs md:text-base"
 >
 <Icon className="h-5 w-5" />
 <span>{tab.name}</span>
 </Button>
 )
})}
 </div>
 </motion.div>

 {/* Contenu des onglets */}
 {activeTab ==='profile' && (
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-2 md:p-0"
 >
 {/* Informations principales */}
 <div className="lg:col-span-2 space-y-4 md:space-y-lg">
 {/* Photo de profil et infos de base */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
 {/* Avatar Section */}
 <div className="flex flex-col items-center space-y-4">
 <div className="relative">
 <div key={avatarAnimationKey} className={showAvatarCongrats ?"animate-avatar-pop" :""}>
 <Avatar
 src={profile.avatar}
 name={profile.name}
 size={100}
 className="shadow-lg cursor-pointer"
 onClick={handleChangeAvatar}
 />
 </div>
 {showAvatarCongrats && (
 <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-fade-in-out z-20 border-2 border-white">
 {avatarCongratsMsg}
 </div>
 )}
 <Button
 variant="secondary"
 size="icon"
 className="absolute -bottom-1 -right-1 bg-card border border-border p-2 rounded-full shadow-md hover:bg-muted transition-colors min-h-touch-44 min-w-touch-44"
 onClick={handleChangeAvatar}
 title="Changer l'avatar"
 >
 <Camera className="h-6 w-6 text-muted-foreground" />
 </Button>
 </div>
 <div className="text-center">
 <h2 className="text-xl font-bold text-foreground">{profile.pseudo || profile.name ||'Utilisateur'}</h2>
 <p className="text-muted-foreground text-sm break-all">{profile.email}</p>
 </div>
 </div>

 {/* Stats Section */}
 <div className="grid grid-cols-2 gap-4 md:col-span-2">
 <div className="bg-card rounded-xl p-4 text-center border border-border">
 <div className="text-sm text-muted-foreground font-medium mb-1">IMC</div>
 <div className="text-3xl font-bold text-foreground">{calculateBMI()}</div>
 <div className="text-xs text-muted-foreground mt-1">{profile.height && profile.weight ? 
 `${profile.height}cm • ${profile.weight}kg` : 
'Données manquantes'
}
 </div>
 </div>

 <div className="bg-card rounded-xl p-4 text-center border border-border">
 <div className="text-sm text-muted-foreground font-medium mb-1">Objectif</div>
 <div className="text-lg font-bold text-foreground">
 {profile.goal ||'Non défini'}
 </div>
 <div className="text-xs text-muted-foreground mt-1">{profile.experience ||'Niveau inconnu'}
 </div>
 </div>

 <div className="bg-card rounded-xl p-4 text-center border border-border">
 <div className="text-sm text-muted-foreground font-medium mb-1">Fréquence</div>
 <div className="text-lg font-bold text-foreground">
 {profile.frequency ||'Non définie'}
 </div>
 <div className="text-xs text-muted-foreground mt-1">
 {profile.availability ? `${profile.availability} min/séance` :'Durée non définie'}
 </div>
 </div>

 <div className="bg-card rounded-xl p-4 text-center border border-border">
 <div className="text-sm text-muted-foreground font-medium mb-1">Membre depuis</div>
 <div className="text-lg font-bold text-foreground">
 {profile.joinDate 
 ? new Date(profile.joinDate).toLocaleDateString('fr-FR', { 
 year:'numeric', 
 month:'short' 
})
 :'Récemment'
}
 </div>
 <div className="text-xs text-muted-foreground mt-1">
 {profile.joinDate ? 
 `${Math.floor((Date.now() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24))} jours` : 
'Nouveau membre'
}
 </div>
 </div>
 </div>
 </div>
 </div>
 {/* Informations personnelles */}
 {profile && (
 <ProfileInfoSection 
 profile={profile}
 onProfileUpdate={(updates) => {
 setProfile(prev => prev ? { ...prev, ...updates} : null)
}}
 onProgressionReload={reloadProgressionStats}
 />
 )}

 </div>
 {/* Colonne de droite - Statistiques rapides et tickets de support */}
 <div className="w-full lg:w-auto space-y-6">
 {/* Statistiques rapides */}
 <Card className="flex flex-col gap-2">
 <CardHeader className="pb-2">
 <CardTitle className="text-lg">Statistiques rapides</CardTitle>
 </CardHeader>
 <CardContent className="pt-0">
 <div className="flex flex-col gap-1">
 <div><b>Séances totales</b> : {stats?.totalWorkouts ?? 0}</div>
 <div className="flex items-center gap-2 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Réalisées : {stats?.totalWorkoutsDone ?? 0}</div>
 <div className="flex items-center gap-2 text-secondary"><span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> Planifiées : {stats?.totalWorkoutsPlanned ?? 0}</div>
 <div className="flex items-center gap-2 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Annulées : {stats?.totalWorkoutsCancelled ?? 0}</div>
 </div>
 <div className="space-y-1 text-sm md:text-base">
 <div className="flex justify-between"><span>Séries en cours</span><span className="text-foreground font-bold">{stats?.currentStreak || 0} jours</span></div>
 <div className="flex justify-between"><span>Séances/semaine</span><span>{stats?.averageWorkoutsPerWeek || 0}</span></div>
 <div className="flex justify-between"><span>Temps total</span><span>{stats?.totalTime ? `${Math.floor(stats.totalTime / 60)}h${stats.totalTime % 60 ?'' + (stats.totalTime % 60) +'min' :''}` :'0h'}</span></div>
 </div>
 </CardContent>
 </Card>

 {/* Mes tickets de support */}
 {/* Section tickets déplacée vers /notifications pour centralisation */}
 </div>

 </motion.div>
 )}

 {activeTab ==='stats' && (
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="grid grid-cols-1 lg:grid-cols-2 gap-8"
 >
 {/* Statistiques détaillées */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6">
 <h3 className="text-xl font-bold text-foreground mb-6">Statistiques d'entraînement</h3>
 
 <div className="space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <div className="text-center p-4 bg-tertiary/8 rounded-lg group relative">
 <Trophy className="h-8 w-8 text-foreground mx-auto mb-2" />
 <p className="text-2xl font-bold text-foreground">{stats?.totalWorkouts || 0}</p>
 <p className="text-sm text-muted-foreground">Séances totales</p>
 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
 Toutes les séances marquées comme &quot;Réalisé&quot; ou &quot;Terminé&quot;
 </div>
 </div>
 
 <div className="text-center p-4 bg-tertiary/8 rounded-lg group relative">
 <Calendar className="h-8 w-8 text-safe-info mx-auto mb-2" />
 <p className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0}</p>
 <p className="text-sm text-muted-foreground">Jours consécutifs</p>
 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
 Série actuelle de jours avec au moins une séance terminée
 </div>
 </div>
 
 <div className="text-center p-4 bg-green-50 rounded-lg group relative">
 <Activity className="h-8 w-8 text-safe-success mx-auto mb-2" />
 <p className="text-2xl font-bold text-foreground">{stats?.averageWorkoutsPerWeek || 0}</p>
 <p className="text-sm text-muted-foreground">Séances/semaine</p>
 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
 Moyenne des séances terminées par semaine
 </div>
 </div>
 
 <div className="text-center p-4 bg-purple-50 rounded-lg group relative">
 <Target className="h-8 w-8 text-safe-primary mx-auto mb-2" />
 <p className="text-2xl font-bold text-foreground">{userBadges?.length || 0}</p>
 <p className="text-sm text-muted-foreground">Badges gagnés</p>
 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
 Badges de réalisation obtenus automatiquement
 </div>
 </div>
 </div>
 
 <div className="border-t pt-6">
 <h4 className="font-semibold text-foreground mb-2">Exercice préféré</h4>
 <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
 <Dumbbell className="h-6 w-6 text-foreground" />
 <span className="font-medium text-foreground">{stats?.favoriteExercise ||'Aucun exercice préféré'}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Progression */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6">
 <h3 className="text-xl font-bold text-foreground mb-6">Progression</h3>
 
 <div className="space-y-6">
 <div>
 <h4 className="font-semibold text-foreground mb-2">Évolution du poids</h4>
 <div className="space-y-2">
 {progressionStats ? (
 <>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Début</span>
 <span className="font-medium text-foreground">
 {progressionStats.initial_weight ? `${progressionStats.initial_weight} kg` :'Non renseigné'}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Actuel</span>
 <span className="font-medium text-foreground">
 {progressionStats.current_weight ? `${progressionStats.current_weight} kg` :'Non renseigné'}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-muted-foreground">Évolution</span>
 <span className={`font-medium ${progressionStats.weight_gain && progressionStats.weight_gain > 0 ?'text-green-600' : progressionStats.weight_gain && progressionStats.weight_gain < 0 ?'text-red-600' :'text-muted-foreground'}`}>
 {progressionStats.weight_gain ? `${progressionStats.weight_gain > 0 ?'+' :''}${progressionStats.weight_gain} kg` :'Aucune donnée'}
 </span>
 </div>
 {!progressionStats.initial_weight && progressionStats.current_weight && (
 <div className="mt-2 p-2 bg-tertiary/8 rounded text-xs text-tertiary">
 💡 Définissez votre poids initial pour suivre votre progression
 </div>
 )}
 </>
 ) : (
 <div className="text-sm text-gray-600">Chargement des données...</div>
 )}
 </div>
 </div>
 
 <div>
 <h4 className="font-semibold text-foreground mb-2">Records personnels</h4>
 <div className="space-y-2">
 {progressionLoading ? (
 <div className="text-sm text-gray-600">Chargement des records...</div>
 ) : personalRecords && personalRecords.length > 0 ? (
 <>
 {personalRecords.slice(0, 5).map((record, index) => (
 <div key={index} className="flex justify-between text-sm">
 <span className="text-muted-foreground">{record.exercise_name}</span>
 <span className="font-medium text-foreground">
 {record.max_weight ? `${record.max_weight} kg` :''}
 {record.max_weight && record.max_reps ?' ×' :''}
 {record.max_reps ? `${record.max_reps} reps` :''}
 </span>
 </div>
 ))}
 {personalRecords.length > 5 && (
 <div className="text-xs text-gray-600 mt-2">
 Et {personalRecords.length - 5} autres records...
 </div>
 )}
 </>
 ) : (
 <div className="text-sm text-gray-600 text-center py-4">
 <p>Aucun record personnel enregistré</p>
 <p className="text-xs mt-1">Commencez à enregistrer vos performances dans la section &quot;Progression&quot; !</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 {/* Section Badges validés */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6 mt-8">
 <h2 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
 <Award className="h-6 w-6 text-safe-warning" />
 <span>Badges validés</span>
 </h2>
 <div className="space-y-6">
 {/* Badges validés uniquement */}
 <div>
 <div className="grid grid-cols-2 gap-4">
 {/* Badges validés de la base de données (status ='Validé') */}
 {achievements
 .filter(achievement => achievement.status ==='Validé')
 .reduce((unique, achievement) => {
 // Créer une clé unique basée sur le nom + description pour éviter les vrais doublons
 const existingDuplicate = unique.find(a => a.name === achievement.name && a.description === achievement.description);
 if (!existingDuplicate) {
 unique.push(achievement);
}
 return unique;
}, [] as Achievement[])
 .map(achievement => (
 <div key={achievement.id} className="text-center p-4 rounded-lg bg-tertiary/8 border border-tertiary/25">
 <span className="h-8 w-8 mx-auto mb-2 flex items-center justify-center text-3xl">{achievement.icon ||'🏆'}</span>
 <h3 className="font-medium text-foreground">{achievement.name}</h3>
 <p className="text-sm text-muted-foreground">{achievement.description}</p>
 {achievement.unlocked_at && (
 <div className="text-xs text-gray-600 mt-1">
 Débloqué le {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
 </div>
 )}
 </div>
 ))}
 
 {/* Affichage si aucun badge validé */}
 {achievements.filter(achievement => achievement.status ==='Validé').length === 0 && (
 <div className="col-span-2 text-center py-8 text-muted-foreground">
 <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
 <h3 className="font-medium text-foreground mb-2">Aucun badge validé</h3>
 <p className="text-sm">Crée des objectifs dans la page Progression pour débloquer tes premiers badges !</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Section Badges de réalisation */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6 mt-8">
 <h2 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
 <Star className="h-6 w-6 text-safe-primary" />
 <span>Badges de réalisation</span>
 </h2>
 <div className="space-y-6">
 {userBadges.length > 0 ? (
 <div className="grid grid-cols-2 gap-4">
 {userBadges.map((badge) => (
 <div key={badge.name} className="bg-gradient-to-r from-purple-50 to-tertiary/8 rounded-lg p-4 border border-purple-200">
 <div className="flex items-center space-x-2">
 <div className="text-2xl">{badge.icon}</div>
 <div>
 <h3 className="font-semibold text-foreground">{badge.name}</h3>
 <p className="text-sm text-muted-foreground">{badge.description}</p>
 <p className="text-xs text-muted-foreground mt-1">
 Obtenu le {new Date(badge.earned_at).toLocaleDateString('fr-FR')}
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-8">
 <Star className="h-12 w-12 text-foreground mx-auto mb-4" />
 <p className="text-gray-600">Aucun badge de réalisation pour le moment</p>
 <p className="text-sm text-foreground mt-2">Continue tes entraînements pour débloquer des badges !</p>
 </div>
 )}
 </div>
 </div>
 </motion.div>
 )}

 {activeTab ==='settings' && (
 <motion.div
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="space-y-6"
 >
 {/* Paramètres de notification */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6">
 <h3 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
 <Bell className="h-6 w-6 text-foreground" />
 <span>Notifications</span>
 </h3>
 
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-foreground">Rappels d'entraînement</p>
 <p className="text-sm text-muted-foreground">Recevoir des notifications pour tes séances</p>
 </div>
 <button
 className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ?'bg-primary' :'bg-border'}`}
 onClick={handleToggleNotifications}
 aria-pressed={notificationsEnabled}
 type="button"
 >
 <div className={`w-4 h-4 bg-card rounded-full absolute top-1 transition-transform ${notificationsEnabled ?'right-1' :'left-1'}`}></div>
 </button>
 </div>
 </div>
 </div>

 {/* Actions améliorées */}
 <div className="bg-card border border-border rounded-xl shadow-md p-6">
 <h3 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
 <Settings className="h-6 w-6 text-foreground" />
 <span>Actions & Paramètres</span>
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Colonne 1 : Compte & Données */}
 <div className="space-y-4">
 <div>
 <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
 <Shield className="h-5 w-5 text-safe-info" />
 <span>Compte</span>
 </h4>
 <button 
 onClick={handleChangePassword} 
 className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors flex items-center space-x-2 mb-2"
 aria-label="Modifier le mot de passe"
 >
 <Settings className="h-5 w-5 text-foreground" />
 <div>
 <p className="font-medium text-foreground">Changer le mot de passe</p>
 <p className="text-sm text-muted-foreground">Sécurise ton compte&nbsp;! (IronBuddy ne lit pas tes mots de passe, promis)</p>
 </div>
 </button>
 <button 
 onClick={handleDeleteAccount} 
 className="w-full text-left p-4 border border-destructive/40 rounded-lg hover:bg-destructive/10 transition-colors flex items-center space-x-2 mb-2 focus:outline-none focus:ring-2 focus:ring-destructive"
 aria-label="Supprimer définitivement mon compte utilisateur"
 type="button"
 >
 <X className="h-5 w-5 text-safe-error" aria-hidden="true" />
 <div>
 <p className="font-medium text-destructive">Supprimer mon compte</p>
 <p className="text-sm text-safe-error">Action irréversible&nbsp;! IronBuddy va pleurer… 😢</p>
 </div>
 </button>
 </div>
 <div>
 <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
 <Target className="h-5 w-5 text-safe-success" />
 <span>Données</span>
 </h4>
 <Button variant="secondary" onClick={handleExportData} disabled={exporting} className="w-full justify-start p-4 h-auto min-h-touch-44" aria-label="Exporter mes données personnelles">
 <Download className="h-5 w-5 text-safe-success mr-2" />
 <div className="text-left">
 <p className="font-medium text-foreground">Exporter mes données</p>
 <p className="text-sm text-muted-foreground">Télécharge ton historique (IronBuddy adore les stats&nbsp;!)</p>
 {exporting && <span className="text-xs text-foreground">Export en cours...</span>}
 {exportError && <span className="text-xs text-safe-error">{exportError}</span>}
 </div>
 </Button>
 </div>
 </div>
 {/* Colonne 2 : Personnalisation & Support */}
 <div className="space-y-4">
 <div>
 <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
 <Camera className="h-5 w-5 text-safe-primary" />
 <span>Personnalisation</span>
 </h4>
 <Button variant="secondary" onClick={handleChangeAvatar} className="w-full justify-start p-4 h-auto mb-2 hover:bg-muted min-h-touch-44" aria-label="Modifier ma photo de profil">
 <Camera className="h-5 w-5 text-safe-primary mr-2" />
 <div className="text-left">
 <p className="font-medium text-foreground">Changer mon avatar</p>
 <p className="text-sm text-muted-foreground">Un nouveau look pour de nouveaux PRs&nbsp;!</p>
 </div>
 </Button>
 <button onClick={() => mascotSectionRef.current?.scrollIntoView({ behavior:'smooth'})} className="w-full text-left p-4 border border-border rounded-lg hover:bg-tertiary/8 transition-colors flex items-center space-x-2 mb-2" aria-label="Accéder aux paramètres de la mascotte">
 <Dumbbell className="h-5 w-5 text-orange-400" />
 <div>
 <p className="font-medium text-foreground">Choisir ma mascotte</p>
 <p className="text-sm text-muted-foreground">IronBuddy ou surprise du chef&nbsp;?</p>
 </div>
 </button>
 <div className="mt-2">
 <p className="text-sm text-muted-foreground mb-1 font-medium">Niveau de punchlines d'IronBuddy</p>
 <div className="flex gap-2">
 <button
 className={`px-2 py-1 rounded-lg font-semibold border ${ironBuddyLevel ==='discret' ?'bg-primary/15 border-primary text-foreground' :'bg-muted border-border text-muted-foreground'}`}
 onClick={() => handleIronBuddyLevelChange('discret')}
 >Discret</button>
 <button
 className={`px-2 py-1 rounded-lg font-semibold border ${ironBuddyLevel ==='normal' ?'bg-primary/15 border-primary text-foreground' :'bg-muted border-border text-muted-foreground'}`}
 onClick={() => handleIronBuddyLevelChange('normal')}
 >Normal</button>
 <button
 className={`px-2 py-1 rounded-lg font-semibold border ${ironBuddyLevel ==='ambianceur' ?'bg-primary border-primary text-primary-foreground' :'bg-muted border-border text-muted-foreground'}`}
 onClick={() => handleIronBuddyLevelChange('ambianceur')}
 >Ambianceur</button>
 </div>
 <p className="text-xs text-muted-foreground mt-1">IronBuddy s'adapte à ton humeur&nbsp;!</p>
 </div>
 </div>
 <div>
 <h4 className="font-semibold text-foreground mb-2 flex items-center space-x-2">
 <HelpCircle className="h-5 w-5 text-foreground" />
 <span>Support</span>
 </h4>
 <button onClick={handleSupport} className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors flex items-center space-x-2 mb-2" aria-label="Contacter le support client">
 <HelpCircle className="h-5 w-5 text-safe-info" />
 <div>
 <p className="font-medium text-foreground">Aide & support</p>
 <p className="text-sm text-muted-foreground">Besoin d'un coup de main&nbsp;? IronBuddy est là&nbsp;!</p>
 </div>
 </button>
 <button onClick={handleFAQ} className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors flex items-center space-x-2" aria-label="Consulter la foire aux questions">
 <HelpCircle className="h-5 w-5 text-safe-info" />
 <div>
 <p className="font-medium text-foreground">FAQ</p>
 <p className="text-sm text-muted-foreground">Les questions que m'ême IronBuddy se pose parfois…</p>
 </div>
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Mascotte IronBuddy */}
 <div ref={mascotSectionRef} className="bg-card border border-border rounded-xl shadow-md p-6">
 <h3 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-2">
 <Dumbbell className="h-6 w-6 text-foreground" />
 <span>Mascotte IronBuddy</span>
 </h3>
 <div className="space-y-4">
 {/* Option pour réactiver la mascotte */}
 {typeof window !=='undefined' && localStorage.getItem('hideMascot') ==='1' ? (
 <button
 className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
 onClick={() => { localStorage.removeItem('hideMascot'); window.location.reload();}}
 >
 Réactiver IronBuddy
 </button>
 ) : (
 <span className="text-green-700 font-semibold">IronBuddy est actif et prêt à motiver !</span>
 )}
 {/* Sélection de mascotte */}
 <div className="mt-2 p-2 bg-muted rounded-lg border border-border">
 <span className="font-bold text-foreground">Choisir ma mascotte</span>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-2">
 <button
 className={`flex flex-col items-center px-2 sm:px-2 py-2 rounded-lg border-2 transition-all ${selectedMascot ==='ironbuddy' ?'border-primary bg-primary/10' :'border-border bg-card'}`}
 onClick={() => setSelectedMascot('ironbuddy')}
 >
 <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-foreground animate-bounce" />
 <span className="mt-1 text-xs font-bold text-center text-foreground">IronBuddy</span>
 </button>
 <button
 className={`flex flex-col items-center px-2 sm:px-2 py-2 rounded-lg border-2 transition-all ${selectedMascot ==='cat' ?'border-primary bg-primary/10' :'border-border bg-card'}`}
 onClick={() => setSelectedMascot('cat')}
 >
 <Cat className="h-6 w-6 sm:h-8 sm:w-8 text-safe-warning animate-pulse" />
 <span className="mt-1 text-xs font-bold text-center text-foreground">Félix</span>
 </button>
 <button
 className={`flex flex-col items-center px-2 sm:px-2 py-2 rounded-lg border-2 transition-all ${selectedMascot ==='bot' ?'border-primary bg-primary/10' :'border-border bg-card'}`}
 onClick={() => setSelectedMascot('bot')}
 >
 <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-tertiary animate-spin-slow" />
 <span className="mt-1 text-xs font-bold text-center text-foreground">RoboCoach</span>
 </button>
 <button
 className={`flex flex-col items-center px-2 sm:px-2 py-2 rounded-lg border-2 transition-all ${selectedMascot ==='star' ?'border-primary bg-primary/10' :'border-border bg-card'}`}
 onClick={() => setSelectedMascot('star')}
 >
 <Star className="h-6 w-6 sm:h-8 sm:w-8 text-safe-primary animate-ping" />
 <span className="mt-1 text-xs font-bold text-center text-foreground">SuperStar</span>
 </button>
 </div>
 <p className="text-xs text-muted-foreground mt-2">Ta mascotte te suivra partout dans l&apos;app et t&apos;encouragera à chaque étape !</p>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </div>
 {/* Modal suppression compte - ShadCN UI + fond flou */}
 <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
 <DialogContent className="max-w-md">
 <DialogHeader>
 <DialogTitle className="text-red-600 flex items-center gap-2">
 <X className="h-6 w-6" /> 
 Confirmation de suppression
 </DialogTitle>
 <DialogDescription className="text-foreground">
 Es-tu sûr de vouloir supprimer ton compte ?<br/>
 IronBuddy va devoir faire du cardio pour s'en remettre…
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="flex gap-2">
 <Button 
 variant="secondary" 
 onClick={() => setShowDeleteModal(false)} 
 className="min-h-[44px] flex-1"
 aria-label="Annuler la suppression du compte"
 >
 Annuler
 </Button>
 <Button 
 variant="destructive" 
 onClick={confirmDeleteAccount} 
 className="min-h-[44px] flex-1"
 aria-label="Confirmer la suppression définitive du compte"
 >
 Oui, supprimer
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 {showAvatarModal && (
 <ImagePicker
 open={showAvatarModal}
 onOpenChange={setShowAvatarModal}
 onImageCropped={handleImageCropped}
 />
 )}
 {/* Modal mascotte - ShadCN UI + fond flou */}
 <Dialog open={showMascotModal} onOpenChange={setShowMascotModal}>
 <DialogContent className="max-w-md">
 <DialogHeader>
 <DialogTitle className="text-foreground flex items-center gap-2">
 <Dumbbell className="h-6 w-6" /> 
 Choisir ma mascotte
 </DialogTitle>
 <DialogDescription className="text-foreground">
 Fonctionnalité à venir ! IronBuddy révise son plus beau sourire…
 </DialogDescription>
 </DialogHeader>
 <DialogFooter>
 <Button 
 onClick={() => setShowMascotModal(false)} 
 variant="outline"
 className="min-h-[44px]"
 aria-label="Fermer la modal de sélection de mascotte"
 >
 Fermer
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 )
} 
