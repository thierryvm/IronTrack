# IronTrack 💪

Ton coach muscu personnel ! Une application complète de suivi de musculation avec minuterie, nutrition, progression et motivation.

## 🚀 Fonctionnalités

### 💪 Core Features (100% Opérationnelles)
- ✅ **Gestion des exercices** avec photos sécurisées et upload mobile optimisé
- ✅ **Suivi des performances** avec métriques cardio avancées (SPM, watts, heart rate)
- ✅ **Calendrier d'entraînement** mobile-first avec design Apple-inspired
- ✅ **Minuteur intelligent** avec notifications sonores
- ✅ **Dashboard personnalisé** avec statistiques temps réel
- ✅ **Système de progression** consolidé (plus de fragmentation par doublons)

### 🏆 Gamification & Motivation
- ✅ **Système de badges** avancé avec progression et catégories (17 badges)
- ✅ **Mascotte IronBuddy** enrichie (384 contenus uniques, 4 personnalités)
- ✅ **Niveaux de punchlines** personnalisables (Discret/Normal/Ambianceur)
- ✅ **Suivi des streaks** d'entraînement avec métriques
- ✅ **Records personnels** automatiques

### 👥 Social & Support
- ✅ **Partenaires d'entraînement** avec notifications temps réel
- ✅ **Système de support** complet avec tickets et réponses
- ✅ **Interface d'administration** sécurisée (4 niveaux de rôles)
- ✅ **Audit trail** complet des actions admin

### 🔧 Fonctionnalités Techniques
- ✅ **Upload photos sécurisé** (normes OWASP, validation MIME avancée)
- ✅ **Authentification multi-niveaux** (user, moderator, admin, super_admin)
- ✅ **Row Level Security** (RLS) sur toutes les tables
- ✅ **Notifications temps réel** avec fallback polling intelligent
- ✅ **Interface responsive** optimisée mobile/desktop
- ✅ **Métriques cardio spécialisées** par équipement (rameur, vélo, tapis)

## 🛠️ Technologies

- **Frontend**: Next.js 15.3.5, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Hébergement**: Vercel
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (gratuit)

### 1. Cloner le projet
```bash
git clone https://github.com/thierryvm/IronTrack.git
cd irontrack
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Va sur [supabase.com](https://supabase.com)
2. Crée un nouveau projet
3. Note ton URL et ta clé anon

#### Configurer les variables d'environnement
```bash
cp env.example .env.local
```

Édite `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_APP_NAME=IronTrack
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Créer la base de données
⚠️ **IMPORTANT** : Exécute le fichier `supabase_schema.sql` complet dans l'éditeur SQL de Supabase pour créer toutes les tables et politiques de sécurité.

Aperçu des tables principales :

```sql
-- Créer les tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  rest_time INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nutrition_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(5,2) NOT NULL,
  carbs DECIMAL(5,2) NOT NULL,
  fat DECIMAL(5,2) NOT NULL,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own exercises" ON exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workout exercises" ON workout_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can insert own workout exercises" ON workout_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can update own workout exercises" ON workout_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can delete own workout exercises" ON workout_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);

CREATE POLICY "Users can view own nutrition logs" ON nutrition_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition logs" ON nutrition_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition logs" ON nutrition_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition logs" ON nutrition_logs FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 4. Lancer l'application
```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecte ton repo GitHub à Vercel
2. Configure les variables d'environnement dans Vercel
3. Déploie !

### Variables d'environnement pour la production
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=IronTrack
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 📱 Utilisation

### Première connexion
1. Va sur `/auth` pour créer ton compte
2. Connecte-toi avec email/mot de passe ou Google
3. Configure ton profil

### Ajouter des exercices
1. Va dans "Exercices" → "Nouvel exercice"
2. Prends une photo avec ton iPhone
3. Ajoute les détails (nom, groupe musculaire)
4. Optionnel : ajoute une vidéo YouTube

### Créer une séance
1. Va dans "Nouvelle séance"
2. Sélectionne tes exercices
3. Configure les séries, répétitions, poids
4. Utilise le minuteur pour les temps de repos

### Suivi nutritionnel
1. Va dans "Nutrition"
2. Scanne un code-barres ou ajoute manuellement
3. Suis tes macronutriments quotidiens

## 🎯 État Actuel & Roadmap

### ✅ **Phase 1 - COMPLÉTÉE (2025-01-27)**
- ✅ **Architecture complète** : Next.js 15.3.5 + Supabase + TypeScript
- ✅ **Système d'exercices** : Upload photos sécurisé + métriques cardio avancées
- ✅ **Administration** : Interface complète avec 4 niveaux de rôles
- ✅ **Sécurité OWASP** : Upload files, validation MIME, Row Level Security
- ✅ **Notifications temps réel** : Partenaires d'entraînement + fallback polling
- ✅ **Calendrier mobile** : Design Apple-inspired avec standards européens
- ✅ **Mascotte enrichie** : 384 contenus, 4 personnalités, 3 niveaux
- ✅ **Documentation développeur** : DEVELOPER_GUIDE.md + ARCHITECTURE_OVERVIEW.md + DEPLOYMENT_GUIDE.md

### 🔄 **Phase 2 - Améliorations Mineures**
- [ ] **Calendrier mobile** : Résoudre problèmes tactiles Android/Samsung
- [ ] **Mascotte mobile** : Optimiser affichage + support format 2025
- [ ] **i18n complet** : Système multilingue avec react-i18next
- [ ] **Export données** : PDF/Excel des performances utilisateur

### 🚀 **Phase 3 - Extensions Futures**
- [ ] **Intégration Apple Health** : Synchronisation données fitness
- [ ] **Plans d'entraînement IA** : Génération automatique basée sur progression
- [ ] **Coaching vocal** : Assistant audio avec synthèse vocale
- [ ] **Réalité augmentée** : Analyse de forme et correction posture
- [ ] **Marketplace exercices** : Partage communautaire d'exercices personnalisés
- [ ] **Mode compétition** : Défis entre partenaires d'entraînement

## 🔒 Sécurité

### Gestion des Secrets
- ✅ **Aucune information sensible** (clés, tokens, secrets) n'est stockée dans ce dépôt
- ✅ **Variables d'environnement** : Utilise uniquement `.env.local` (non versionné)
- ✅ **Dossiers sensibles** : `.claude/` et `.vscode/` exclus du versioning
- ⚠️ **ATTENTION** : Ne partage jamais tes clés Supabase ou autres secrets publiquement !

### 🛡️ **Sécurité OWASP Complète (2025-01-27)**
- ✅ **Upload files sécurisé** : Validation MIME stricte, protection contre malwares
- ✅ **Row Level Security** (RLS) sur toutes les tables avec politiques granulaires
- ✅ **Protection XSS/SQL injection** : Validation côté client + serveur
- ✅ **Authentification multi-niveaux** : 4 rôles (user/moderator/admin/super_admin)
- ✅ **Search path sécurisé** : Protection contre injection de schéma PostgreSQL
- ✅ **Audit trail complet** : 110+ logs d'actions admin tracées
- ✅ **Buckets Storage** : Politiques RLS sur fichiers avec contrôle d'accès
- ✅ **Validation MIME mobile** : Support photos iCloud/Samsung avec fallback

### 🔑 **Authentification Renforcée**
- ✅ **Middleware de protection** : Vérification rôles sur toutes les routes admin
- ✅ **Session sécurisée** : Tokens JWT avec refresh automatique
- ✅ **Protection API routes** : Service role key uniquement côté serveur
- ✅ **Fonction RPC sécurisées** : `SECURITY INVOKER` + `search_path` fixes

### 📋 **Bonnes Pratiques Appliquées**
- ✅ **Clés API séparées** : Anon key client, Service role key serveur uniquement
- ✅ **Variables d'environnement** : Séparation complète dev/prod dans .env.local
- ✅ **Monitoring continu** : Logs structurés avec niveaux de gravité
- ✅ **Backup strategy** : Documentation complète backup/restauration

## 🤝 Contribuer

Les contributions sont les bienvenues !
- Fork le projet, crée une branche, propose une Pull Request.
- Ne mets jamais de secrets ou de données personnelles dans tes commits.
- Respecte la structure du projet et la philosophie IronBuddy : code propre, humour muscu, et bienveillance !

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Si tu rencontres des problèmes :
1. Vérifie que toutes les variables d'environnement sont configurées
2. Assure-toi que la base de données Supabase est correctement configurée
3. Ouvre une issue sur GitHub

---

**IronTrack** - Transforme tes objectifs en réalité ! 💪🔥
