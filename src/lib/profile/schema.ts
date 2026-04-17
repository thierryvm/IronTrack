import { z } from 'zod';

/**
 * Schéma pseudo : 3-30 caractères, minuscules + chiffres + underscore.
 * Aligné sur la contrainte SQL `profiles_pseudo_format`.
 */
const rawPseudo = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { message: 'profile.errors.pseudoTooShort' })
  .max(30, { message: 'profile.errors.pseudoTooLong' })
  .regex(/^[a-z0-9_]+$/, { message: 'profile.errors.pseudoFormat' });

const rawFullName = z
  .string()
  .trim()
  .min(1, { message: 'profile.errors.fullNameRequired' })
  .max(50, { message: 'profile.errors.fullNameTooLong' });

/**
 * Champs optionnels : string vide => null.
 * Si non vide, validation stricte.
 */
export const profileFormSchema = z.object({
  pseudo: z
    .union([z.literal(''), rawPseudo])
    .transform((v) => (v === '' ? null : v)),
  full_name: z
    .union([z.literal(''), rawFullName])
    .transform((v) => (v === '' ? null : v)),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
