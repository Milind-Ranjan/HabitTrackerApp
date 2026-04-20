'use client';

import React, { useEffect, useState } from 'react';
import { supabase, useHabitStore } from '@habit-tracker/core';
import { useRouter, usePathname } from 'next/navigation';

// Full-screen themed skeleton shown while session resolves
function AppSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500 flex flex-col">
      {/* Nav skeleton */}
      <div className="w-full h-16 border-b border-[var(--glass-border)] glass-panel flex items-center px-8 gap-4">
        <div className="h-4 w-24 rounded-full shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="h-4 w-20 rounded-full shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="h-4 w-24 rounded-full shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="ml-auto h-8 w-24 rounded-xl shimmer-bg bg-slate-200 dark:bg-white/5" />
      </div>
      {/* Body skeleton */}
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        <div className="h-8 w-48 rounded-xl shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="h-40 w-full rounded-3xl shimmer-bg bg-slate-200 dark:bg-white/5" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 rounded-2xl shimmer-bg bg-slate-200 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [loading, setLoading] = useState(true);
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      let isSubscribed = true;

      const checkSession = async () => {
         const safetyTimeout = setTimeout(() => {
            if (isSubscribed) setLoading(false);
         }, 2500);

         try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!isSubscribed) return;

            if (session) {
               useHabitStore.getState().fetchData();
               if (pathname === '/login' || pathname === '/register') {
                  router.replace('/');
               }
            } else {
               if (pathname !== '/login' && pathname !== '/register') {
                  router.replace('/login');
               }
            }
         } catch (e) {
            console.error('[AuthProvider] Error in checkSession:', e);
         } finally {
            if (isSubscribed) {
               clearTimeout(safetyTimeout);
               setLoading(false);
            }
         }
      };

      checkSession();

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
         if (event === 'SIGNED_IN' && session) {
            useHabitStore.getState().fetchData();
            if (pathname === '/login' || pathname === '/register') {
               router.replace('/');
            }
         } else if (event === 'SIGNED_OUT') {
            useHabitStore.getState().clearState();
            if (pathname !== '/login' && pathname !== '/register') {
               router.replace('/login');
            }
         }
      });

      return () => {
         isSubscribed = false;
         authListener.subscription.unsubscribe();
      };
   }, [router]);

   if (loading) {
      return <AppSkeleton />;
   }

   return <>{children}</>;
}
