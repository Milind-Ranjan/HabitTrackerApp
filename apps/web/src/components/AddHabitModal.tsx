'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useHabitStore } from '@habit-tracker/core';

export function AddHabitModal({ onClose }: { onClose: () => void }) {
  const addHabitDB = useHabitStore((state) => state.addHabitDB);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#ffb6c1');
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  const COLORS = [
    '#ffb6c1', '#87cefa', '#98fb98', '#dda0dd', '#f0e68c', '#ffdab9', '#add8e6'
  ];

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    await addHabitDB({ title: title.trim(), color, target_days: 7 });
    onClose();
  }, [title, color, saving, addHabitDB, onClose]);

  // Keyboard support: Enter to save, Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'Enter' && title.trim()) handleSave();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose, handleSave, title]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ 
        opacity: visible ? 1 : 0, 
        transition: 'opacity 0.2s ease' 
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="glass-panel p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-[var(--glass-border)]"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
        }}
      >
        <h3 className="text-xl font-black text-[var(--heading-color)] mb-5 tracking-tight uppercase">Create New Habit</h3>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">
              Habit Name
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Read 10 pages"
              className="w-full border-2 border-[var(--glass-border)] rounded-xl px-4 py-3 bg-[var(--panel-item-bg)] focus:bg-[var(--background)] focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 text-[var(--text-main)] font-bold placeholder-[var(--text-muted)] shadow-sm"
              style={{ transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease' }}
            />
          </div>

          <div>
            <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">
              Theme Color
            </label>
            <div className="flex bg-[var(--panel-item-bg)] border-2 border-[var(--glass-border)] p-2 rounded-xl flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'rgba(100,100,100,0.6)' : 'transparent',
                    transform: color === c ? 'scale(1.18)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 3px ${c}40` : 'none',
                    transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease, border-color 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-[var(--panel-item-bg)] border-2 border-[var(--glass-border)] text-[var(--text-main)] rounded-xl font-black uppercase text-xs tracking-widest active:scale-95"
            style={{ transition: 'background-color 0.15s ease, transform 0.1s ease' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ transition: 'opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease' }}
          >
            {saving ? 'Saving...' : 'Save Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}
