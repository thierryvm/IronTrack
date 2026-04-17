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
