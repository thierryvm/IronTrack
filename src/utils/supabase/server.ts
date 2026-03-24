import { cookies} from'next/headers';
import { createServerClient} from'@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
 throw new Error(
'Variables d\'environnement Supabase manquantes.' +
'Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
 )
}

const cookieMethods = {
 get: async (name: string) => {
 const cookieStore = await cookies();
 const cookie = cookieStore.get(name);
 return cookie?.value;
},
 getAll: async () => {
 const cookieStore = await cookies();
 const allCookies = cookieStore.getAll();
 return allCookies.map((c) => ({ name: c.name, value: c.value}));
},
 set: async (name: string, value: string, options: Record<string, unknown>) => {
 const cookieStore = await cookies();
 cookieStore.set(name, value, {
 ...options, // maxAge géré par Supabase selon le type de token
 // SÉCURITÉ: httpOnly: false requis pour Supabase PKCE flow côté client
 // Les tokens sont chiffrés par Supabase et auto-refresh côté client
 httpOnly: false,
 // Cookies sécurisés en production uniquement
 secure: process.env.NODE_ENV ==='production',
 // Protection CSRF - Lax permet les redirections auth
 sameSite:'lax',
 // Chemin par défaut
 path:'/',
});
},
 remove: async (name: string, options: Record<string, unknown>) => {
 const cookieStore = await cookies();
 cookieStore.set(name,'', {
 ...options,
 maxAge: 0,
 expires: new Date(0),
});
},
};

export const createServerSupabaseClient = () => {
 return createServerClient(supabaseUrl, supabaseAnonKey, {
 cookies: cookieMethods,
});
}; 