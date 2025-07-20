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
  set: async (name: string, value: string, options: Record<string, unknown>) => {
    const cookieStore = await cookies();
    cookieStore.set(name, value, {
      ...options,
      httpOnly: false, // Important pour l'auth Supabase
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  },
  remove: async (name: string, options: Record<string, unknown>) => {
    const cookieStore = await cookies();
    cookieStore.set(name, '', {
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