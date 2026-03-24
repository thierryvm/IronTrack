import { createBrowserClient} from'@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
 throw new Error(
'Variables d\'environnement Supabase manquantes.' +
'Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
 )
}

// Guard against double-stringified localStorage values (corrupted session tokens)
const safeStorage = {
 getItem: (key: string): string | null => {
   if (typeof window === 'undefined') return null;
   try {
     const raw = localStorage.getItem(key);
     if (!raw) return null;
     // Detect double-encoded JSON: parse returns a string instead of object
     const parsed = JSON.parse(raw);
     if (typeof parsed === 'string') {
       // Self-heal: re-store the unwrapped value
       localStorage.setItem(key, parsed);
       return parsed;
     }
     return raw;
   } catch {
     // Corrupted value — remove it so Supabase re-authenticates cleanly
     try { localStorage.removeItem(key); } catch { /* ignore */ }
     return null;
   }
 },
 setItem: (key: string, value: string): void => {
   if (typeof window !== 'undefined') localStorage.setItem(key, value);
 },
 removeItem: (key: string): void => {
   if (typeof window !== 'undefined') localStorage.removeItem(key);
 },
};

export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey, {
 auth: {
   flowType:'pkce',
   detectSessionInUrl: true,
   persistSession: true,
   autoRefreshToken: true,
   storage: safeStorage,
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