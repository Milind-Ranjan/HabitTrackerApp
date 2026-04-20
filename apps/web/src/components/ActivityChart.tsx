'use client';

import React from 'react';
import { useHabitStore } from '@habit-tracker/core';

export function ActivityChart({ daysList }: { daysList?: string[] }) {
  const habits = useHabitStore((state) => state.habits);
  const checkIns = useHabitStore((state) => state.checkIns);

  // Generate last 14 days if no list provided
  const days = daysList || Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const generateHeight = (date: string) => {
     let completedCount = 0;
     habits.forEach(h => {
        if (checkIns.some(c => c.habit_id === h.id && c.date === date && c.completed)) {
            completedCount++;
        }
     });
     const max = habits.length || 1;
     return (completedCount / max) * 100;
  };

  if(!habits.length) return null;

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <h2 className="text-sm font-black text-[var(--heading-color)] mb-6 tracking-widest uppercase">Activity Snapshot</h2>
      <div className="flex items-end gap-2 h-32 w-full mt-auto">
        {days.map((d, i) => {
           const heightPercent = generateHeight(d);
           return (
             <div key={d} className="flex-1 flex flex-col justify-end h-full group relative">
                <div 
                   className="w-full bg-gradient-to-t from-blue-200 to-pink-200 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                   style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--bg-color)] border border-[var(--glass-border)] text-[var(--text-color)] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                   {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {Math.round(heightPercent)}%
                </div>
             </div>
           );
        })}
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t border-[var(--glass-border)] text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter">
         <span>{days[0] ? new Date(days[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : ''}</span>
         <span>{days[days.length - 1] ? new Date(days[days.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : ''}</span>
      </div>
    </div>
  );
}
