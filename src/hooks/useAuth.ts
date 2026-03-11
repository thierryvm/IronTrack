import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export interface UseAuthReturn {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Hook d'authentification restauré avec Supabase
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Fonction pour récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        // Vérifier d'abord la session depuis le localStorage/cookies
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erreur récupération session:", sessionError);
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
          } else {
            // Pas de session = utilisateur non connecté
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

    // Vérifier l'utilisateur au montage
    getUser();

    // Écouter les changements d'authentification
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
