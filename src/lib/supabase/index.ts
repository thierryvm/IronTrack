/**
 * Barrel d'exports pour les clients Supabase typés.
 *
 * Usage :
 *   import { createBrowserClient, createServerClient } from '@/lib/supabase';
 *   import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from '@/lib/supabase';
 *
 *   type Profile = Tables<'profiles'>;             // Row
 *   type NewProfile = TablesInsert<'profiles'>;    // Insert
 *   type PatchProfile = TablesUpdate<'profiles'>;  // Update
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './types';
