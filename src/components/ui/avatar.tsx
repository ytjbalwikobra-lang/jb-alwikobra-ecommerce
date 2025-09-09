import React from 'react';

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

interface AvatarImageProps {
  src: string;
  alt: string;
}

interface AvatarFallbackProps {
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt }) => (
  <img className="aspect-square h-full w-full" src={src} alt={alt} />
);

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children }) => (
  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
    {children}
  </div>
);
