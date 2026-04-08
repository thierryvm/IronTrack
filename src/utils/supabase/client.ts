import { createBrowserClient} from'@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
 throw new Error(
'Variables d\'environnement Supabase manquantes.' +
'Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
 )
}

function cleanupLegacySupabaseStorage() {
 if (typeof window === 'undefined') return;

 const authStorageKeys = Object.keys(localStorage).filter((key) =>
   /^sb-[a-z0-9-]+-auth-token(?:\.\d+)?$/i.test(key)
 );

 authStorageKeys.forEach((key) => {
   try {
     const raw = localStorage.getItem(key);
     if (!raw) return;

     const parsed = JSON.parse(raw);

     if (typeof parsed === 'string') {
       localStorage.setItem(key, parsed);
     }
   } catch {
     try {
       localStorage.removeItem(key);
     } catch {
       // Ignore localStorage cleanup failures and let Supabase recover gracefully.
     }
   }
 });
}

export const createClient = () => {
 if (typeof window !== 'undefined') {
   cleanupLegacySupabaseStorage();
 }

 return createBrowserClient(supabaseUrl, supabaseAnonKey, {
   cookieOptions: {
     path: '/',
     sameSite: 'lax',
     secure: process.env.NODE_ENV === 'production',
   },
   auth: {
     flowType:'pkce',
     detectSessionInUrl: true,
     persistSession: true,
     autoRefreshToken: true,
   },
   realtime: {
   params: {
   eventsPerSecond: 2
  }
  },
   global: {
   headers: {
  'x-client-info':'irontrack-web'
  }
   }
 });
};
