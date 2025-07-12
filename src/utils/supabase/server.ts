import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const cookieMethods = {
  get: (name: string) => {
    const cookieStore = cookies();
    // @ts-expect-error: Next.js cookies() API n'est pas typée correctement, on ignore l'erreur pour accéder à la valeur du cookie
    return cookieStore.get(name)?.value;
  },
  getAll: () => {
    const cookieStore = cookies();
    // @ts-expect-error: Next.js cookies() API n'est pas typée correctement, on ignore l'erreur pour accéder à la liste des cookies
    return Array.from(cookieStore.getAll()).map((c) => ({ name: (c as { name: string }).name, value: (c as { value: string }).value }));
  },
  set: () => { /* no-op */ }, // Optionnel, à implémenter si besoin
  remove: () => { /* no-op */ }, // Optionnel, à implémenter si besoin
};

export const createServerSupabaseClient = () => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}; 