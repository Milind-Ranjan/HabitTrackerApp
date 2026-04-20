'use client';

import React, { useState } from 'react';
import { supabase } from '@habit-tracker/core';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Always enter the app in dark mode
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      router.push('/');
      router.refresh();
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#ffffff',
    transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(96,165,250,0.5)';
    e.target.style.background = 'rgba(255,255,255,0.06)';
    e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    e.target.style.background = 'rgba(255,255,255,0.04)';
    e.target.style.boxShadow = 'none';
  };

  return (
    // Always dark — no theme dependency
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #000000 0%, #050811 60%, #0d1520 100%)' }}
    >
      {/* Orbital background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full blur-[180px] animate-pulse"
          style={{ top: '-10%', left: '-10%', width: '60%', height: '60%', background: '#1d4ed8', opacity: 0.06 }}
        />
        <div
          className="absolute rounded-full blur-[180px] animate-pulse"
          style={{ top: '40%', right: '-10%', width: '50%', height: '50%', background: '#7e22ce', opacity: 0.05, animationDelay: '2s' }}
        />
        <div
          className="absolute rounded-full blur-[180px] animate-pulse"
          style={{ bottom: '-10%', left: '20%', width: '40%', height: '40%', background: '#4f46e5', opacity: 0.05, animationDelay: '4s' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Card */}
        <div
          className="p-10 rounded-[3rem] relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          {/* Inner top highlight */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
          />

          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 mb-6 relative group">
              <div
                className="absolute inset-0 rounded-full blur-2xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700"
                style={{ background: 'rgba(96,165,250,0.3)' }}
              />
              <div className="absolute inset-0 bg-white rounded-full shadow-md" />
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain relative z-10 p-3 group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Habit Tracker</h1>
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-4 rounded-2xl mb-8 text-[11px] font-bold text-center"
              style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.2)',
                color: '#f87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {[
              { type: 'text', value: username, setter: setUsername, placeholder: 'Unique Username', minLength: undefined },
              { type: 'email', value: email, setter: setEmail, placeholder: 'Email Address', minLength: undefined },
              { type: 'password', value: password, setter: setPassword, placeholder: 'Create Password', minLength: 6 },
            ].map(({ type, value, setter, placeholder, minLength }) => (
              <input
                key={type}
                type={type}
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                minLength={minLength}
                required
                className="w-full rounded-2xl px-6 py-4 font-medium outline-none placeholder-slate-600"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 px-6 py-5 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-[0.97] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 20px 40px -10px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, opacity 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.02) translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 28px 50px -10px rgba(37,99,235,0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px -10px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(100,116,139,0.8)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                className="ml-2 font-black"
                style={{ color: '#60a5fa', transition: 'color 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#93c5fd'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#60a5fa'; }}
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
