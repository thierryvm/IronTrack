import { z } from 'zod';

/**
 * Schéma Zod pour le formulaire magic link.
 * Validation côté serveur ET client.
 */
export const magicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'auth.errors.emailRequired' })
    .email({ message: 'auth.errors.emailInvalid' })
    .max(254, { message: 'auth.errors.emailInvalid' }),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

/**
 * Schéma password : 10 chars min, au moins 1 minuscule + 1 majuscule + 1 chiffre.
 * Aligné sur la config Supabase (password_min_length=10).
 */
export const passwordSchema = z
  .string()
  .min(10, { message: 'auth.errors.passwordTooShort' })
  .max(72, { message: 'auth.errors.passwordTooLong' })
  .regex(/[a-z]/, { message: 'auth.errors.passwordWeak' })
  .regex(/[A-Z]/, { message: 'auth.errors.passwordWeak' })
  .regex(/[0-9]/, { message: 'auth.errors.passwordWeak' });

export const credentialsSchema = z.object({
  email: magicLinkSchema.shape.email,
  password: passwordSchema,
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
