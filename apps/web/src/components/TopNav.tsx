'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, useHabitStore } from '@habit-tracker/core';
import { DarkModeToggle } from './DarkModeToggle';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const NAV_LINKS = [
  { href: '/',       label: 'My Habits' },
  { href: '/stats',  label: 'Yearly Statistics' },
  { href: '/people', label: 'Find Friends' },
];

export function TopNav() {
  const pathname = usePathname();
  const profile = useHabitStore(state => state.profile);

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="w-full sticky top-0 z-50 border-b border-[var(--glass-border)]"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 1px 0 var(--glass-border)',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Left: logo + links */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/" className="flex-shrink-0 mr-4 group">
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 tracking-tight"
              style={{ transition: 'filter 0.2s ease' }}
            >
              Dashboard
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-xl text-sm font-black overflow-hidden"
                  style={{
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    background: isActive ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
                    transform: 'translateY(0) scale(1)',
                    transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--item-hover-bg)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--item-hover-text)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px) scale(1.02)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-main)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                  onMouseDown={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)';
                  }}
                  onMouseUp={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px) scale(1.02)';
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: theme toggle + profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <DarkModeToggle />
          {profile && (
            <Link
              href={`/u/${profile.username}`}
              className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-white font-bold rounded-xl text-sm whitespace-nowrap active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #f472b6)',
                boxShadow: '0 2px 8px rgba(96,165,250,0.3)',
              }}
              title="My Profile Dashboard"
            >
              <span className="hidden sm:inline">My Profile</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
