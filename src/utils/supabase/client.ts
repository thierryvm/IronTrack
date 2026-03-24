import { createBrowserClient} from'@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
 throw new Error(
'Variables d\'environnement Supabase manquantes.' +
'Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
 )
}

export const createClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey, {
 auth: {
 flowType:'pkce',
 detectSessionInUrl: true,
 persistSession: true,
 autoRefreshToken: true
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