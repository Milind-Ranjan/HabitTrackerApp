'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center bg-[var(--background)]">
          <div className="glass-panel p-12 rounded-[2.5rem] max-w-md w-full border border-red-500/20 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-[var(--heading-color)] tracking-tight">Habit Tracker hit a snag</h2>
            <p className="text-[var(--text-muted)] mt-4 font-medium leading-relaxed">
              Something went wrong during local simulation. Don't worry, your data is safe in orbit.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Re-initialize Systems
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full py-3 text-[var(--text-muted)] hover:text-[var(--text-main)] font-black text-xs uppercase tracking-widest transition-all"
              >
                Attempt Recovery
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40 border border-white/5">
                <p className="text-[10px] font-mono text-red-400 leading-tight">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
