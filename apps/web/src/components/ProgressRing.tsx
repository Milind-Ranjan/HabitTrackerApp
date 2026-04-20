'use client';

import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  subLabel?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#ffb6c1',
  label,
  subLabel
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 w-full mx-auto">
      <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Track */}
        <svg
          className="absolute top-0 left-0 -rotate-90"
          width={size}
          height={size}
        >
          <circle
            stroke="currentColor"
            className="text-slate-100 dark:text-white/5"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress */}
          <circle
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-black text-[var(--text-main)]"
            style={{ fontSize: size * 0.175 }}
          >
            {Math.round(clampedProgress)}%
          </span>
        </div>
      </div>

      {(label || subLabel) && (
        <div className="mt-3 text-center">
          {label    && <p className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest">{label}</p>}
          {subLabel && <p className="text-[11px] text-[var(--text-muted)] font-bold mt-0.5">{subLabel}</p>}
        </div>
      )}
    </div>
  );
}
