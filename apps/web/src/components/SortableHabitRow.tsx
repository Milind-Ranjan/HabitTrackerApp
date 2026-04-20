'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Habit, CheckIn, calculateConsecutiveStreak } from '@habit-tracker/core';

interface SortableHabitRowProps {
  habit: Habit;
  days: string[];
  checkIns: CheckIn[];
  todayISO: string;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  toggleCheckIn: (habitId: string, date: string, e: React.MouseEvent) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string, archive: boolean) => void;
}

export function SortableHabitRow({
  habit,
  days,
  checkIns,
  todayISO,
  deletingId,
  setDeletingId,
  toggleCheckIn,
  deleteHabit,
  archiveHabit,
}: SortableHabitRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  const streak = calculateConsecutiveStreak(checkIns, habit.id);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group/row transition-colors duration-150 ${habit.is_archived ? 'opacity-60 bg-slate-500/5' : 'hover:bg-[var(--item-hover-bg)]'}`}
    >
      <td className="p-2 sm:p-3 border-b border-[var(--glass-border)] sticky left-0 glass-panel z-20 transition-colors after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[1px] after:bg-[var(--glass-border)]">
        <div className="flex items-center justify-between gap-2 sm:gap-3 group/trash">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Drag Handle */}
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 8h16M4 16h16" />
              </svg>
            </div>

            <div
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: habit.color,
                boxShadow: `0 0 6px ${habit.color}80`,
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className={`font-extrabold text-[var(--text-main)] text-[11px] sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-none ${habit.is_archived ? 'line-through' : ''}`}>
                {habit.title}
              </span>
              {streak > 0 && !habit.is_archived && (
                <span className="text-[9px] sm:text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                  🔥 <span className="hidden xs:inline">{streak} Day Streak</span><span className="xs:hidden">{streak}</span>
                </span>
              )}
              {habit.is_archived && (
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Archived
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {deletingId === habit.id ? (
              <div className="flex items-center gap-2 animate-in zoom-in duration-200">
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="text-[9px] font-black uppercase text-red-500 hover:text-red-600 transition-colors"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <button 
                  onClick={() => archiveHabit(habit.id, !habit.is_archived)}
                  className="p-1 text-[var(--text-muted)] hover:text-blue-500 transition-colors"
                  title={habit.is_archived ? "Restore Habit" : "Archive Habit"}
                >
                  {habit.is_archived ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  )}
                </button>
                <button 
                  onClick={() => setDeletingId(habit.id)}
                  className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title="Delete Habit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
      {days.map(d => {
        const isChecked = checkIns.some(c => c.habit_id === habit.id && c.date === d && c.completed);
        const isToday = d === todayISO;
        return (
          <td key={d} className={`p-3 text-center border-b border-[var(--glass-border)] ${isToday ? 'bg-blue-500/5' : ''}`}>
            <button 
              disabled={!isToday || habit.is_archived}
              onClick={(e) => toggleCheckIn(habit.id, d, e)}
              className={`w-6 h-6 rounded-md transition-all duration-200 flex items-center justify-center mx-auto 
                ${isToday && !habit.is_archived ? 'hover:scale-110 cursor-pointer border-2' : 'cursor-not-allowed border opacity-40'} 
                ${isChecked ? 'shadow-sm' : 'border-[var(--glass-border)] bg-[var(--background)]'}`}
              style={{
                backgroundColor: isChecked ? habit.color : undefined,
                borderColor: isChecked ? habit.color : undefined,
                boxShadow: isChecked ? `0 0 8px ${habit.color}70` : undefined,
                transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease, background-color 0.2s ease',
              }}
            >
              {isChecked && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </td>
        );
      })}
    </tr>
  );
}
