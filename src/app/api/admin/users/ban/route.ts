/**
 * 🛡️ API ROUTE SÉCURISÉE : Bannissement utilisateurs
 * 
 * Utilise le service key côté serveur pour éviter l'exposition côté client
 */
import { createServerClient, type CookieOptions} from'@supabase/ssr'
import { NextResponse} from'next/server'
import { cookies} from'next/headers'

// ULTRAHARDCORE: Force Node.js runtime pour éviter Edge Runtime
export const runtime ='nodejs'

export async function POST(request: Request) {
 if (process.env.NODE_ENV ==='development') {}
 
 try {
 const { userId, ban} = await request.json()
 
 if (!userId || typeof ban !=='boolean') {
 return NextResponse.json({ error:'Paramètres invalides'}, { status: 400})
}

 const cookieStore = await cookies()
 
 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 get(name: string) {
 return cookieStore.get(name)?.value
},
 set(name: string, value: string, options: CookieOptions) {
 cookieStore.set({ name, value, ...options})
},
 remove(name: string) {
 cookieStore.set({ name, value:'', maxAge: 0})
},
},
}
 )
 
 // 🔒 1. Vérification authentification
 const { data: { user}, error: sessionError} = await supabase.auth.getUser()
 
 if (sessionError || !user) {
 return NextResponse.json({ error:'Non authentifié'}, { status: 401})
}

 // 🔒 2. Vérification permissions super admin uniquement
 const { data: adminRole, error: roleError} = await supabase
 .from('user_roles')
 .select('role')
 .eq('user_id', user.id)
 .eq('is_active', true)
 .in('role', ['super_admin']) // Seuls les super admins peuvent bannir
 .single()
 
 if (roleError || !adminRole) {
 return NextResponse.json({ error:'Permissions super admin requises'}, { status: 403})
}

 // 🔒 3. Créer client admin avec service key pour les opérations admin
 const supabaseAdmin = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service key côté serveur
 {
 cookies: {
 get() { return undefined},
 set() {},
 remove() {},
},
 auth: {
 autoRefreshToken: false,
 persistSession: false
}
}
 )

 // 🔒 4. Vérifier que l'utilisateur cible n'est pas un admin
 const { data: targetUserRole} = await supabase
 .from('user_roles')
 .select('role')
 .eq('user_id', userId)
 .eq('is_active', true)
 .in('role', ['admin','super_admin','moderator'])
 .single()

 if (targetUserRole) {
 return NextResponse.json({ 
 error:'Impossible de bannir un utilisateur admin' 
}, { status: 403})
}

 // 🔒 5. Effectuer le bannissement via service key
 const { error: banError} = await supabaseAdmin.auth.admin.updateUserById(userId, {
 ban_duration: ban ?'720h' :'none' // 30 jours ou aucun
})

 if (banError) {
 if (process.env.NODE_ENV ==='development') {
 console.error('[ADMIN BAN] Erreur bannissement:', banError);
}
 return NextResponse.json({ error:'Erreur lors du bannissement'}, { status: 500})
}

 // 📊 6. Log de l'action critique
 await supabase.from('admin_logs').insert({
 admin_id: user.id,
 action: ban ?'ban_user' :'unban_user',
 target_type:'user_account',
 target_id: userId,
 details: {
 banned: ban,
 ban_duration: ban ?'720h' : null,
 timestamp: new Date().toISOString(),
 admin_role: adminRole.role
}
})

 return NextResponse.json({ 
 success: true, 
 message: ban ?'Utilisateur banni avec succès' :'Utilisateur débanni avec succès' 
})

} catch (error) {
 if (process.env.NODE_ENV ==='development') {
 console.error('[API ADMIN BAN] Erreur:', error);
}
 return NextResponse.json({ error:'Erreur serveur'}, { status: 500})
}
}