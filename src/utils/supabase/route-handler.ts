import { createServerClient} from'@supabase/ssr'
import { cookies} from'next/headers'

export async function createRouteHandlerClient() {
 const cookieStore = await cookies()

 return createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 get: (name: string) => {
 return cookieStore.get(name)?.value
},
 set: (name: string, value: string, options: Record<string, unknown>) => {
 cookieStore.set(name, value, {
 ...options, // maxAge géré par Supabase selon le type de token
 // SÉCURITÉ: httpOnly: false requis pour Supabase PKCE flow
 // Les tokens sont chiffrés et gérés par Supabase
 httpOnly: false,
 // Cookies sécurisés en production uniquement
 secure: process.env.NODE_ENV ==='production',
 // Protection CSRF - Lax permet les redirections auth
 sameSite:'lax',
 // Chemin par défaut
 path:'/',
})
},
 remove: (name: string, options: Record<string, unknown>) => {
 cookieStore.set(name,'', {
 ...options,
 maxAge: 0,
 expires: new Date(0),
})
},
},
}
 )
}