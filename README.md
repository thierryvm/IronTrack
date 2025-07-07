# IronTrack 💪

Ton coach muscu personnel ! Une application complète de suivi de musculation avec minuterie, nutrition, progression et motivation.

## 🚀 Fonctionnalités

### Core Features
- ✅ **Gestion des exercices** avec photos et vidéos
- ✅ **Suivi des poids** et progression
- ✅ **Calendrier d'entraînement** 
- ✅ **Minuteur intelligent** avec notifications sonores
- ✅ **Dashboard personnalisé** avec statistiques

### Nutrition & Santé
- 🍎 **Suivi nutritionnel** avec scan de codes-barres
- 📊 **Macronutriments** et calories
- 🎯 **Objectifs personnalisés**

### Motivation & Social
- 🏆 **Système de badges** et récompenses
- 🤖 **Mascotte encourageante** (IronBuddy)
- 👥 **Fonctionnalités sociales** et partage
- 📈 **Graphiques de progression** détaillés

### Smart Features
- ⏰ **Temps de repos automatiques**
- 📱 **Interface responsive** (PWA)
- 🌙 **Mode sombre/clair** automatique
- 📤 **Export PDF/Excel**
- 🔔 **Notifications** et rappels

## 🛠️ Technologies

- **Frontend**: Next.js 14, React, TypeScript
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
Exécute ce SQL dans l'éditeur SQL de Supabase :

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

## 🎯 Roadmap

### Phase 2 (Prochainement)
- [ ] Intégration Apple Health
- [ ] Plans d'entraînement automatiques
- [ ] IA pour suggestions d'exercices
- [ ] Mode compétition entre amis

### Phase 3 (Futur)
- [ ] Réalité augmentée pour la forme
- [ ] Intégration wearables
- [ ] Coaching vocal IA
- [ ] Marketplace d'exercices

## 🔒 Sécurité

Aucune information sensible (clés, tokens, secrets) n'est stockée dans ce dépôt. Toutes les variables confidentielles doivent être placées dans le fichier `.env.local` (non versionné). **Ne partage jamais tes clés Supabase ou autres secrets publiquement !**

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
