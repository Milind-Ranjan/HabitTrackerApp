'use client';

import React, { useEffect, useState } from 'react';

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('theme');
    const isDarkInitial = saved === null ? true : saved === 'dark';
    setIsDark(isDarkInitial);
    if (isDarkInitial) {
      document.documentElement.classList.add('dark');
      if (saved === null) localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!isMounted) return <div className="w-14 h-7" />;

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleDarkMode}
      className="relative w-14 h-7 rounded-full cursor-pointer flex items-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      style={{
        background: isDark
          ? 'rgba(30,41,59,0.9)'
          : 'rgba(226,232,240,0.9)',
        boxShadow: isDark
          ? 'inset 0 2px 8px rgba(0,0,0,0.4)'
          : 'inset 0 2px 4px rgba(0,0,0,0.1)',
        transition: 'background 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease',
      }}
    >
      {/* Thumb */}
      <span
        className="absolute flex items-center justify-center w-5 h-5 rounded-full shadow-md"
        style={{
          background: isDark ? '#1e293b' : '#ffffff',
          left: isDark ? 'calc(100% - 1.5rem)' : '0.25rem',
          transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
        }}
      >
        {/* Icon */}
        <span
          style={{
            fontSize: 11,
            lineHeight: 1,
            opacity: 1,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  );
}
