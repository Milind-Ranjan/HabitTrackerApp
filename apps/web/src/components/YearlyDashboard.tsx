'use client';

import React, { useEffect, useState } from 'react';
import { useHabitStore, supabase } from '@habit-tracker/core';
import { ProgressRing } from './ProgressRing';
import { ContributionGraph } from './ContributionGraph';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function YearlyDashboard() {
  const habits = useHabitStore((state) => state.habits);
  const checkIns = useHabitStore((state) => state.checkIns);
  const profile = useHabitStore((state) => state.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  const joiningDateStr = profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '1970-01-01';
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col gap-8 mb-16">

      {/* Header */}
      <header className="flex flex-col items-center text-center gap-2 mb-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 tracking-tight leading-tight">
          Yearly Statistics
        </h1>
        <p className="text-[var(--text-muted)] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] opacity-60">
          Visualization of your dedication across time
        </p>
      </header>

      {/* Contribution Heatmap Container */}
      <div className="w-full">
        <ContributionGraph
          checkIns={checkIns}
          totalHabits={habits.length}
          createdAt={profile?.created_at}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {MONTHS.map((monthName, idx) => {
          const monthStr = String(idx + 1).padStart(2, '0');
          const daysInMonth = new Date(currentYear, idx + 1, 0).getDate();

          // Count only days after joining for this month
          const validDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => {
            const dStr = String(i + 1).padStart(2, '0');
            return `${currentYear}-${monthStr}-${dStr}`;
          }).filter(d => d >= joiningDateStr).length;

          if (validDaysInMonth === 0) return null; // Hide months before joining

          const potential = habits.length * validDaysInMonth;
          const actual = checkIns.filter(c => c.date.startsWith(`${currentYear}-${monthStr}`) && c.completed).length;
          const progress = potential > 0 ? (actual / potential) * 100 : 0;

          return (
            <div key={monthName} className="glass-panel p-6 rounded-3xl shadow-sm border border-[var(--glass-border)] flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md active:scale-95">
              <div>
                <h3 className="text-[var(--heading-color)] font-extrabold text-xl tracking-tight">
                  {monthName}
                </h3>

                <div className="mt-1 text-sm text-[var(--text-muted)]">
                  <p>
                    <b className="text-[var(--text-main)] font-black">
                      {actual}
                    </b> completed checks
                  </p>
                </div>
              </div>

              <ProgressRing progress={progress} size={60} color="#87cefa" label="" subLabel="" />
            </div>
          );
        })}
      </div>

    </div>
  );
}
