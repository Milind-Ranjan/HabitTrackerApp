'use client';

import React, { useEffect, useState } from 'react';
import { useHabitStore } from '@habit-tracker/core';
import { ProgressRing } from './ProgressRing';
import { HabitChecklist } from './HabitChecklist';
import { AICoach } from './AICoach';
import { AddHabitModal } from './AddHabitModal';
import { SplineChart } from './SplineChart';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function MonthlyTracker({ monthId }: { monthId?: number }) {
  const activeMonthId = monthId || new Date().getMonth() + 1;
  const habits = useHabitStore((state) => state.habits);
  const checkIns = useHabitStore((state) => state.checkIns);
  const profile = useHabitStore((state) => state.profile);
  const isLoading = useHabitStore((state) => state.isLoading);

  const [mounted, setMounted] = useState(false);
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  const currentYear = new Date().getFullYear();
  const monthName = MONTHS[activeMonthId - 1];

  // Calculate joining date in YYYY-MM-DD format
  const joiningDateStr = profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '1970-01-01';

  // Calculate specific days in this month
  const daysInMonth = new Date(currentYear, activeMonthId, 0).getDate();
  const monthStr = String(activeMonthId).padStart(2, '0');

  // Create array of ISODates for this month [YYYY-MM-01, YYYY-MM-02...]
  const allDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => {
    const dStr = String(i + 1).padStart(2, '0');
    return `${currentYear}-${monthStr}-${dStr}`;
  });

  const days = allDaysInMonth.filter(date => date >= joiningDateStr); // Filter out days before joining

  // Calculate metrics for this specific month
  const potentialChecks = habits.length * days.length;
  const checksThisMonth = checkIns.filter(c => c.date.startsWith(`${currentYear}-${monthStr}`) && c.completed).length;
  const progressPercent = potentialChecks > 0 ? (checksThisMonth / potentialChecks) * 100 : 0;

  const habitsLeft = Math.max(0, potentialChecks - checksThisMonth);

  // Let's create weekly stats for the overview chart! Assume 4 weeks roughly
  const weekStats = [
    { label: 'Week 1', days: allDaysInMonth.slice(0, 7) },
    { label: 'Week 2', days: allDaysInMonth.slice(7, 14) },
    { label: 'Week 3', days: allDaysInMonth.slice(14, 21) },
    { label: 'Week 4', days: allDaysInMonth.slice(21, allDaysInMonth.length) },
  ].map(week => {
    // Only count days in this week that are after the joining date
    const validWeekDays = week.days.filter(d => d >= joiningDateStr);
    const potential = habits.length * validWeekDays.length;
    const actual = checkIns.filter(c => validWeekDays.includes(c.date) && c.completed).length;
    return {
      label: week.label,
      actual,
      potential,
      left: potential - actual,
      percent: potential > 0 ? (actual / potential) * 100 : 0
    }
  });

  return (
    <div className={`w-full mx-auto p-4 sm:p-8 flex flex-col gap-8 mb-16 transition-opacity duration-500 ${mounted ? 'fade-in opacity-100' : 'opacity-0'}`}>
      <header className="relative flex flex-col lg:flex-row justify-between items-center gap-4 max-w-7xl mx-auto w-full px-4">
        {/* Invisible spacer for center alignment on desktop */}
        <div className="hidden lg:block lg:w-[150px]" /> 
        
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 tracking-tight leading-tight">
            {monthName} {currentYear}
          </h1>
          <p className="text-[var(--text-muted)] font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1 opacity-60">Target vs Monthly completion</p>
        </div>

        <button
          onClick={() => setIsAddingHabit(true)}
          className="lg:w-[150px] px-4 py-2 sm:px-5 sm:py-2.5 bg-[var(--panel-item-bg)] text-[var(--text-main)] font-black border border-[var(--glass-border)] rounded-xl shadow-sm transition-all overflow-hidden relative group hover:bg-[var(--item-hover-bg)] hover:text-[var(--item-hover-text)] active:scale-95 text-[10px] sm:text-xs whitespace-nowrap"
        >
          <span className="relative z-10">+ Add New Habit</span>
        </button>
      </header>

      {/* Main Excel-Like Table */}
      <div className="w-full">
        <HabitChecklist days={days} />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full items-stretch">
        {/* Weekly Overview - Top on Mobile, Right on Desktop */}
        <div className="order-1 lg:order-2 lg:col-span-3 glass-panel p-6 sm:p-8 rounded-[2.5rem] flex flex-col border border-white dark:border-white/10 shadow-xl overflow-hidden relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400 opacity-5 blur-[80px]" />

          <h3 className="font-bold text-[var(--heading-color)] mb-8 text-[10px] uppercase tracking-[0.3em] opacity-50">Analytical Performance</h3>

          <div className="flex flex-col md:flex-row gap-6 min-h-[200px] md:h-64 items-stretch mb-4">
            {/* Left Metrics column */}
            <div className="flex flex-row md:flex-col justify-between py-2 min-w-full md:min-w-[140px] border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 pb-6 md:pb-0 md:pr-10 gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Success</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter">{checksThisMonth}</span>
                  <span className="text-[10px] md:text-xs font-bold text-[var(--text-muted)]">done</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1">Pending</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter">{habitsLeft}</span>
                  <span className="text-[10px] md:text-xs font-bold text-[var(--text-muted)]">left</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Accuracy</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tighter">{Math.round(progressPercent)}%</span>
                </div>
              </div>
            </div>

            {/* Right Weekly Bars - Compressed */}
            <div className="flex-1 grid grid-cols-4 gap-2 sm:gap-4 items-end relative border-b border-slate-100 dark:border-white/5 pb-4">
              {isLoading && habits.length === 0 ? (
                // Shimmer Bars
                [1, 2, 3, 4].map(i => (
                  <div key={`bar-shimmer-${i}`} className="flex flex-col items-center h-full justify-end gap-1">
                    <div className="w-6 sm:w-10 bg-slate-200 dark:bg-white/5 rounded-t-xl h-full shimmer-bg" style={{ height: `${20 + i * 15}%` }} />
                    <div className="h-1.5 w-6 sm:w-8 bg-slate-200 dark:bg-white/5 rounded-full shimmer-bg mt-3" />
                  </div>
                ))
              ) : (
                weekStats.map(w => (
                  <div key={w.label} className="flex flex-col items-center h-full justify-end gap-1 group">
                    <div className="w-full flex justify-center items-end h-full gap-1">
                      <div className="w-6 sm:w-10 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-t-xl relative h-full flex items-end overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-sm transition-all duration-700 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                          style={{ height: `${Math.max(4, w.percent)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black text-[var(--text-muted)] mt-3 uppercase tracking-tighter sm:tracking-widest">{w.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-auto pt-8 h-44 w-full">
            <SplineChart data={days.map(d => checkIns.filter(c => c.date === d && c.completed).length)} />
          </div>
        </div>

        {/* Sidebar Column - Bottom on Mobile, Left on Desktop */}
        <div className="order-2 lg:order-1 lg:col-span-1 flex flex-col gap-6">
          <div className={`glass-panel rounded-3xl p-6 flex flex-col justify-center items-center shadow-sm relative border border-white dark:border-white/10 ${isLoading && habits.length === 0 ? 'shimmer-bg' : ''}`}>
            {isLoading && habits.length === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">Syncing...</p>
              </div>
            ) : habits.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-4">
                <span className="text-2xl">🌱</span>
                <p className="text-[var(--text-muted)] font-bold text-xs">No habits tracked</p>
              </div>
            ) : (
              <ProgressRing progress={progressPercent} size={150} color="#60a5fa" label="Month Progress" subLabel={`${checksThisMonth} checks`} />
            )}
          </div>

          <AICoach />
        </div>
      </div>

      {isAddingHabit && <AddHabitModal onClose={() => setIsAddingHabit(false)} />}
    </div>
  );
}
