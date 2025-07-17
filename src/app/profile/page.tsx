'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Settings, 
  Target, 
  Trophy, 
  Calendar,
  TrendingUp,
  Edit,
  Save,
  X,
  Bell,
  Shield,
  HelpCircle,
  Camera,
  Activity,
  Dumbbell,
  Download,
  Cat,
  Bot,
  Star,
  Award
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Dialog, DialogTitle, DialogDescription } from '@headlessui/react'
import Avatar from '@/components/ui/Avatar'
import Cropper from 'react-easy-crop'
// import type { TrainingGoal } from '@/types/training-goal.d'; // Non utilisé actuellement
import type { UserProfile } from '@/types/user-profile';
import type { UserStats } from '@/types/user-stats';
import type { Achievement } from '@/types/achievement';

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
  gender?: 'Homme' | 'Femme' | 'Autre';
  goal?: 'Prise de masse' | 'Perte de poids' | 'Maintien' | 'Performance';
  experience?: 'Débutant' | 'Intermédiaire' | 'Avancé';
  created_at: string;
  pseudo?: string; // Ajout du champ pseudo
}

// Définition des badges par défaut (commenté car non utilisé actuellement)
/* const defaultBadges = [
  {
    key: 'bench-50',
    icon: '🏋️‍♂️',
    title: 'Développé couché',
    description: '50kg développé couché',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name === 'Développé couché' && (g.target_weight ?? 0) >= 50),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => g.exercises?.name === 'Développé couché' && (g.target_weight ?? 0) >= 50);
      return g?.updated_at || g?.created_at;
    }
  },
  {
    key: 'bench-100',
    icon: '🏋️‍♂️',
    title: 'Développé couché',
    description: '100kg développé couché',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name === 'Développé couché' && (g.target_weight ?? 0) >= 100),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => g.exercises?.name === 'Développé couché' && (g.target_weight ?? 0) >= 100);
      return g?.updated_at || g?.created_at;
    }
  },
  {
    key: 'squat-100',
    icon: '🏋️‍♀️',
    title: 'Squat',
    description: '100kg squat',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name === 'Squat' && (g.target_weight ?? 0) >= 100),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => g.exercises?.name === 'Squat' && (g.target_weight ?? 0) >= 100);
      return g?.updated_at || g?.created_at;
    }
  },
  {
    key: 'pompes-20',
    icon: '🤸‍♂️',
    title: 'Pompes',
    description: '20 pompes d\'affilée',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name === 'Pompes' && (g.target_reps ?? 0) >= 20),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => g.exercises?.name === 'Pompes' && (g.target_reps ?? 0) >= 20);
      return g?.updated_at || g?.created_at;
    }
  },
  {
    key: 'tractions-10',
    icon: '🧗‍♂️',
    title: 'Tractions',
    description: '10 tractions',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name === 'Tractions' && (g.target_reps ?? 0) >= 10),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => g.exercises?.name === 'Tractions' && (g.target_reps ?? 0) >= 10);
      return g?.updated_at || g?.created_at;
    }
  },
  {
    key: 'abdos-100',
    icon: '💪',
    title: 'Abdos',
    description: '100 crunchs',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => g.exercises?.name === 'Abdos' && (g.target_reps ?? 0) >= 100),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => g.exercises?.name === 'Abdos' && (g.target_reps ?? 0) >= 100);
      return g?.updated_at || g?.created_at;
    }
  },
  {
    key: 'force-brute',
    icon: '🔥',
    title: 'Force brute',
    description: '+1000kg soulevés au total',
    validate: (_goals: TrainingGoal[], stats?: UserStats) => (stats?.totalWeight ?? 0) >= 1000,
    getDate: () => new Date().toISOString() // Date actuelle pour les badges basés sur les stats
  },
  {
    key: 'regulier',
    icon: '📅',
    title: 'Régulier',
    description: '30 jours consécutifs',
    validate: (_goals: TrainingGoal[], stats?: UserStats) => (stats?.currentStreak ?? 0) >= 30,
    getDate: () => new Date().toISOString() // Date actuelle pour les badges basés sur les stats
  },
  {
    key: 'polyvalent',
    icon: '🌟',
    title: 'Polyvalent',
    description: 'Objectif atteint sur 3 exercices différents',
    validate: (goals: TrainingGoal[]) => {
      const unique = new Set(goals.map((g: TrainingGoal) => g.exercises?.name));
      return unique.size >= 3;
    },
    getDate: () => null // À améliorer si tu veux la date du 3e objectif
  },
  {
    key: 'cardio-libre',
    icon: '🚴‍♂️', // À remplacer par une icône SVG plus tard si besoin
    title: 'Cardio Libre',
    description: 'Séance cardio sans séries !',
    validate: (goals: TrainingGoal[]) => goals.some((g: TrainingGoal) => {
      const nom = g.exercises?.name?.toLowerCase() || '';
      // On tente d'accéder à g.exercises?.sets, sinon on considère 0 si non défini
      const sets = ((g.exercises as unknown) as Record<string, unknown>).sets ?? 0;
      return (
        (nom.includes('vélo') || nom.includes('tapis') || nom.includes('rameur') || nom.includes('course')) &&
        (sets === 0)
      );
    }),
    getDate: (goals: TrainingGoal[]) => {
      const g = goals.find((g: TrainingGoal) => {
        const nom = g.exercises?.name?.toLowerCase() || '';
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [ironBuddyLevel, setIronBuddyLevel] = useState<'discret' | 'normal' | 'ambianceur'>('normal')
  const router = useRouter();
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
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  // Ajoute les états pour le crop
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
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
  const [selectedMascot, setSelectedMascot] = useState<string>(() => (typeof window !== 'undefined' && localStorage.getItem('mascot') ? localStorage.getItem('mascot')! : 'ironbuddy'));
  // Ajout d'une ref pour la section mascotte
  const mascotSectionRef = useRef<HTMLDivElement>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // useEffect pour la mascotte (OK)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mascot', selectedMascot);
    }
  }, [selectedMascot]);

  // useEffect pour charger le profil (OK)
  useEffect(() => {
    loadProfileData();
    
    // Vérifier si on arrive avec un paramètre refresh pour forcer le rechargement
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh')) {
      // Attendre un peu puis forcer le rechargement des achievements
      setTimeout(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await loadAchievements(user.id);
        }
      }, 500);
    }
    
    // Rechargement périodique des achievements (toutes les 10 secondes)
    const interval = setInterval(() => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          loadAchievements(user.id);
        }
      });
    }, 10000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect pour charger la préférence notification (OK)
  useEffect(() => {
    const fetchNotifPref = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const res = await supabase.from('user_settings').select('notifications_enabled').eq('user_id', user.id).single();
        if (!res.data) {
          await supabase.from('user_settings').upsert([{ user_id: user.id }], { onConflict: 'user_id' });
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
      const { data: { user } } = await supabase.auth.getUser();
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
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    
    if (error) {
      console.error('Erreur chargement badges:', error.message);
    } else {
      setAchievements(data as Achievement[]);
    }
  };

  // Fonction pour récupérer les objectifs atteints (remplacée par le système de badges)
  /* const loadAchievedGoals = async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('training_goals')
      .select('*, exercises(name)')
      .eq('user_id', userId)
      .eq('status', 'Atteint')
      .order('updated_at', { ascending: false });
    if (!error && data) setAchievedGoals(data);
  }; */

  // Charger les badges en même temps que le profil
  const loadProfileData = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setProfile(null)
      setStats(null)
      setLoading(false)
      return
    }
    let { data: profileData, error: profileError }: { data: SupabaseProfile | null; error: Error | null } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profileError || !profileData) {
      // Création automatique du profil si absent
      const { error: insertError } = await supabase.from('profiles').insert({
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
      pseudo: profileData.pseudo || ''
    }
    setProfile(userProfile)
    await loadWorkoutStats(user.id)
    await loadAchievements(user.id)
    // await loadAchievedGoals(user.id) // Remplacé par les badges
    setLoading(false)
  }

  const handleIronBuddyLevelChange = async (level: 'discret' | 'normal' | 'ambianceur') => {
    setIronBuddyLevel(level)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('user_settings').update({ ironbuddy_level: level }).eq('user_id', user.id)
    if (error) throw error
  }

  const handleProfileChange = (field: keyof UserProfile, value: string | number | boolean) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.name,
        avatar_url: profile.avatar,
        phone: profile.phone,
        location: profile.location,
        height: profile.height,
        weight: profile.weight,
        age: profile.age,
        gender: profile.gender,
        goal: profile.goal,
        experience: profile.experience,
        pseudo: profile.pseudo // Ajout de la sauvegarde du pseudo
      })
      .eq('id', profile.id)
    setIsEditing(false)
    setLoading(false)
    if (error) {
      alert("Erreur lors de la sauvegarde du profil : " + error.message)
    }
  }

  const calculateBMI = () => {
    if (!profile || !profile.height || !profile.weight) return "0"
    const heightInMeters = profile.height / 100
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'stats', name: 'Statistiques', icon: TrendingUp },
    { id: 'settings', name: 'Paramètres', icon: Settings }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');
      // Récupère toutes les données importantes
      const [profileRes, statsRes, workoutsRes, nutritionRes, settingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        Promise.resolve({ data: stats }), // stats déjà calculées côté front
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
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'irontrack-donnees.json';
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

  // Ajoute une fonction utilitaire pour détecter HEIC/HEIF
  function isHeic(file: File) {
    return (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif')
    );
  }

  const onCropComplete = useCallback((_: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Fonction utilitaire pour générer le blob recadré
  async function getCroppedImg(imageSrc: string, crop: { x: number; y: number; width: number; height: number; }) {
    const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const diameter = Math.min(crop.width, crop.height);
    canvas.width = diameter;
    canvas.height = diameter;
    if (!ctx) throw new Error('Impossible de récupérer le contexte du canvas');
    ctx.save();
    ctx.beginPath();
    ctx.arc(diameter/2, diameter/2, diameter/2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      image,
      crop.x, crop.y, crop.width, crop.height,
      0, 0, diameter, diameter
    );
    ctx.restore();
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  // Handler d'upload d'avatar modifié pour gérer le crop
  const handleAvatarFileChange = async (_: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    let file = _?.target?.files?.[0];
    if (!file) return;
    if (isHeic(file)) {
      try {
        // Import dynamique côté client uniquement
        const heic2any: (options: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]> = (await import('heic2any')).default;
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.95,
        });
        // heic2any retourne un Blob ou un tableau de Blobs
        const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
        // On crée un File pour garder le nom et le type
        file = new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
      } catch {
        setAvatarError("Erreur lors de la conversion HEIC/HEIF. IronBuddy est triste... Essaie de convertir manuellement !");
        return;
      }
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError("Le fichier doit être une image !");
      return;
    }
    setSelectedFile(file);
  };

  const handleValidateCrop = async () => {
    if (!selectedFile || !croppedAreaPixels || !profile) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      // Lire le fichier en dataURL
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const croppedBlob = await getCroppedImg(reader.result as string, croppedAreaPixels);
        const supabase = createClient();
        const userId = profile.id;
        const filePath = `${userId}/avatar.jpg`;
        // Upload du blob recadré (cast en FileBody)
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, croppedBlob as File, {
          upsert: true,
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });
        if (uploadError) throw uploadError;
        // Récupérer l'URL publique
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (!data?.publicUrl) throw new Error("Impossible de récupérer l'URL publique");
        // Mettre à jour le profil
        const cacheBustedUrl = data.publicUrl + '?t=' + Date.now();
        const { error: updateError } = await supabase.from('profiles').update({ avatar_url: cacheBustedUrl }).eq('id', userId);
        if (updateError) throw updateError;
        setProfile({ ...profile, avatar: cacheBustedUrl });
        setShowAvatarModal(false);
        setSelectedFile(null);
        // --- Magie IronBuddy ---
        setAvatarCongratsMsg(avatarMessages[Math.floor(Math.random() * avatarMessages.length)]);
        setShowAvatarCongrats(true);
        setAvatarAnimationKey(prev => prev + 1); // Pour relancer l'animation
        setTimeout(() => setShowAvatarCongrats(false), 2500);
      };
    } catch {
      setAvatarError("Erreur lors de l'upload");
    }
    setAvatarUploading(false);
  };

  // Quand on passe en mode édition, on sauvegarde le profil courant
  const startEdit = () => {
    setOriginalProfile(profile ? { ...profile } : null);
    setIsEditing(true);
  };
  // Quand on annule, on restaure le profil original
  const cancelEdit = () => {
    if (originalProfile) setProfile({ ...originalProfile });
    setIsEditing(false);
  };

  // Helpers pour affichage profil
  function displayOrDefault(val: string | number | undefined | null) {
    if (val === undefined || val === null || val === "" || val === 0) {
      return <span className="italic text-gray-400">Non renseigné</span>;
    }
    return val;
  }
  function displayOrBuddy(val: string | number | undefined | null, label: string) {
    if (val === undefined || val === null || val === "" || val === 0) {
      return <span className="italic text-purple-500">{label} : IronBuddy attend ta réponse !</span>;
    }
    return val;
  }
  // Détection profil incomplet
  const isProfileIncomplete = profile && (
    !profile.goal ||
    !profile.experience ||
    !profile.height ||
    !profile.weight ||
    !profile.age
  );

  // Nouvelle fonction pour charger toutes les séances et compter par statut
  const loadWorkoutStats = async (userId: string) => {
    const supabase = createClient();
    const { data: workouts, error } = await supabase
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
        favoriteExercise: '',
        totalTime: 0,
        achievements: 0,
      });
      return;
    }
    const totalWorkouts = workouts.length;
    const totalWorkoutsDone = workouts.filter(w => w.status === 'Réalisé').length;
    const totalWorkoutsPlanned = workouts.filter(w => w.status === 'Planifié').length;
    const totalWorkoutsCancelled = workouts.filter(w => w.status === 'Annulé').length;
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
      favoriteExercise: '', // à calculer si tu veux
      totalTime,
      achievements: 0,
      totalWeight: 0,
    });
  };

  const handleToggleNotifications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await supabase.from('user_settings').upsert(
        [{ user_id: user.id, notifications_enabled: newValue }],
        { onConflict: 'user_id' }
      );
      if (newValue && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('IronBuddy', { body: "C'est l'heure de ta séance !" });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Profil non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Profil</h1>
              <p className="text-orange-100">Gère tes informations et paramètres</p>
            </div>
            {isEditing ? (
              <div className="flex flex-row md:space-x-2 space-x-1 items-center justify-end md:mt-0 mt-2">
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-1 text-sm md:text-base"
                >
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1 text-sm md:text-base"
                >
                  <X className="h-4 w-4" />
                  <span>Annuler</span>
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
              >
                <Edit className="h-5 w-5" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-2 mb-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex space-x-0.5 min-w-[300px] md:min-w-0 w-full flex-nowrap">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-3 px-3 rounded-lg font-medium transition-colors min-w-[90px] md:min-w-[120px] text-xs md:text-base ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-2 md:p-0"
          >
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Photo de profil et infos de base */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                <div className="relative flex-shrink-0">
                  <div key={avatarAnimationKey} className={showAvatarCongrats ? "animate-avatar-pop" : ""}>
                    <Avatar
                      src={profile.avatar}
                      name={profile.name}
                      size={88}
                      className="shadow-lg"
                      onClick={isEditing ? handleChangeAvatar : undefined}
                    />
                  </div>
                  {showAvatarCongrats && (
                    <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-fade-in-out z-20 border-2 border-white">
                      {avatarCongratsMsg}
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      onClick={handleChangeAvatar}
                      title="Changer l'avatar"
                    >
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="text-center md:text-left break-all font-medium text-gray-800 text-sm md:text-base">{profile.email}</div>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full items-center md:items-end justify-between">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                      <div className="flex flex-col items-center md:items-start w-full">
                        <span className="text-xs text-gray-500">Âge</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleProfileChange('age', Math.max(0, (profile.age || 0) - 1))}>-</button>
                            <input type="text" inputMode="numeric" pattern="[0-9]*" className="w-16 px-2 py-1 rounded border border-gray-200 text-center no-spinner" value={profile.age} maxLength={3} onChange={e => handleProfileChange('age', Number(e.target.value.replace(/\D/g, '')))} aria-label="Âge" />
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleProfileChange('age', Math.min(120, (profile.age || 0) + 1))}>+</button>
                          </div>
                        ) : (
                          <div>{profile.age}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center md:items-start w-full">
                        <span className="text-xs text-gray-500">Taille</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleProfileChange('height', Math.max(0, (profile.height || 0) - 1))}>-</button>
                            <input type="text" inputMode="numeric" pattern="[0-9]*" className="w-16 px-2 py-1 rounded border border-gray-200 text-center no-spinner" value={profile.height} maxLength={3} onChange={e => handleProfileChange('height', Number(e.target.value.replace(/\D/g, '')))} aria-label="Taille" />
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleProfileChange('height', Math.min(250, (profile.height || 0) + 1))}>+</button>
                          </div>
                        ) : (
                          <div>{profile.height}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-center md:items-start w-full">
                        <span className="text-xs text-gray-500">Poids</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleProfileChange('weight', Math.max(0, (profile.weight || 0) - 1))}>-</button>
                            <input type="text" inputMode="numeric" pattern="[0-9]*" className="w-16 px-2 py-1 rounded border border-gray-200 text-center no-spinner" value={profile.weight} maxLength={3} onChange={e => handleProfileChange('weight', Number(e.target.value.replace(/\D/g, '')))} aria-label="Poids" />
                            <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => handleProfileChange('weight', Math.min(300, (profile.weight || 0) + 1))}>+</button>
                          </div>
                        ) : (
                          <div>{profile.weight}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-2 md:mt-0">
                      <span className="text-xs text-gray-500">IMC</span>
                      <div className="bg-gray-100 rounded px-4 py-2 font-bold text-green-600 text-lg md:text-xl w-full md:w-auto text-center">{calculateBMI()}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Informations personnelles */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="font-bold text-gray-900 mb-2 md:mb-4 text-base md:text-lg">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm md:text-base">
                  <div>
                    <span className="text-gray-500">Email</span>
                    <div className="font-medium text-gray-900 break-all">{profile ? displayOrDefault(profile.email) : null}</div>
                  </div>
                  {isEditing ? (
                    <div className="mb-4">
                      <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">Pseudo</label>
                      <input
                        id="pseudo"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        value={profile?.pseudo || ''}
                        onChange={e => handleProfileChange('pseudo', e.target.value)}
                        placeholder="Ton pseudo (affiché publiquement)"
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="block text-sm font-medium text-gray-700">Pseudo</span>
                      <span className="mt-1 block text-gray-900">{profile?.pseudo || profile?.name || profile?.email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Objectif</span>
                    <div className="font-medium text-gray-900">
                      {isEditing && profile ? (
                        <select
                          className="w-full px-2 py-1 rounded border border-gray-200"
                          value={profile.goal || ''}
                          onChange={e => handleProfileChange('goal', e.target.value)}
                        >
                          <option value="">Non renseigné</option>
                          <option value="Prise de masse">Prise de masse</option>
                          <option value="Perte de poids">Perte de poids</option>
                          <option value="Maintien">Maintien</option>
                          <option value="Performance">Performance</option>
                        </select>
                      ) : profile ? displayOrBuddy(profile.goal, "Objectif") : null}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Niveau d&apos;expérience</span>
                    <div className="font-medium text-gray-900">
                      {isEditing && profile ? (
                        <select
                          className="w-full px-2 py-1 rounded border border-gray-200"
                          value={profile.experience || ''}
                          onChange={e => handleProfileChange('experience', e.target.value)}
                        >
                          <option value="">Non renseigné</option>
                          <option value="Débutant">Débutant</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Avancé">Avancé</option>
                        </select>
                      ) : profile ? displayOrBuddy(profile.experience, "Niveau d'expérience") : null}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Membre depuis</span>
                    <div className="font-medium text-gray-900">{profile && profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="italic text-gray-400">Non renseigné</span>}</div>
                  </div>
                </div>
                {isProfileIncomplete && profile && (
                  <div className="my-4 p-4 bg-purple-50 border-l-4 border-purple-400 text-purple-800 rounded-lg flex items-center gap-2 animate-fade-in-out">
                    <span role="img" aria-label="IronBuddy">💪</span>
                    <span>IronBuddy : Complète ton profil pour une expérience sur-mesure et des conseils encore plus musclés !</span>
                  </div>
                )}
              </div>
            </div>
            {/* Statistiques rapides */}
            <div className="w-full lg:w-auto">
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold mb-2">Statistiques rapides</h3>
                <div className="flex flex-col gap-1">
                  <div><b>Séances totales</b> : {stats?.totalWorkouts ?? 0}</div>
                  <div className="flex items-center gap-2 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Réalisées : {stats?.totalWorkoutsDone ?? 0}</div>
                  <div className="flex items-center gap-2 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Planifiées : {stats?.totalWorkoutsPlanned ?? 0}</div>
                  <div className="flex items-center gap-2 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Annulées : {stats?.totalWorkoutsCancelled ?? 0}</div>
                </div>
                <div className="space-y-1 text-sm md:text-base">
                  <div className="flex justify-between"><span>Séries en cours</span><span className="text-orange-600 font-bold">{stats?.currentStreak || 0} jours</span></div>
                  <div className="flex justify-between"><span>Séances/semaine</span><span>{stats?.averageWorkoutsPerWeek || 0}</span></div>
                  <div className="flex justify-between"><span>Temps total</span><span>{stats?.totalTime ? `${Math.floor(stats.totalTime / 60)}h${stats.totalTime % 60 ? ' ' + (stats.totalTime % 60) + 'min' : ''}` : '0h'}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Statistiques détaillées */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Statistiques d&apos;entraînement</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalWorkouts || 0}</p>
                    <p className="text-sm text-gray-600">Séances totales</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.currentStreak || 0}</p>
                    <p className="text-sm text-gray-600">Jours consécutifs</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.averageWorkoutsPerWeek || 0}</p>
                    <p className="text-sm text-gray-600">Séances/semaine</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.achievements || 0}</p>
                    <p className="text-sm text-gray-600">Badges gagnés</p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Exercice préféré</h4>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Dumbbell className="h-6 w-6 text-orange-500" />
                    <span className="font-medium text-gray-900">{stats?.favoriteExercise || 'Aucun exercice préféré'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progression */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Progression</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Évolution du poids</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Début</span>
                      <span className="font-medium text-gray-900">70 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actuel</span>
                      <span className="font-medium text-orange-600">{profile.weight} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gain</span>
                      <span className="font-medium text-green-600">+{profile.weight - 70} kg</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Records personnels</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Développé couché</span>
                      <span className="font-medium text-gray-900">92.5 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Squat</span>
                      <span className="font-medium text-gray-900">120 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tractions</span>
                      <span className="font-medium text-gray-900">8 reps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Section Badges validés */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-500" />
                <span>Badges validés</span>
              </h2>
              <div className="space-y-6">
                {/* Badges validés uniquement */}
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Badges validés de la base de données (status = 'Validé') */}
                    {achievements
                      .filter(achievement => achievement.status === 'Validé')
                      .reduce((unique, achievement) => {
                        // Créer une clé unique basée sur le nom + description pour éviter les vrais doublons
                        const existingDuplicate = unique.find(a => a.name === achievement.name && a.description === achievement.description);
                        if (!existingDuplicate) {
                          unique.push(achievement);
                        }
                        return unique;
                      }, [] as Achievement[])
                      .map(achievement => (
                      <div key={achievement.id} className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <span className="h-8 w-8 mx-auto mb-2 flex items-center justify-center text-3xl">{achievement.icon || '🏆'}</span>
                        <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.unlocked_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Débloqué le {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Affichage si aucun badge validé */}
                    {achievements.filter(achievement => achievement.status === 'Validé').length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="font-medium text-gray-900 mb-2">Aucun badge validé</h3>
                        <p className="text-sm">Crée des objectifs dans la page Progression pour débloquer tes premiers badges !</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Paramètres de notification */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Bell className="h-6 w-6 text-orange-500" />
                <span>Notifications</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Rappels d&apos;entraînement</p>
                    <p className="text-sm text-gray-600">Recevoir des notifications pour tes séances</p>
                  </div>
                  <button
                    className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                    onClick={handleToggleNotifications}
                    aria-pressed={notificationsEnabled}
                    type="button"
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions améliorées */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Settings className="h-6 w-6 text-orange-500" />
                <span>Actions & Paramètres</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne 1 : Compte & Données */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span>Compte</span>
                    </h4>
                    <button onClick={handleChangePassword} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 mb-2">
                      <Settings className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Changer le mot de passe</p>
                        <p className="text-sm text-gray-600">Sécurise ton compte&nbsp;! (IronBuddy ne lit pas tes mots de passe, promis)</p>
                      </div>
                    </button>
                    <button onClick={handleDeleteAccount} className="w-full text-left p-4 border border-red-300 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-3 mb-2">
                      <X className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700">Supprimer mon compte</p>
                        <p className="text-sm text-red-500">Action irréversible&nbsp;! IronBuddy va pleurer… 😢</p>
                      </div>
                    </button>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-500" />
                      <span>Données</span>
                    </h4>
                    <button onClick={handleExportData} disabled={exporting} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-3">
                      <Download className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Exporter mes données</p>
                        <p className="text-sm text-gray-600">Télécharge ton historique (IronBuddy adore les stats&nbsp;!)</p>
                        {exporting && <span className="text-xs text-orange-500">Export en cours...</span>}
                        {exportError && <span className="text-xs text-red-500">{exportError}</span>}
                      </div>
                    </button>
                  </div>
                </div>
                {/* Colonne 2 : Personnalisation & Support */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Camera className="h-5 w-5 text-purple-500" />
                      <span>Personnalisation</span>
                    </h4>
                    <button onClick={handleChangeAvatar} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-3 mb-2">
                      <Camera className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="font-medium text-gray-900">Changer mon avatar</p>
                        <p className="text-sm text-gray-600">Un nouveau look pour de nouveaux PRs&nbsp;!</p>
                      </div>
                    </button>
                    <button onClick={() => mascotSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors flex items-center space-x-3 mb-2">
                      <Dumbbell className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="font-medium text-gray-900">Choisir ma mascotte</p>
                        <p className="text-sm text-gray-600">IronBuddy ou surprise du chef&nbsp;?</p>
                      </div>
                    </button>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1 font-medium">Niveau de punchlines d&apos;IronBuddy</p>
                      <div className="flex gap-2">
                        <button
                          className={`px-3 py-1 rounded-lg font-semibold border ${ironBuddyLevel === 'discret' ? 'bg-gray-200 border-orange-500' : 'bg-gray-50 border-gray-300'}`}
                          onClick={() => handleIronBuddyLevelChange('discret')}
                        >Discret</button>
                        <button
                          className={`px-3 py-1 rounded-lg font-semibold border ${ironBuddyLevel === 'normal' ? 'bg-orange-100 border-orange-500' : 'bg-gray-50 border-gray-300'}`}
                          onClick={() => handleIronBuddyLevelChange('normal')}
                        >Normal</button>
                        <button
                          className={`px-3 py-1 rounded-lg font-semibold border ${ironBuddyLevel === 'ambianceur' ? 'bg-orange-500 text-white border-orange-700' : 'bg-gray-50 border-gray-300'}`}
                          onClick={() => handleIronBuddyLevelChange('ambianceur')}
                        >Ambianceur</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">IronBuddy s&apos;adapte à ton humeur&nbsp;!</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                      <span>Support</span>
                    </h4>
                    <button onClick={handleSupport} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-3 mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900">Aide & support</p>
                        <p className="text-sm text-gray-600">Besoin d&apos;un coup de main&nbsp;? IronBuddy est là&nbsp;!</p>
                      </div>
                    </button>
                    <button onClick={handleFAQ} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900">FAQ</p>
                        <p className="text-sm text-gray-600">Les questions que m&apos;ême IronBuddy se pose parfois…</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mascotte IronBuddy */}
            <div ref={mascotSectionRef} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Dumbbell className="h-6 w-6 text-orange-500" />
                <span>Mascotte IronBuddy</span>
              </h3>
              <div className="space-y-4">
                {/* Option pour réactiver la mascotte */}
                {typeof window !== 'undefined' && localStorage.getItem('hideMascot') === '1' ? (
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    onClick={() => { localStorage.removeItem('hideMascot'); window.location.reload(); }}
                  >
                    Réactiver IronBuddy
                  </button>
                ) : (
                  <span className="text-green-700 font-semibold">IronBuddy est actif et prêt à motiver !</span>
                )}
                {/* Sélection de mascotte */}
                <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-bold text-orange-600">Choisir ma mascotte</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-3">
                    <button
                      className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-lg border-2 transition-all ${selectedMascot === 'ironbuddy' ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white'}`}
                      onClick={() => setSelectedMascot('ironbuddy')}
                    >
                      <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 animate-bounce" />
                      <span className="mt-1 text-xs font-bold text-center">IronBuddy</span>
                    </button>
                    <button
                      className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-lg border-2 transition-all ${selectedMascot === 'cat' ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white'}`}
                      onClick={() => setSelectedMascot('cat')}
                    >
                      <Cat className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 animate-pulse" />
                      <span className="mt-1 text-xs font-bold text-center">Félix</span>
                    </button>
                    <button
                      className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-lg border-2 transition-all ${selectedMascot === 'bot' ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white'}`}
                      onClick={() => setSelectedMascot('bot')}
                    >
                      <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 animate-spin-slow" />
                      <span className="mt-1 text-xs font-bold text-center">RoboCoach</span>
                    </button>
                    <button
                      className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-lg border-2 transition-all ${selectedMascot === 'star' ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white'}`}
                      onClick={() => setSelectedMascot('star')}
                    >
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 animate-ping" />
                      <span className="mt-1 text-xs font-bold text-center">SuperStar</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Ta mascotte te suivra partout dans l&apos;app et t&apos;encouragera à chaque étape !</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Modale suppression compte */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full z-10 relative">
            <DialogTitle className="text-2xl font-bold text-red-600 mb-2 flex items-center"><X className="h-6 w-6 mr-2" /> Confirmation</DialogTitle>
            <DialogDescription className="mb-4 text-gray-700">Es-tu sûr de vouloir supprimer ton compte&nbsp;? <br/>IronBuddy va devoir faire du cardio pour s&apos;en remettre…</DialogDescription>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold">Annuler</button>
              <button onClick={confirmDeleteAccount} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold">Oui, supprimer</button>
            </div>
          </div>
        </div>
      </Dialog>
      {/* Modale avatar (placeholder) */}
      <Dialog open={showAvatarModal} onClose={() => { setShowAvatarModal(false); setSelectedFile(null); }} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full z-10 relative">
            <DialogTitle className="text-2xl font-bold text-purple-600 mb-2 flex items-center"><Camera className="h-6 w-6 mr-2" /> Changer d&apos;avatar</DialogTitle>
            <DialogDescription className="mb-4 text-gray-700">Choisis une nouvelle photo de profil. IronBuddy validera le style !</DialogDescription>
            <div className="text-xs text-gray-500 mb-2">Ta photo ne sera utilisée que pour ton profil IronTrack. Elle n&apos;est jamais partagée sans ton accord. (RGPD friendly !)</div>
            {selectedFile ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-48 bg-gray-100 rounded-full overflow-hidden">
                  <Cropper
                    image={URL.createObjectURL(selectedFile)}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="w-48"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold"
                    disabled={avatarUploading}
                  >Annuler</button>
                  <button
                    onClick={handleValidateCrop}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold"
                    disabled={avatarUploading}
                  >Valider</button>
                </div>
                {avatarUploading && <div className="text-purple-500 text-sm">Upload en cours...</div>}
                {avatarError && <div className="text-red-500 text-sm">{avatarError}</div>}
              </div>
            ) : (
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Depuis la galerie ou fichiers</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleAvatarFileChange}
                    disabled={avatarUploading}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Prendre une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleAvatarFileChange}
                    disabled={avatarUploading}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </label>
                {avatarUploading && <div className="text-purple-500 text-sm">Upload en cours...</div>}
                {avatarError && <div className="text-red-500 text-sm">{avatarError}</div>}
              </form>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => { setShowAvatarModal(false); setSelectedFile(null); }} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold">Fermer</button>
            </div>
          </div>
        </div>
      </Dialog>
      {/* Modale mascotte (placeholder) */}
      <Dialog open={showMascotModal} onClose={() => setShowMascotModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full z-10 relative">
            <DialogTitle className="text-2xl font-bold text-orange-600 mb-2 flex items-center"><Dumbbell className="h-6 w-6 mr-2" /> Choisir ma mascotte</DialogTitle>
            <DialogDescription className="mb-4 text-gray-700">Fonctionnalité à venir&nbsp;! IronBuddy révise son plus beau sourire…</DialogDescription>
            <div className="flex justify-end">
              <button onClick={() => setShowMascotModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold">Fermer</button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
} 