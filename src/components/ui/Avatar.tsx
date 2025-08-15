import React, { memo, useMemo } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Avatar = memo(function Avatar({ src, name = '', size = 96, className = '', onClick }: AvatarProps) {
  // Génère les initiales à partir du nom (memoized)
  const initials = useMemo(() => 
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?',
    [name]
  );

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold select-none shadow-md ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      title={name}
    >
      {src && src !== '/default-avatar.png' && src !== '/default-avatar.svg' ? (
        <Image
          src={src}
          alt={name || 'Avatar'}
          className="object-cover w-full h-full rounded-full border-2 border-white"
          width={size}
          height={size}
          priority={size > 96} // LCP CRITICAL: Priority seulement pour grands avatars
          sizes={`${size}px`} // LCP CRITICAL: Optimise le téléchargement
          quality={size > 96 ? 80 : 60} // LCP CRITICAL: Qualité réduite pour petits avatars
          loading={size <= 32 ? 'lazy' : 'eager'} // LCP CRITICAL: Lazy loading pour mini avatars
          onError={(e) => {
            // Masquer l'image si elle ne charge pas
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
});

export default Avatar; 