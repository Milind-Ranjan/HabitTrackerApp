'use client';

import React, { useEffect, useState, use } from 'react';
import { API, PublicDashboard, useHabitStore, supabase, calculateConsecutiveStreak } from '@habit-tracker/core';
import { ProgressRing } from '@/components/ProgressRing';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ContributionGraph } from '@/components/ContributionGraph';
import { SpatialGarden } from '@/components/SpatialGarden';
import { VisibilityToggle } from '@/components/VisibilityToggle';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);

  const [data, setData] = useState<PublicDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  // Hook into habit store to see if we are the owner
  const router = useRouter();
  const { profile: myProfile, updateProfileVisibility } = useHabitStore();
  const isOwner = myProfile?.username === username;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    API.getPublicProfile(username).then(res => {
      if (!res) {
        setError(true);
      } else {
        setData(res);
      }
      setLoading(false);
    });
  }, [username]);

  if (loading) {
    return <div className="min-h-screen p-8 text-slate-400 font-bold text-center">Loading dashboard...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8 text-center flex flex-col items-center">
        <h2 className="text-2xl font-black text-[var(--heading-color)]">User Not Found</h2>
        <p className="text-[var(--text-muted)] mt-2 font-medium">We couldn't find a public profile for "{username}".</p>
        <Link href="/people" className="mt-6 text-blue-500 font-bold hover:underline">Back to Search</Link>
      </div>
    );
  }

  // Check if we should show private state
  // Even if it's private, the owner should see THEIR OWN data on THEIR OWN public page.
  const showPrivateState = data.isPrivate && !isOwner;

  const totalHabits = data.habits.length;
  const totalChecks = data.checkIns.filter(c => c.completed).length;

  // Global progress percent for the last 30 days
  const potentialLast30Days = totalHabits * 30;
  const progressPercent = potentialLast30Days > 0 ? Math.min(100, Math.round((totalChecks / potentialLast30Days) * 100)) : 0;

  // Calculate Weekly Pacing Data
  const todayDate = new Date();

  const toLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(todayDate.getDate() - 6 + i);
    return toLocalDateString(d);
  });
  const normalizeDate = (dStr: any): string => {
    if (!dStr || typeof dStr !== 'string') return '';
    const clean = dStr.split(' ')[0].split('T')[0].replace(/\//g, '-');
    const parts = clean.split('-');
    if (parts.length !== 3) return clean;
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  };

  const weeklyChecks = past7Days.map(date => {
    const target = normalizeDate(date);
    return data.checkIns.filter(c => normalizeDate(c.date) === target && c.completed).length;
  });
  const maxChecksInWeek = Math.max(1, ...weeklyChecks);
  const totalWeeklyChecks = weeklyChecks.reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col gap-8 mb-16">

      {/* Profile Header */}
      <div className="glass-panel p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left bg-white dark:bg-white/[0.02]">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-300 to-pink-300 flex items-center justify-center text-white font-black text-4xl shadow-inner shadow-pink-500/50">
          {data.profile.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--heading-color)] tracking-tight leading-none">
                {data.profile.username}
              </h1>
              <p className="text-[var(--panel-item-text)] bg-[var(--panel-item-bg)] font-bold px-4 py-1.5 rounded-full inline-block text-[10px] uppercase tracking-wider border border-[var(--glass-border)] shadow-sm">
                {data.profile.is_public ? 'Public' : 'Private'}
              </p>
            </div>

            {isOwner && (
              <div className="flex flex-row items-center justify-center sm:justify-start gap-6 mt-4 sm:mt-0">
                <div className="flex flex-col items-center gap-1.5">
                  <VisibilityToggle
                    isPublic={data.profile.is_public}
                    isUpdating={isUpdatingPrivacy}
                    onToggle={async () => {
                      setIsUpdatingPrivacy(true);
                      await updateProfileVisibility(!data.profile.is_public);
                      setData({ ...data, profile: { ...data.profile, is_public: !data.profile.is_public } });
                      setIsUpdatingPrivacy(false);
                    }}
                  />
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={handleLogout}
                    className="group/logout relative h-10 px-7 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black rounded-full text-[11px] uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex items-center gap-2 hover:text-red-500 hover:border-red-400/50 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover/logout:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">Logout</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 relative z-10 group-hover/logout:translate-x-0.5 transition-transform">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPrivateState ? (
        <div className="glass-panel p-16 rounded-3xl text-center border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center bg-white dark:bg-white/[0.02]">
          <div className="px-4 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 shadow-sm border border-blue-200">
            Private Profile
          </div>
          <h2 className="text-3xl font-black text-[var(--heading-color)] tracking-tight leading-none mb-4">
            Data is currently restricted
          </h2>
          <p className="text-[var(--text-muted)] font-medium max-w-sm leading-relaxed">
            This user has set their habit activity to private. Keep searching to find other friends and stay motivated!
          </p>
          <Link href="/people" className="mt-10 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Find Other Friends
          </Link>
        </div>
      ) : (
        <>
          {/* The Antigravity Garden - Visual Reward Section */}
          <SpatialGarden habits={data.habits} checkIns={data.checkIns} />

          {/* Performance Stats Ribbon - Top 3 Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="glass-panel p-2 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/60 dark:border-white/10 flex flex-col items-center justify-center shadow-lg bg-white dark:bg-white/[0.02] text-center min-w-0">
              <span className="text-xl sm:text-4xl xs:text-5xl font-black text-[var(--text-main)] mb-1 tracking-tighter truncate w-full">{totalChecks}</span>
              <span className="text-[7px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-tight">Total Check-ins</span>
            </div>
            <div className="glass-panel p-2 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/60 dark:border-white/10 flex flex-col items-center justify-center shadow-lg bg-white dark:bg-white/[0.02] text-center min-w-0">
              <span className="text-xl sm:text-4xl xs:text-5xl font-black text-orange-500 mb-1 tracking-tighter truncate w-full">
                {Math.max(0, ...data.habits.map(h => calculateConsecutiveStreak(data.checkIns, h.id)))}
              </span>
              <span className="text-[7px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-tight">Max Streak 🔥</span>
            </div>
            <div className="glass-panel p-2 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/60 dark:border-white/10 flex flex-col items-center justify-center shadow-lg bg-white dark:bg-white/[0.02] text-center min-w-0">
              <span className="text-xl sm:text-4xl xs:text-5xl font-black text-blue-500 mb-1 tracking-tighter truncate w-full">{totalHabits}</span>
              <span className="text-[7px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-tight">Total Habits</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Dedication Ring - Left on Web, Full width on Mobile */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-[2rem] border border-white/60 dark:border-white/10 flex flex-col items-center justify-center shadow-lg bg-white dark:bg-white/[0.02]">
              <ProgressRing
                progress={progressPercent}
                size={140}
                color="#60a5fa"
                label="Dedication"
                subLabel={`${progressPercent}% Accuracy`}
              />
            </div>

            {/* Weekly Graph - Right on Web, Full width on Mobile */}
            <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-[2rem] flex flex-col justify-between border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-white/[0.02] min-h-[250px]">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-[var(--heading-color)] font-black text-lg">Current Week</h3>
                  <p className="text-[var(--text-muted)] text-sm font-bold mt-1">{totalWeeklyChecks} habits checked off in 7 days</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-wider mb-1">Current Habits</p>
                  <p className="text-2xl font-black text-[var(--text-main)]">{totalHabits}</p>
                </div>
              </div>

              {/* Weekly Bar Chart */}
              <div className="flex-1 flex gap-2 sm:gap-4 items-end h-32 w-full mt-4">
                {past7Days.map((dateStr, idx) => {
                  const count = weeklyChecks[idx];
                  const heightPct = (count / maxChecksInWeek) * 100;
                  const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <div key={dateStr} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                      <div className="w-full relative flex justify-center h-full items-end pb-1">
                        <div
                          className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-blue-200 to-blue-400 transition-all duration-500 hover:from-pink-300 hover:to-pink-500"
                          style={{ height: `${heightPct}%`, minHeight: count > 0 ? '10%' : '2%' }}
                        />
                        <span className="absolute -top-6 text-xs font-black text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-[var(--text-muted)]">{dayLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          <div className="mt-2 text-[var(--text-main)]">
            <ContributionGraph
              checkIns={data.checkIns}
              totalHabits={totalHabits}
              createdAt={data.profile.created_at}
            />
          </div>

          <div className="glass-panel p-8 rounded-3xl mt-4 shadow-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
            <h3 className="text-[var(--heading-color)] font-bold mb-6 text-xl">Current Habits</h3>

            {totalHabits === 0 ? (
              <p className="text-[var(--text-muted)] text-center font-medium my-8">This user hasn't added any habits yet!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.habits.map(habit => {
                  const habitChecks = data.checkIns.filter(c => c.habit_id === habit.id && c.completed).length;
                  return (
                    <div key={habit.id} className="bg-[var(--panel-item-bg)]/80 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-blue-500/30 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: habit.color }} />
                        <span className="font-bold text-[var(--text-main)] italic">{habit.title}</span>
                      </div>
                      <span className="text-sm font-bold text-[var(--panel-item-text)] bg-white dark:bg-white/5 px-2 py-1 rounded-lg shadow-sm">
                        {habitChecks} total
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
