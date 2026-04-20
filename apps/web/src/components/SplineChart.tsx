'use client';

import React from 'react';

export function SplineChart({ data, daysList = [] }: { data: number[], daysList?: string[] }) {
  if (data.length === 0) return null;

  const maxActual = Math.max(...data, 1);
  const normalizedData = data.map(d => (d / maxActual) * 100);

  const width = 1000;
  const height = 100;
  const step = width / (normalizedData.length > 1 ? normalizedData.length - 1 : 1);

  // Build smooth cubic bezier path
  let pathD = `M 0,${height - normalizedData[0]}`;
  for (let i = 0; i < normalizedData.length - 1; i++) {
    const p0 = { x: i * step,       y: height - normalizedData[i] };
    const p1 = { x: (i + 1) * step, y: height - normalizedData[i + 1] };
    const cx = (p0.x + p1.x) / 2;
    pathD += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
  }

  const fillPathD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const legendIndices = data.length > 5
    ? [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1]
    : Array.from({ length: data.length }, (_, i) => i);

  return (
    <div className="w-full h-full relative flex flex-col pt-2" style={{ willChange: 'contents' }}>
      {/* Y-Grid */}
      <div className="absolute inset-x-0 inset-y-2 flex flex-col justify-between pointer-events-none z-0">
        <div className="border-t border-dashed border-[var(--glass-border)] opacity-50 w-full flex items-center justify-end pr-2 h-0">
          <span className="text-[9px] text-[var(--text-muted)] font-black -mt-3 uppercase tracking-tighter">Max ({maxActual})</span>
        </div>
        <div className="border-t border-dashed border-[var(--glass-border)] opacity-20 w-full" />
        <div className="border-t border-dashed border-[var(--glass-border)] opacity-20 w-full" />
      </div>

      {/* Chart SVG */}
      <div className="relative w-full flex-grow basis-full mt-2 z-10 group overflow-visible">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full absolute inset-0 overflow-visible z-10"
          style={{ willChange: 'transform' }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#ec4899" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#ec4899" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            {/* Glow blur */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Area fill */}
          <path
            d={fillPathD}
            fill="url(#chartGradient)"
            className="transition-opacity duration-500 group-hover:opacity-100 opacity-70"
          />
          {/* Line with glow */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineColor)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-700 ease-in-out"
          />
          {/* Dots on hover */}
          {normalizedData.map((d, i) => (
            <circle
              key={i}
              cx={i * step}
              cy={height - d}
              r="5"
              fill="white"
              stroke="#ec4899"
              strokeWidth="2.5"
              filter="url(#glow)"
              style={{ transition: 'opacity 0.25s ease, r 0.2s ease' }}
              className="opacity-0 group-hover:opacity-100 pointer-events-none"
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between items-center w-full relative h-4 mt-2 mb-[-8px]">
        {legendIndices.map(idx => {
          const dayStr = daysList[idx] ? parseInt(daysList[idx].split('-')[2], 10) : idx + 1;
          return (
            <div
              key={idx}
              className="absolute text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter"
              style={{ left: `${(idx / (data.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
            >
              {dayStr}
            </div>
          );
        })}
      </div>
    </div>
  );
}
