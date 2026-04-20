'use client';

import React, { useMemo, useState } from 'react';
import { CheckIn } from '@habit-tracker/core';

interface ContributionGraphProps {
   checkIns: CheckIn[];
   totalHabits: number;
   createdAt?: string;
}

export function ContributionGraph({ checkIns, totalHabits, createdAt }: ContributionGraphProps) {
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

   const years = useMemo(() => {
      const startYear = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      const list = [];
      for (let y = currentYear; y >= startYear; y--) {
         list.push(y);
      }
      return list;
   }, [createdAt]);

   const stats = useMemo(() => {
      const normalizeDate = (dStr: any): string => {
         if (!dStr || typeof dStr !== 'string') return '';
         const clean = dStr.split(' ')[0].split('T')[0].replace(/\//g, '-');
         const parts = clean.split('-');
         if (parts.length !== 3) return clean;
         return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      };

      const map = new Map<string, number>();
      let yearCheckIns = 0;
      let yearActiveDays = 0;

      checkIns.forEach(c => {
         if (c.completed) {
            const normalized = normalizeDate(c.date);
            if (normalized && normalized.startsWith(selectedYear.toString())) {
               map.set(normalized, (map.get(normalized) || 0) + 1);
               yearCheckIns++;
            }
         }
      });

      yearActiveDays = map.size;

      // Generate 12 months for the selected year
      const monthsData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const originStr = createdAt ? normalizeDate(createdAt) : '';

      for (let m = 0; m < 12; m++) {
         const firstDayOfMonth = new Date(selectedYear, m, 1);
         const lastDayOfMonth = new Date(selectedYear, m + 1, 0);

         const days = [];
         // To align correctly, we need to know the start day (Sun=0, Mon=1...)
         const startDayOfWeek = firstDayOfMonth.getDay();

         // We'll create columns. Each column has 7 slots.
         const columns: { date: string, count: number, isOrigin: boolean, isEmpty: boolean }[][] = [];
         let currentColumn: { date: string, count: number, isOrigin: boolean, isEmpty: boolean }[] = [];

         // Fill initial empty slots for the first week
         for (let i = 0; i < startDayOfWeek; i++) {
            currentColumn.push({ date: '', count: 0, isOrigin: false, isEmpty: true });
         }

         for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
            const currentDate = new Date(selectedYear, m, d);
            const ds = `${selectedYear}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const count = map.get(ds) || 0;

            currentColumn.push({
               date: ds,
               count,
               isOrigin: ds === originStr,
               isEmpty: false
            });

            if (currentColumn.length === 7) {
               columns.push(currentColumn);
               currentColumn = [];
            }
         }

         // Fill remaining empty slots for the last week
         if (currentColumn.length > 0) {
            while (currentColumn.length < 7) {
               currentColumn.push({ date: '', count: 0, isOrigin: false, isEmpty: true });
            }
            columns.push(currentColumn);
         }

         monthsData.push({
            name: monthNames[m],
            columns
         });
      }

      return { monthsData, yearCheckIns, yearActiveDays };
   }, [checkIns, selectedYear, createdAt]);

   const getColor = (count: number) => {
      if (count === 0 || totalHabits === 0) return 'var(--glass-border)'; // Dynamic empty color
      const ratio = count / totalHabits;
      if (ratio <= 0.33) return '#dbeafe'; // blue-100
      if (ratio <= 0.66) return '#93c5fd'; // blue-300
      if (ratio < 1) return '#3b82f6'; // blue-500
      return '#1d4ed8'; // blue-700
   };

   return (
      <div className="w-full glass-panel p-6 rounded-3xl shadow-sm flex flex-col gap-6 font-sans">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
               <span className="text-2xl font-black text-[var(--heading-color)] leading-none">{stats.yearCheckIns}</span>
               <span className="text-sm font-bold text-[var(--text-muted)]">Check-ins in {selectedYear}</span>
               <div className="w-4 h-4 rounded-full border border-[var(--glass-border)] flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold cursor-help" title="Count of all completed habit check-ins in this calendar year.">
                  i
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-4 text-[var(--text-muted)] text-sm">
                  <div>Total active days: <span className="font-bold text-[var(--text-main)] ml-1">{stats.yearActiveDays}</span></div>
               </div>

               <div className="relative">
                  <select
                     value={selectedYear}
                     onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                     className="appearance-none bg-[var(--panel-item-bg)] text-[var(--text-main)] font-bold py-1.5 px-4 pr-10 rounded-xl border border-[var(--glass-border)] focus:ring-2 focus:ring-blue-400 cursor-pointer transition-all text-sm shadow-sm"
                  >
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-blue-500">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
               </div>
            </div>
         </div>

         {/* Monthly Grids Layout */}
         <div className="w-full overflow-x-auto hide-scrollbar">
            <div className="flex gap-6 min-w-max pb-2">
               {stats.monthsData.map((month, mIdx) => (
                  <div key={mIdx} className="flex flex-col gap-2 items-center">
                     <div className="flex gap-[3px]">
                        {month.columns.map((col, cIdx) => (
                           <div key={cIdx} className="flex flex-col gap-[3px]">
                              {col.map((cell, rIdx) => (
                                 <div
                                    key={rIdx}
                                    title={cell.isEmpty ? '' : `${cell.count} checks on ${cell.date}${cell.isOrigin ? ' (Joined!)' : ''}`}
                                    className={`w-[13px] h-[13px] rounded-[2px] transition-transform ${cell.isEmpty ? 'opacity-0' : 'hover:scale-125 hover:z-10 cursor-pointer shadow-sm relative flex items-center justify-center'}`}
                                    style={{ 
                                       backgroundColor: cell.isEmpty ? 'transparent' : getColor(cell.count),
                                       border: !cell.isEmpty && cell.count === 0 ? '1px solid var(--glass-border)' : 'none'
                                    }}
                                 >
                                    {cell.isOrigin && (
                                       <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-pulse z-10" />
                                    )}
                                 </div>
                              ))}
                           </div>
                        ))}
                     </div>
                     <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{month.name}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
