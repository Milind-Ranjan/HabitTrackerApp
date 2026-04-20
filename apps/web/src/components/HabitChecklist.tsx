'use client';

import React, { useState } from 'react';
import { useHabitStore } from '@habit-tracker/core';
import confetti from 'canvas-confetti';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableHabitRow } from './SortableHabitRow';

export function HabitChecklist({ days }: { days: string[] }) {
  const habits = useHabitStore((state) => state.habits);
  const checkIns = useHabitStore((state) => state.checkIns);
  const toggleCheckInDB = useHabitStore((state) => state.toggleCheckInDB);
  const deleteHabitDB = useHabitStore((state) => state.deleteHabitDB);
  const archiveHabitDB = useHabitStore((state) => state.archiveHabitDB);
  const reorderHabitsDB = useHabitStore((state) => state.reorderHabitsDB);
  const isLoading = useHabitStore((state) => state.isLoading);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to get today's date string in YYYY-MM-DD format
  const getTodayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayISO = getTodayISO();

  const handleConfetti = (x: number, y: number, color: string) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: [color, '#ffffff', '#ffd700'],
      scale: 0.7,
      disableForReducedMotion: true
    });
  };

  const checkDayCompletion = () => {
    const activeHabits = habits.filter(h => !h.is_archived);
    const todayCheckIns = checkIns.filter(c => c.date === todayISO && c.completed && activeHabits.some(h => h.id === c.habit_id)).length;
    
    if (activeHabits.length > 0 && todayCheckIns === activeHabits.length) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#60a5fa', '#ffffff', '#ffd700'],
          disableForReducedMotion: true
        });
      }, 300);
    }
  };

  const toggleCheckIn = async (habitId: string, date: string, e: React.MouseEvent) => {
    if (date !== todayISO) return;

    const isCurrentlyChecked = checkIns.some(c => c.habit_id === habitId && c.date === date && c.completed);
    
    if (!isCurrentlyChecked) {
      const habit = habits.find(h => h.id === habitId);
      handleConfetti(e.clientX, e.clientY, habit?.color || '#3b82f6');
    }

    await toggleCheckInDB(habitId, date);
    setTimeout(checkDayCompletion, 100);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);

      const newOrder = arrayMove(habits, oldIndex, newIndex);
      reorderHabitsDB(newOrder);
    }
  };

  const filteredHabits = habits.filter(h => showArchived || !h.is_archived);

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-sm overflow-hidden border border-[var(--glass-border)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[var(--text-main)] font-bold text-lg tracking-tight">Daily Habit tracker</h3>
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
            showArchived 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
              : 'border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>
      
      <div className="overflow-x-auto pb-4 hide-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-[var(--panel-item-bg)]">
              <th className="p-3 text-left text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-wider sticky left-0 z-30 bg-[var(--panel-item-bg)] border-b border-[var(--glass-border)] min-w-[120px] sm:min-w-[180px]">Habit</th>
              {days.map(d => {
                const dayNum = parseInt(d.split('-')[2], 10);
                const isToday = d === todayISO;
                return (
                  <th 
                    suppressHydrationWarning 
                    key={d} 
                    className={`p-3 text-center text-xs font-black uppercase tracking-tight min-w-[50px] border-b border-[var(--glass-border)] ${isToday ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
                  >
                    {dayNum}
                  </th>
                )
              })}
            </tr>
            </thead>
            <tbody>
            {isLoading && habits.length === 0 ? (
              [1, 2, 3].map((i) => (
                <tr key={`shimmer-${i}`}>
                  <td className="p-4 border-b border-[var(--glass-border)] sticky left-0 glass-panel">
                    <div className="h-4 w-32 shimmer-bg bg-slate-200 dark:bg-white/10 rounded-md" />
                  </td>
                  {days.map(d => (
                    <td key={d} className="p-4 border-b border-[var(--glass-border)]">
                      <div className="h-6 w-6 shimmer-bg bg-slate-200 dark:bg-white/10 rounded-md mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : habits.length === 0 ? (
              <tr>
                <td colSpan={days.length + 1} className="p-12 text-center text-[var(--text-muted)] font-medium">
                  No habits added yet. Start your journey by clicking "+ New Habit"
                </td>
              </tr>
            ) : (
              <SortableContext
                items={filteredHabits.map(h => h.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredHabits.map((habit) => (
                  <SortableHabitRow
                    key={habit.id}
                    habit={habit}
                    days={days}
                    checkIns={checkIns}
                    todayISO={todayISO}
                    deletingId={deletingId}
                    setDeletingId={setDeletingId}
                    toggleCheckIn={toggleCheckIn}
                    deleteHabit={deleteHabitDB}
                    archiveHabit={archiveHabitDB}
                  />
                ))}
              </SortableContext>
            )}
          </tbody>
        </table>
        </DndContext>
      </div>
    </div>
  );
}
