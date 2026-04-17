// Auto-généré depuis Supabase le 2026-04-15
// Régénérer avec: npm run db:types
// NE PAS éditer manuellement — les modifs seront écrasées.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          goal_id: number | null
          icon: string | null
          id: number
          name: string
          status: string | null
          unlocked_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          goal_id?: number | null
          icon?: string | null
          id?: number
          name: string
          status?: string | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          goal_id?: number | null
          icon?: string | null
          id?: number
          name?: string
          status?: string | null
          unlocked_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "training_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_log_throttle: {
        Row: {
          action_hash: string
          admin_id: string
          id: string
          last_logged_at: string | null
        }
        Insert: {
          action_hash: string
          admin_id: string
          id?: string
          last_logged_at?: string | null
        }
        Update: {
          action_hash?: string
          admin_id?: string
          id?: string
          last_logged_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_log_throttle_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string | null
          color: string | null
          condition_type: string
          condition_value: number
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          rarity: string | null
          requirements: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          condition_type: string
          condition_value: number
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          rarity?: string | null
          requirements?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          condition_type?: string
          condition_value?: number
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          rarity?: string | null
          requirements?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      email_change_requests: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          new_email: string
          old_email: string
          status: string | null
          user_agent: string | null
          user_id: string
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          new_email: string
          old_email: string
          status?: string | null
          user_agent?: string | null
          user_id: string
          verification_token: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          new_email?: string
          old_email?: string
          status?: string | null
          user_agent?: string | null
          user_id?: string
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_templates: {
        Row: {
          created_at: string | null
          default_distance: number | null
          default_duration: number | null
          default_reps: number | null
          default_sets: number | null
          default_weight: number | null
          description: string | null
          difficulty: number | null
          equipment_id: number | null
          exercise_type: string
          id: number
          image_url: string | null
          instructions: string | null
          is_active: boolean | null
          is_verified: boolean | null
          muscle_group: string
          muscle_group_id: number | null
          name: string
          popularity_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_distance?: number | null
          default_duration?: number | null
          default_reps?: number | null
          default_sets?: number | null
          default_weight?: number | null
          description?: string | null
          difficulty?: number | null
          equipment_id?: number | null
          exercise_type: string
          id?: number
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          muscle_group: string
          muscle_group_id?: number | null
          name: string
          popularity_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_distance?: number | null
          default_duration?: number | null
          default_reps?: number | null
          default_sets?: number | null
          default_weight?: number | null
          description?: string | null
          difficulty?: number | null
          equipment_id?: number | null
          exercise_type?: string
          id?: number
          image_url?: string | null
          instructions?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          muscle_group?: string
          muscle_group_id?: number | null
          name?: string
          popularity_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_templates_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_templates_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          calories: number | null
          created_at: string | null
          default_cardio_metrics: Json | null
          default_strength_metrics: Json | null
          description: string | null
          difficulty: number | null
          distance: number | null
          distance_unit: string | null
          duration_minutes: number | null
          duration_seconds: number | null
          equipment: string | null
          equipment_id: number | null
          exercise_type: string | null
          id: number
          image_url: string | null
          instructions: string | null
          is_public: boolean | null
          is_template: boolean | null
          muscle_group: string | null
          muscle_group_id: number | null
          name: string
          reps: number | null
          rest_time: number | null
          sets: number | null
          speed: number | null
          speed_unit: string | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
          weight: number | null
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          default_cardio_metrics?: Json | null
          default_strength_metrics?: Json | null
          description?: string | null
          difficulty?: number | null
          distance?: number | null
          distance_unit?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          equipment?: string | null
          equipment_id?: number | null
          exercise_type?: string | null
          id?: number
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          is_template?: boolean | null
          muscle_group?: string | null
          muscle_group_id?: number | null
          name: string
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          speed?: number | null
          speed_unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          weight?: number | null
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          default_cardio_metrics?: Json | null
          default_strength_metrics?: Json | null
          description?: string | null
          difficulty?: number | null
          distance?: number | null
          distance_unit?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          equipment?: string | null
          equipment_id?: number | null
          exercise_type?: string | null
          id?: number
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          is_template?: boolean | null
          muscle_group?: string | null
          muscle_group_id?: number | null
          name?: string
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          speed?: number | null
          speed_unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: number
          meal_date: string
          meal_time: string | null
          name: string
          notes: string | null
          protein: number | null
          sodium: number | null
          sugar: number | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: number
          meal_date: string
          meal_time?: string | null
          name: string
          notes?: string | null
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: number
          meal_date?: string
          meal_time?: string | null
          name?: string
          notes?: string | null
          protein?: number | null
          sodium?: number | null
          sugar?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          fiber: number | null
          id: number
          is_active: boolean | null
          protein: number
          sodium: number | null
          sugar: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          calories: number
          carbs: number
          created_at?: string | null
          fat: number
          fiber?: number | null
          id?: number
          is_active?: boolean | null
          protein: number
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          fiber?: number | null
          id?: number
          is_active?: boolean | null
          protein?: number
          sodium?: number | null
          sugar?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          barcode: string | null
          calories: number
          carbs: number
          created_at: string | null
          date: string
          fat: number
          fiber: number | null
          food_name: string
          id: string
          meal_type: string
          notes: string | null
          protein: number
          quantity: number | null
          sodium: number | null
          sugar: number | null
          time: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          calories: number
          carbs: number
          created_at?: string | null
          date: string
          fat: number
          fiber?: number | null
          food_name: string
          id?: string
          meal_type: string
          notes?: string | null
          protein: number
          quantity?: number | null
          sodium?: number | null
          sugar?: number | null
          time: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          calories?: number
          carbs?: number
          created_at?: string | null
          date?: string
          fat?: number
          fiber?: number | null
          food_name?: string
          id?: string
          meal_type?: string
          notes?: string | null
          protein?: number
          quantity?: number | null
          sodium?: number | null
          sugar?: number | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_sharing_settings: {
        Row: {
          created_at: string | null
          id: string
          partner_id: string | null
          share_nutrition: boolean | null
          share_progress: boolean | null
          share_workouts: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          partner_id?: string | null
          share_nutrition?: boolean | null
          share_progress?: boolean | null
          share_workouts?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          partner_id?: string | null
          share_nutrition?: boolean | null
          share_progress?: boolean | null
          share_workouts?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_sharing_settings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sharing_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_logs: {
        Row: {
          cadence: number | null
          calories: number | null
          distance: number | null
          distance_unit: string | null
          duration: number | null
          duration_minutes: number | null
          duration_seconds: number | null
          exercise_id: number | null
          heart_rate: number | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: number
          incline: number | null
          notes: string | null
          performed_at: string | null
          reps: number | null
          resistance: number | null
          rest_seconds: number | null
          rest_time: number | null
          rpe: number | null
          set_number: number | null
          sets: number | null
          speed: number | null
          speed_unit: string | null
          stroke_rate: number | null
          time_under_tension: number | null
          user_id: string
          watts: number | null
          weight: number | null
          workout_id: number | null
        }
        Insert: {
          cadence?: number | null
          calories?: number | null
          distance?: number | null
          distance_unit?: string | null
          duration?: number | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          exercise_id?: number | null
          heart_rate?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: number
          incline?: number | null
          notes?: string | null
          performed_at?: string | null
          reps?: number | null
          resistance?: number | null
          rest_seconds?: number | null
          rest_time?: number | null
          rpe?: number | null
          set_number?: number | null
          sets?: number | null
          speed?: number | null
          speed_unit?: string | null
          stroke_rate?: number | null
          time_under_tension?: number | null
          user_id: string
          watts?: number | null
          weight?: number | null
          workout_id?: number | null
        }
        Update: {
          cadence?: number | null
          calories?: number | null
          distance?: number | null
          distance_unit?: string | null
          duration?: number | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          exercise_id?: number | null
          heart_rate?: number | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: number
          incline?: number | null
          notes?: string | null
          performed_at?: string | null
          reps?: number | null
          resistance?: number | null
          rest_seconds?: number | null
          rest_time?: number | null
          rpe?: number | null
          set_number?: number | null
          sets?: number | null
          speed?: number | null
          speed_unit?: string | null
          stroke_rate?: number | null
          time_under_tension?: number | null
          user_id?: string
          watts?: number | null
          weight?: number | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          availability: number | null
          avatar_url: string | null
          ban_reason: string | null
          banned_until: string | null
          created_at: string | null
          email: string
          experience: string | null
          frequency: string | null
          full_name: string | null
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          initial_weight: number | null
          is_banned: boolean | null
          is_onboarding_complete: boolean | null
          last_active: string | null
          location: string | null
          onboarding_completed: boolean | null
          phone: string | null
          pseudo: string | null
          role: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          availability?: number | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          created_at?: string | null
          email: string
          experience?: string | null
          frequency?: string | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id: string
          initial_weight?: number | null
          is_banned?: boolean | null
          is_onboarding_complete?: boolean | null
          last_active?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          pseudo?: string | null
          role?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          availability?: number | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_until?: string | null
          created_at?: string | null
          email?: string
          experience?: string | null
          frequency?: string | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          initial_weight?: number | null
          is_banned?: boolean | null
          is_onboarding_complete?: boolean | null
          last_active?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          pseudo?: string | null
          role?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      saved_recipe_ingredients: {
        Row: {
          calculated_calories: number
          calculated_carbs: number
          calculated_fat: number
          calculated_fiber: number | null
          calculated_protein: number
          calculated_sodium: number | null
          calculated_sugar: number | null
          calories_per_100g: number
          carbs_per_100g: number
          created_at: string | null
          fat_per_100g: number
          fiber_per_100g: number | null
          food_id: string | null
          food_name: string
          id: string
          protein_per_100g: number
          quantity: number
          recipe_id: string
          sodium_per_100g: number | null
          sort_order: number | null
          sugar_per_100g: number | null
          unit: string
        }
        Insert: {
          calculated_calories?: number
          calculated_carbs?: number
          calculated_fat?: number
          calculated_fiber?: number | null
          calculated_protein?: number
          calculated_sodium?: number | null
          calculated_sugar?: number | null
          calories_per_100g?: number
          carbs_per_100g?: number
          created_at?: string | null
          fat_per_100g?: number
          fiber_per_100g?: number | null
          food_id?: string | null
          food_name: string
          id?: string
          protein_per_100g?: number
          quantity: number
          recipe_id: string
          sodium_per_100g?: number | null
          sort_order?: number | null
          sugar_per_100g?: number | null
          unit: string
        }
        Update: {
          calculated_calories?: number
          calculated_carbs?: number
          calculated_fat?: number
          calculated_fiber?: number | null
          calculated_protein?: number
          calculated_sodium?: number | null
          calculated_sugar?: number | null
          calories_per_100g?: number
          carbs_per_100g?: number
          created_at?: string | null
          fat_per_100g?: number
          fiber_per_100g?: number | null
          food_id?: string | null
          food_name?: string
          id?: string
          protein_per_100g?: number
          quantity?: number
          recipe_id?: string
          sodium_per_100g?: number | null
          sort_order?: number | null
          sugar_per_100g?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_with_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "saved_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_recipes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_public: boolean | null
          name: string
          preparation_time: number | null
          servings: number
          tags: string[] | null
          total_calories: number
          total_carbs: number
          total_fat: number
          total_fiber: number | null
          total_protein: number
          total_sodium: number | null
          total_sugar: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          name: string
          preparation_time?: number | null
          servings?: number
          tags?: string[] | null
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_public?: boolean | null
          name?: string
          preparation_time?: number | null
          servings?: number
          tags?: string[] | null
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suggestion_feedback: {
        Row: {
          created_at: string | null
          exercise_type: string
          feedback_type: string
          id: number
          suggestion_id: string
          suggestion_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_type: string
          feedback_type: string
          id?: number
          suggestion_id: string
          suggestion_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_type?: string
          feedback_type?: string
          id?: number
          suggestion_id?: string
          suggestion_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          browser_info: Json | null
          category: string
          closed_at: string | null
          created_at: string | null
          description: string
          downvotes: number | null
          id: string
          priority:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["support_ticket_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          url: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          browser_info?: Json | null
          category: string
          closed_at?: string | null
          created_at?: string | null
          description: string
          downvotes?: number | null
          id?: string
          priority?:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          browser_info?: Json | null
          category?: string
          closed_at?: string | null
          created_at?: string | null
          description?: string
          downvotes?: number | null
          id?: string
          priority?:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ticket_responses: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          is_solution: boolean | null
          message: string
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_solution?: boolean | null
          message: string
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_solution?: boolean | null
          message?: string
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_votes: {
        Row: {
          created_at: string | null
          id: string
          ticket_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ticket_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ticket_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_votes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      training_goals: {
        Row: {
          created_at: string | null
          current_progress: number | null
          exercise_id: number | null
          extra_duration: number | null
          extra_kg: number | null
          extra_speed: number | null
          id: number
          notes: string | null
          status: string | null
          target_calories: number | null
          target_date: string | null
          target_distance: number | null
          target_duration: number | null
          target_reps: number | null
          target_sets: number | null
          target_speed: number | null
          target_weight: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_progress?: number | null
          exercise_id?: number | null
          extra_duration?: number | null
          extra_kg?: number | null
          extra_speed?: number | null
          id?: number
          notes?: string | null
          status?: string | null
          target_calories?: number | null
          target_date?: string | null
          target_distance?: number | null
          target_duration?: number | null
          target_reps?: number | null
          target_sets?: number | null
          target_speed?: number | null
          target_weight?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_progress?: number | null
          exercise_id?: number | null
          extra_duration?: number | null
          extra_kg?: number | null
          extra_speed?: number | null
          id?: number
          notes?: string | null
          status?: string | null
          target_calories?: number | null
          target_date?: string | null
          target_distance?: number | null
          target_duration?: number | null
          target_reps?: number | null
          target_sets?: number | null
          target_speed?: number | null
          target_weight?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_partners: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          partner_id: string | null
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          partner_id?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          partner_id?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_partners_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: number
          earned_at: string | null
          id: number
          is_notification_sent: boolean | null
          progress: number | null
          progress_max: number | null
          unlocked_by: string | null
          user_id: string
        }
        Insert: {
          badge_id: number
          earned_at?: string | null
          id?: number
          is_notification_sent?: boolean | null
          progress?: number | null
          progress_max?: number | null
          unlocked_by?: string | null
          user_id: string
        }
        Update: {
          badge_id?: number
          earned_at?: string | null
          id?: number
          is_notification_sent?: boolean | null
          progress?: number | null
          progress_max?: number | null
          unlocked_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          goal_reminders: boolean | null
          id: number
          ironbuddy_level: string | null
          language: string | null
          notifications_enabled: boolean | null
          nutrition_reminders: boolean | null
          push_notifications: boolean | null
          share_planning: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
          workout_reminders: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: number
          ironbuddy_level?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          nutrition_reminders?: boolean | null
          push_notifications?: boolean | null
          share_planning?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          workout_reminders?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          goal_reminders?: boolean | null
          id?: number
          ironbuddy_level?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          nutrition_reminders?: boolean | null
          push_notifications?: boolean | null
          share_planning?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          workout_reminders?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sounds: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          duration: number | null
          exercise_id: number | null
          id: number
          notes: string | null
          order_index: number
          reps: number | null
          rest_time: number | null
          sets: number | null
          weight: number | null
          workout_id: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          exercise_id?: number | null
          id?: number
          notes?: string | null
          order_index: number
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          weight?: number | null
          workout_id?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          exercise_id?: number | null
          id?: number
          notes?: string | null
          order_index?: number
          reps?: number | null
          rest_time?: number | null
          sets?: number | null
          weight?: number | null
          workout_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_streaks: {
        Row: {
          created_at: string | null
          current_streak_start: string | null
          id: number
          last_workout_date: string | null
          max_streak: number | null
          streak: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak_start?: string | null
          id?: number
          last_workout_date?: string | null
          max_streak?: number | null
          streak?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak_start?: string | null
          id?: number
          last_workout_date?: string | null
          max_streak?: number | null
          streak?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string | null
          duration: number | null
          end_time: string | null
          id: number
          name: string
          notes: string | null
          scheduled_date: string | null
          start_time: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: number
          name: string
          notes?: string | null
          scheduled_date?: string | null
          start_time?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: number
          name?: string
          notes?: string | null
          scheduled_date?: string | null
          start_time?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      recipe_with_ingredients: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          ingredients: Json | null
          is_favorite: boolean | null
          is_public: boolean | null
          name: string | null
          preparation_time: number | null
          servings: number | null
          tags: string[] | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_protein: number | null
          total_sodium: number | null
          total_sugar: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      security_monitor: {
        Row: {
          check_type: string | null
          description: string | null
          object_name: unknown
          schema_name: unknown
          status: string | null
        }
        Relationships: []
      }
      training_goals_view: {
        Row: {
          goal: string | null
        }
        Relationships: []
      }
      user_badges_view: {
        Row: {
          badge_category: string | null
          badge_color: string | null
          badge_description: string | null
          badge_icon: string | null
          badge_id: number | null
          badge_is_active: boolean | null
          badge_name: string | null
          badge_rarity: string | null
          badge_requirements: string | null
          badge_sort_order: number | null
          earned_at: string | null
          is_notification_sent: boolean | null
          progress: number | null
          progress_max: number | null
          unlocked_by: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_change_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: Json
      }
      ban_user_admin: {
        Args: {
          ban_reason: string
          banned_until: string
          target_user_id: string
        }
        Returns: boolean
      }
      check_and_award_badges: {
        Args: { user_uuid: string }
        Returns: {
          new_badges_count: number
        }[]
      }
      check_function_security: {
        Args: { function_names: string[] }
        Returns: {
          function_name: string
          has_search_path_config: boolean
          security_status: string
        }[]
      }
      check_is_admin: { Args: never; Returns: boolean }
      check_user_admin_role: {
        Args: { user_uuid: string }
        Returns: {
          expires_at: string
          granted_at: string
          is_active: boolean
          is_valid: boolean
          role: string
        }[]
      }
      cleanup_expired_email_requests: { Args: never; Returns: number }
      cleanup_orphaned_attachments: { Args: never; Returns: number }
      create_exercise_from_template: {
        Args: {
          template_id: number
          user_custom_name?: string
          user_notes?: string
        }
        Returns: number
      }
      debug_profiles_structure: {
        Args: never
        Returns: {
          column_default: string
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      delete_user_admin: { Args: { target_user_id: string }; Returns: boolean }
      get_admin_activity: {
        Args: { hours_limit?: number }
        Returns: {
          action: string
          admin_email: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          resource_id: string
          resource_type: string
        }[]
      }
      get_admin_activity_recent: {
        Args: { p_hours?: number; p_limit?: number }
        Returns: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_id: string
          target_type: string
        }[]
      }
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          admin_users: number
          feedback_tickets: number
          in_progress_tickets: number
          new_users_24h: number
          new_users_7d: number
          open_tickets: number
          tickets_24h: number
          tickets_7d: number
          workouts_24h: number
          workouts_7d: number
        }[]
      }
      get_admin_ticket_with_user: {
        Args: { ticket_id: string }
        Returns: {
          assigned_to: string
          assigned_user_email: string
          attachments: Json
          browser_info: Json
          category: string
          closed_at: string
          created_at: string
          description: string
          downvotes: number
          id: string
          priority: string
          profiles_avatar_url: string
          profiles_email: string
          profiles_full_name: string
          resolved_at: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          upvotes: number
          url: string
          user_agent: string
          user_email: string
          user_id: string
          user_metadata: Json
        }[]
      }
      get_admin_tickets_simple: {
        Args: never
        Returns: {
          id: string
          status: string
          title: string
        }[]
      }
      get_admin_tickets_with_users: {
        Args: never
        Returns: {
          admin_email: string
          admin_full_name: string
          assigned_to: string
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          response_count: number
          status: string
          title: string
          updated_at: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_all_users_admin: {
        Args: never
        Returns: {
          avatar_url: string
          ban_reason: string
          banned_until: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_onboarding_complete: boolean
          last_workout: string
          role: string
          total_workouts: number
          updated_at: string
        }[]
      }
      get_personal_records: {
        Args: { user_uuid: string }
        Returns: {
          exercise_name: string
          max_reps: number
          max_weight: number
          record_date: string
        }[]
      }
      get_progression_stats: {
        Args: { user_uuid: string }
        Returns: {
          current_weight: number
          initial_weight: number
          total_performance_logs: number
          total_workouts: number
          weight_gain: number
        }[]
      }
      get_ticket_responses_with_users: {
        Args: { ticket_uuid: string }
        Returns: {
          attachments: Json
          created_at: string
          id: string
          is_from_admin: boolean
          is_internal: boolean
          is_solution: boolean
          message: string
          responder_avatar_url: string
          responder_email: string
          responder_full_name: string
          ticket_id: string
          updated_at: string
          user_id: string
        }[]
      }
      get_ticket_with_responses: {
        Args: { ticket_uuid: string }
        Returns: {
          responses_data: Json
          ticket_attachments: Json
          ticket_category: string
          ticket_created_at: string
          ticket_description: string
          ticket_id: string
          ticket_priority: string
          ticket_status: string
          ticket_title: string
          ticket_updated_at: string
          ticket_url: string
          ticket_user_avatar_url: string
          ticket_user_email: string
          ticket_user_full_name: string
          ticket_user_id: string
        }[]
      }
      get_user_stats_admin: {
        Args: { target_user_id: string }
        Returns: {
          account_age_days: number
          badges_count: number
          first_workout: string
          last_workout: string
          support_tickets: number
          total_exercises: number
          total_workouts: number
        }[]
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_moderator_or_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_user_admin: { Args: { user_uuid: string }; Returns: boolean }
      log_admin_action_throttled: {
        Args: {
          p_action: string
          p_admin_id: string
          p_details?: Json
          p_target_id?: string
          p_target_type: string
          p_throttle_minutes?: number
        }
        Returns: boolean
      }
      refresh_postgrest_schema_cache: { Args: never; Returns: string }
      search_exercises_and_templates: {
        Args: {
          exercise_type_filter?: string
          limit_count?: number
          search_term?: string
        }
        Returns: {
          description: string
          difficulty: number
          equipment_id: number
          exercise_type: string
          id: number
          image_url: string
          instructions: string
          muscle_group: string
          muscle_group_id: number
          name: string
          source_type: string
        }[]
      }
      security_audit: {
        Args: never
        Returns: {
          audit_section: string
          full_config: string[]
          function_name: string
          is_security_definer: boolean
          issue_count: number
          search_path_status: string
          signature: string
        }[]
      }
      sync_user_role_change: {
        Args: {
          admin_user_id?: string
          new_role: string
          target_user_id: string
        }
        Returns: boolean
      }
      test_admin_functions: { Args: never; Returns: string }
      update_user_role_admin: {
        Args: { new_role: string; target_user_id: string }
        Returns: Json
      }
      validate_attachments: {
        Args: { attachments_data: Json }
        Returns: boolean
      }
    }
    Enums: {
      support_ticket_category:
        | "bug"
        | "feature"
        | "help"
        | "feedback"
        | "account"
        | "payment"
      support_ticket_priority: "low" | "medium" | "high" | "critical"
      support_ticket_status:
        | "open"
        | "in_progress"
        | "waiting_user"
        | "closed"
        | "resolved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      support_ticket_category: [
        "bug",
        "feature",
        "help",
        "feedback",
        "account",
        "payment",
      ],
      support_ticket_priority: ["low", "medium", "high", "critical"],
      support_ticket_status: [
        "open",
        "in_progress",
        "waiting_user",
        "closed",
        "resolved",
      ],
    },
  },
} as const
