import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Avatar({ src, name = '', size = 96, className = '', onClick }: AvatarProps) {
  // Génère les initiales à partir du nom
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold select-none shadow-md ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      title={name}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="object-cover w-full h-full rounded-full border-2 border-white"
          style={{ width: size, height: size }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
} 