import { initialsFor } from '@/lib/profile/avatar';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<Size, number> = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 112,
};

const SIZE_TEXT: Record<Size, string> = {
  sm: 'text-[11px]',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-2xl',
};

interface AvatarProps {
  src: string | null | undefined;
  displayName: string;
  size?: Size;
  /** Classe Tailwind additionnelle. */
  className?: string;
  /**
   * Si l'avatar est accolé à un texte qui nomme déjà la personne (ex. pseudo
   * dans un même `<Link>`), passer `decorative` pour éviter la duplication
   * pour les lecteurs d'écran.
   */
  decorative?: boolean;
}

/**
 * Avatar carré à coins droits (cohérent avec la direction brutaliste du v2).
 * Fallback initiales sur fond "paper" + bordure "ink" si pas d'image.
 *
 * Pour une image optimisée Next.js, on utilisera `<Image />` plus tard ;
 * pour l'instant `<img>` suffit (avatars Supabase publics, cache-buster).
 */
export function Avatar({
  src,
  displayName,
  size = 'md',
  className = '',
  decorative = false,
}: AvatarProps) {
  const px = SIZE_PX[size];
  const initials = initialsFor(displayName);
  const base =
    'inline-flex shrink-0 items-center justify-center overflow-hidden border-2 font-mono uppercase tracking-widest';
  const style: React.CSSProperties = {
    width: px,
    height: px,
    borderColor: 'var(--color-foreground)',
    background: 'var(--color-muted, var(--color-background))',
    color: 'var(--color-foreground)',
  };

  if (src) {
    return (
      <span
        className={`${base} ${className}`.trim()}
        style={style}
        {...(decorative ? { 'aria-hidden': true } : {})}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={decorative ? '' : displayName}
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`${base} ${SIZE_TEXT[size]} ${className}`.trim()}
      style={style}
      {...(decorative
        ? { 'aria-hidden': true }
        : { 'aria-label': displayName })}
    >
      {initials}
    </span>
  );
}
