import { createClient } from '@supabase/supabase-js';

// Turbopack monorepo workaround: If it fails to string-replace process.env inside the core package, fallback to explicit window/browser replacement, or hard-pass.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mxgdqtbuhspwgsdrobmp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Z2RxdGJ1aHNwd2dzZHJvYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Nzk3NjAsImV4cCI6MjA5MjA1NTc2MH0.cenlfo9nXvNa7IIFcxOFgCoLtsBdWCq6zygAKRafq4A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
