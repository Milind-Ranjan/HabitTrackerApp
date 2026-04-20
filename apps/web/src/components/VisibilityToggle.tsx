'use client';

import React, { useState } from 'react';

interface VisibilityToggleProps {
  isPublic: boolean;
  onToggle: () => void;
  isUpdating?: boolean;
}

export function VisibilityToggle({ isPublic, onToggle, isUpdating }: VisibilityToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isUpdating) return;
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        onClick={handleToggle}
        className={`
          relative w-20 h-10 rounded-full cursor-pointer transition-all duration-500 flex items-center p-2
          border shadow-lg active:scale-95
          ${isPublic
            ? 'bg-blue-500 border-blue-400 shadow-blue-500/20'
            : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-white/10 shadow-black/5'}
          ${isUpdating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
        `}
      >
        {/* Glow Effects */}
        {isPublic && (
          <div className="absolute inset-0 rounded-full bg-blue-400 blur-md opacity-30 animate-pulse" />
        )}

        <div
          className={`
            relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] shadow-xl
            ${isPublic ? 'translate-x-10 bg-white' : 'translate-x-0 bg-white dark:bg-slate-900'}
          `}
        >
          {isUpdating ? (
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-4 h-4 transition-transform duration-500 ${isPublic ? 'text-blue-600' : 'text-slate-400 rotate-180'}`}
              >
                {isPublic ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                )}
              </svg>
              {/* Liquid Trail Effect */}
              <div className={`absolute top-1/2 -left-1 w-2.5 h-0.5 bg-current opacity-20 blur-[1px] transition-all duration-500 ${isAnimating ? 'scale-x-[500%] opacity-100' : 'scale-x-0'}`} />
            </div>
          )}
        </div>

        {/* Subtle Text indicator inside background for modern look */}
        <span className={`absolute left-3 text-[8px] font-black uppercase tracking-tighter transition-opacity duration-300 ${isPublic ? 'text-blue-100 opacity-100' : 'opacity-0'}`}>Public</span>
        <span className={`absolute right-3 text-[8px] font-black uppercase tracking-tighter transition-opacity duration-300 ${isPublic ? 'opacity-0' : 'text-slate-400 opacity-100'}`}>Private</span>
      </div>
    </div>
  );
}
