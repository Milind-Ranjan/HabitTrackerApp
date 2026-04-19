import { supabase } from './supabase';
import { Habit, CheckIn } from './store';

export interface PublicProfile {
  id: string;
  username: string;
  is_public: boolean;
  created_at: string;
}

export interface PublicDashboard {
  profile: PublicProfile;
  habits: Habit[];
  checkIns: CheckIn[];
  isPrivate?: boolean;
}

export const API = {
  searchProfiles: async (query: string): Promise<PublicProfile[]> => {
    if (!query.trim()) return [];
    
    // Perform a naive ILIKE search for usernames (requires RLS to allow select on profiles)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, is_public, created_at')
      .ilike('username', `%${query.trim()}%`)
      .limit(20);

    if (error) {
      console.error('Search error:', error);
      return [];
    }

    return data || [];
  },

  getPublicProfile: async (username: string): Promise<PublicDashboard | null> => {
    // 1. Get the profile ID for this username
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('id, username, is_public, created_at')
      .eq('username', username)
      .single();

    if (profileErr || !profileData) {
      return null;
    }

    // 2. Fetch their public habits and check-ins (requires updated RLS policies)
    const [habitsRes, checkInsRes] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', profileData.id),
      // We cannot easily filter check_ins by user_id directly if it's not on the table.
      // But we can fetch check_ins whose habit_id is in their habits.
      // The easiest way: Get their habits first, then fetch checkins IN that habit list,
      // OR let Supabase RLS handle what is returned by just fetching all. Wait...
      // Fetching all check_ins without filter is BAD. Let's fetch the habits first.
    ]);

    // Let's re-fetch checkins intelligently
    const habits: Habit[] = habitsRes.data || [];
    const habitIds = habits.map(h => h.id);

    let checkIns: CheckIn[] = [];
    if (habitIds.length > 0) {
      const { data: cinData } = await supabase
        .from('check_ins')
        .select('*')
        .in('habit_id', habitIds);
      checkIns = cinData || [];
    }

    return {
      profile: profileData,
      habits,
      checkIns,
      isPrivate: !profileData.is_public
    };
  }
};
