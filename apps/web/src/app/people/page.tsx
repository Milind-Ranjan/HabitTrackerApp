'use client';

import React, { useState, useEffect } from 'react';
import { API, PublicProfile } from '@habit-tracker/core';
import Link from 'next/link';

export default function PeoplePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const users = await API.searchProfiles(query);
        setResults(users);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500); // debounce search

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 flex flex-col gap-8 mb-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 tracking-tight">
          Find Friends
        </h1>
        <p className="text-slate-500 font-medium">Search for friends by username to view their public accountability dashboards!</p>
      </header>

      <div className="glass-panel p-6 rounded-3xl shadow-sm border border-white">
        <input 
          autoFocus
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a username..."
          className="w-full border-2 border-gray-100 rounded-xl px-4 py-4 bg-white/50 focus:bg-white focus:outline-none focus:border-blue-300 transition-colors shadow-sm text-slate-700 font-bold"
        />
      </div>

      <div className="flex flex-col gap-4">
        {loading && <div className="text-center text-slate-400 font-bold animate-pulse">Searching...</div>}
        
        {!loading && query && results.length === 0 && (
          <div className="text-center text-slate-400 font-bold">No users found for "{query}"</div>
        )}

        {results.map(user => (
          <Link key={user.id} href={`/u/${user.username}`}>
            <div className="glass-panel p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-pink-200 transition-all cursor-pointer flex items-center justify-between group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-pink-200 flex items-center justify-center text-blue-900 font-black text-xl shadow-inner">
                     {user.username.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-slate-700 font-bold text-xl group-hover:text-pink-500 transition-colors">{user.username}</h3>
               </div>
               <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
