import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Hook d'authentification restaure avec Supabase
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Fonction pour recuperer l'utilisateur actuel
    const getUser = async () => {
      try {
        // Verifier d'abord la session depuis le localStorage/cookies
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erreur recuperation session:", sessionError);
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
          } else {
            // Pas de session = utilisateur non connecte
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erreur useAuth:", error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    // Verifier l'utilisateur au montage
    getUser();

    // Ecouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}