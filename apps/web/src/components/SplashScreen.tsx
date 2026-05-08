'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('ftp-splash')) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem('ftp-splash', '1');
    const t1 = setTimeout(() => setFading(true), 1600);
    const t2 = setTimeout(() => setVisible(false), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--paper)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '0.75rem',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.7s ease',
      pointerEvents: 'none',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(1.6rem, 6vw, 2.8rem)',
        fontWeight: 700,
        color: 'var(--ink)',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        textAlign: 'center',
        animation: 'splashIn 0.9s ease forwards',
        opacity: 0,
        margin: 0,
        padding: '0 1.5rem',
      }}>
        Cut the narratives.<br />See things for what they are.
      </h1>
      <p style={{
        fontFamily: 'var(--font-crimson)',
        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
        color: 'var(--ink-faint)',
        fontStyle: 'italic',
        animation: 'splashIn 0.9s ease 0.5s forwards',
        opacity: 0,
        margin: '0.5rem 0 0',
        textAlign: 'center',
        letterSpacing: '0.02em',
      }}>
        Agentic AI-Powered Fact-Checking News Platform
      </p>
    </div>
  );
}
