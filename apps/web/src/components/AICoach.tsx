'use client';

import React, { useState } from 'react';
import { useHabitStore, analyzeHabitPatterns } from '@habit-tracker/core';

export function AICoach() {
  const { habits, checkIns, isLoading } = useHabitStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setInsight(null);
    setError(null);

    try {
      const patterns = analyzeHabitPatterns(habits, checkIns);

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitStats: patterns })
      });

      const data = await response.json();

      // Server may return a friendly message in `advice` even on overload
      if (data.advice) {
        setInsight(data.advice);
        setError(null);
      } else {
        throw new Error(data.details || data.error || 'No advice received');
      }
    } catch (err: any) {
      console.error('AI Coach Error:', err);
      setError(err.message || 'Failed to reach the Architect.');
      setInsight(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading && !insight) {
    return (
      <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden border border-[var(--glass-border)] h-full min-h-[220px]">
        <div className="w-16 h-16 mb-4 rounded-2xl shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="h-3 w-24 mb-2 rounded-full shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="h-2 w-32 mb-6 rounded-full shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="h-10 w-full rounded-2xl shimmer-bg bg-slate-200 dark:bg-white/5" />
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden border border-blue-100 dark:border-blue-900 shadow-xl transition-all hover:shadow-2xl">
      {/* Background Decorative Aura */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[50px] transition-all duration-1000 ${error ? 'bg-red-400 opacity-20' : 'bg-blue-400 opacity-10'} ${isAnalyzing ? 'scale-150 opacity-20' : ''}`} />
      
      <div className="w-16 h-16 mb-4 relative group">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-50 group-hover:scale-100 transition-all duration-500" />
        <div className="absolute inset-2 dark:bg-white rounded-2xl shadow-inner hidden dark:block" />
        <img src="/logo.png" alt="AI Agent" className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-110 duration-500" />
        {isAnalyzing && (
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-30 z-20" />
        )}
      </div>

      <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-1">AI Habit Architect</h3>
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Personal Behavioral Coach</p>

      {insight ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50 mb-6">
            <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed italic">
              "{insight}"
            </p>
          </div>
          <button 
            onClick={() => setInsight(null)}
            className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:tracking-[0.2em] transition-all"
          >
            Acknowledge Coach
          </button>
        </div>
      ) : error ? (
        <div className="animate-in zoom-in duration-300 w-full">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 mb-6">
             <span className="text-xl mb-2 block">⚠️</span>
             <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tighter mb-1">Connection Issue</p>
             <p className="text-[10px] text-[var(--text-main)] font-medium leading-tight mb-2">{error}</p>
             <p className="text-[9px] text-[var(--text-muted)] italic">Google's AI servers may be momentarily busy — try again in a few seconds.</p>
          </div>
          <button 
            onClick={() => handleAnalyze()}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
          >
            Try Recalibrating
          </button>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-500/20 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-blue-500/40'}`}
        >
          {isAnalyzing ? 'Analyzing Strategy...' : 'Consult Architect'}
        </button>
      )}

      {/* Decorative Dots */}
      <div className="absolute bottom-4 flex gap-1">
        <div className={`w-1 h-1 rounded-full bg-blue-400 ${isAnalyzing ? 'animate-bounce' : 'opacity-20'}`} />
        <div className={`w-1 h-1 rounded-full bg-blue-400 ${isAnalyzing ? 'animate-bounce' : 'opacity-20'}`} style={{ animationDelay: '0.2s' }} />
        <div className={`w-1 h-1 rounded-full bg-blue-400 ${isAnalyzing ? 'animate-bounce' : 'opacity-20'}`} style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}
