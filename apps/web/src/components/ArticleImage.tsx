'use client';

import { useState } from 'react';

type Props = {
  src: string | null;
  alt: string;
  initials: string;
  color: string;
  size?: number;
};

export function ArticleImage({ src, alt, initials, color, size = 72 }: Props) {
  const [failed, setFailed] = useState(false);

  const style: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    objectFit: 'cover',
    display: 'block',
  };

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={style}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: coloured square with source initials
  return (
    <div style={{
      ...style,
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'var(--font-sans)',
      fontSize: size * 0.28,
      fontWeight: 700,
      letterSpacing: '0.05em',
      opacity: 0.85,
    }}>
      {initials}
    </div>
  );
}
