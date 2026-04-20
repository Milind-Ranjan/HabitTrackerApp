import React, { useMemo } from 'react';
import { Habit, CheckIn, calculateConsecutiveStreak, seededRandom } from '@habit-tracker/core';

interface SpatialGardenProps {
  habits: Habit[];
  checkIns: CheckIn[];
}

export function SpatialGarden({ habits, checkIns }: SpatialGardenProps) {
  const crystals = useMemo(() => {
    return habits.map((habit, idx) => {
      const streak = calculateConsecutiveStreak(checkIns, habit.id);
      const totalChecks = checkIns.filter(c => c.habit_id === habit.id && c.completed).length;

      // Calculate growth metrics
      const size = Math.min(100, 35 + (totalChecks * 1.2));

      // Evolution stages based on streak
      let stage: 1 | 2 | 3 = 1;
      if (streak >= 7) stage = 3;
      else if (streak >= 3) stage = 2;

      const glowScale = Math.min(2, 1 + (streak / 6));

      return {
        id: habit.id,
        title: habit.title,
        color: habit.color,
        size,
        stage,
        glowScale,
        streak,
        // Deterministic positioning based on habit ID
        left: (seededRandom(habit.id + 'x') * 70) + 15,
        bottom: (seededRandom(habit.id + 'y') * 30) + 15,
        delay: seededRandom(habit.id + 'd') * 2,
        floatDuration: 6 + seededRandom(habit.id + 'f') * 4
      };
    });
  }, [habits, checkIns]);

  return (
    <div className="relative w-full h-[280px] xs:h-[340px] sm:h-[440px] glass-panel rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden mb-6 border border-white/60 dark:border-white/10 shadow-2xl group/garden bg-white/5 dark:bg-transparent transition-all duration-700">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 dark:from-blue-900/10 dark:to-purple-900/10 pointer-events-none" />

      {/* Drifting Particles - Deterministic */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 dark:bg-white/40 rounded-full animate-pulse"
            style={{
              left: `${seededRandom('p' + i + 'l') * 100}%`,
              top: `${seededRandom('p' + i + 't') * 100}%`,
              animationDelay: `${seededRandom('p' + i + 'd') * 5}s`,
              animationDuration: `${5 + seededRandom('p' + i + 'f') * 7}s`
            }}
          />
        ))}
      </div>

      {/* Info Button */}
      <div className="absolute top-4 right-6 sm:top-8 sm:right-10 z-50 group/info">
        <button className="w-6 h-6 rounded-full border border-[var(--glass-border)] flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] hover:text-blue-500 hover:border-blue-500 transition-all bg-[var(--glass-bg)]">
          i
        </button>
        <div className="absolute top-full right-0 mt-3 w-64 glass-panel p-5 rounded-3xl opacity-0 group-hover/info:opacity-100 transition-all pointer-events-none shadow-2xl border border-white/40 dark:border-white/10 translate-y-2 group-hover/info:translate-y-0 text-[var(--text-main)] z-[100]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3">Garden Language</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <p className="text-[9px] font-bold leading-tight uppercase opacity-70">Size = Total Dedication</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <p className="text-[9px] font-bold leading-tight uppercase opacity-70">Stage = Active Streak</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <p className="text-[9px] font-bold leading-tight uppercase opacity-70">Glow = Momentum</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-8 left-10 z-20">
        <h3 className="text-xs font-black text-[var(--text-main)] uppercase tracking-[0.4em] opacity-40">Habit Garden</h3>
      </div>

      {habits.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center animate-in fade-in duration-1000">
          <div className="flex flex-col items-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 animate-bounce duration-[3000ms]">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            </div>
            <h4 className="text-lg font-black text-[var(--heading-color)] tracking-tight">Your garden is a void</h4>
            <p className="text-sm font-medium text-[var(--text-muted)] mt-2 leading-relaxed italic">
              "Every great achievement starts with the decision to try."
            </p>
            <p className="text-[10px] font-black uppercase spacing-widest text-blue-500 mt-6 animate-pulse">
              Plant your first habit to see it grow →
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-end justify-center perspective-[1500px]">
          {crystals.map((crystal) => (
            <div
              key={crystal.id}
              className="absolute transition-all duration-1000 ease-out hover:z-50 group/crystal"
              style={{
                left: `${crystal.left}%`,
                bottom: `${crystal.bottom}%`,
                width: crystal.size,
                height: crystal.size,
                animation: `float-vibe ${crystal.floatDuration}s ease-in-out infinite alternate`,
                animationDelay: `${crystal.delay}s`
              }}
            >
              <CrystalCluster
                color={crystal.color}
                stage={crystal.stage}
                glow={crystal.glowScale}
                streak={crystal.streak}
                title={crystal.title}
              />
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 glass-panel px-4 py-2.5 rounded-2xl text-[var(--text-main)] opacity-0 group-hover/crystal:opacity-100 transition-all scale-75 group-hover/crystal:scale-100 whitespace-nowrap shadow-2xl pointer-events-none z-50 border border-white/30">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: crystal.color }}>{crystal.title}</span>
                  <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{crystal.streak} Day Streak • Stage {crystal.stage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CrystalCluster({ color, stage, glow, streak, title }: {
  color: string,
  stage: 1 | 2 | 3,
  glow: number,
  streak: number,
  title: string
}) {
  const safeId = title.replace(/\s+/g, '') + streak;

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full transition-all duration-700 hover:scale-[1.6] cursor-pointer drop-shadow-2xl overflow-visible"
      style={{
        filter: `drop-shadow(0 0 ${12 * glow}px ${color}60) drop-shadow(0 0 2px ${color})`,
      } as any}
    >
      <defs>
        <linearGradient id={`grad-core-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: color, stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id={`grad-side-${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="25" ry="6" fill="black" opacity="0.08" className="blur-lg" />
      {stage >= 3 && (
        <g opacity="0.6" className="animate-pulse">
          <path d="M 20 60 L 10 40 L 25 30 L 35 55 Z" fill={`url(#grad-side-${safeId})`} />
          <path d="M 80 60 L 90 40 L 75 30 L 65 55 Z" fill={`url(#grad-side-${safeId})`} />
        </g>
      )}
      {stage >= 2 && (
        <g opacity="0.8">
          <path d="M 35 80 L 20 45 L 45 40 L 50 80 Z" fill={`url(#grad-side-${safeId})`} />
          <path d="M 65 80 L 80 45 L 55 40 L 50 80 Z" fill={`url(#grad-side-${safeId})`} />
        </g>
      )}
      <g className="animate-pulse" style={{ animationDuration: `${Math.max(1.5, 4 - glow)}s` }}>
        <path d="M 50 5 L 80 40 L 75 85 L 25 85 L 20 40 Z" fill={`url(#grad-core-${safeId})`} stroke={color} strokeWidth="0.5" className="dark:stroke-transparent stroke-blue-500/20" />
        <path d="M 50 5 L 80 40 L 20 40 Z" fill="white" opacity="0.15" />
        <path d="M 80 40 L 75 85 L 50 40 Z" fill="black" opacity="0.1" />
        <path d="M 20 40 L 25 85 L 50 40 Z" fill="white" opacity="0.1" />
        <path d="M 50 15 L 70 40 L 50 80 L 30 40 Z" fill="white" opacity="0.1" className="animate-shimmer" />
      </g>
      <circle cx="50" cy="45" r={4 + streak / 2} fill="white" opacity={0.3 * glow} filter="blur(6px)" />
      {streak > 5 && [...Array(3)].map((_, i) => (
        <path key={i} d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="white" className="animate-spin-slow" style={{ transform: `translate(${25 + i * 25}px, ${20 + (i % 2) * 10}px)`, animationDuration: `${3 + i}s` }} />
      ))}
    </svg>
  );
}
