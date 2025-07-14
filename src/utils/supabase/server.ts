import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const cookieMethods = {
  get: async (name: string) => {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    return cookie?.value;
  },
  getAll: async () => {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    return allCookies.map((c) => ({ name: c.name, value: c.value }));
  },
  set: () => { /* no-op */ }, // Optionnel, à implémenter si besoin
  remove: () => { /* no-op */ }, // Optionnel, à implémenter si besoin
};

export const createServerSupabaseClient = () => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}; 