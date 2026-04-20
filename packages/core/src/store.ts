import { create } from 'zustand';
import { supabase } from './supabase';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  color: string;
  target_days: number;
}

export interface CheckIn {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface Profile { id: string; username: string; is_public: boolean; created_at: string; }

interface HabitState {
  profile: Profile | null;
  habits: Habit[];
  checkIns: CheckIn[];
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setHabits: (habits: Habit[]) => void;
  setCheckIns: (checkIns: CheckIn[]) => void;
  clearState: () => void;
  fetchData: () => Promise<void>;
  updateProfileVisibility: (isPublic: boolean) => Promise<void>;
  addHabitDB: (habit: Omit<Habit, 'id' | 'user_id'>) => Promise<void>;
  deleteHabitDB: (habitId: string) => Promise<void>;
  toggleCheckInDB: (habitId: string, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>()((set, get) => ({
  profile: null,
  habits: [],
  checkIns: [],
  isLoading: false,
  setProfile: (profile) => set({ profile }),
  setHabits: (habits) => set({ habits }),
  setCheckIns: (checkIns) => set({ checkIns }),
  clearState: () => set({ profile: null, habits: [], checkIns: [] }),
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        set({ isLoading: false });
        return;
      }

      // Get profile and habits first
      const [profileRes, habitsRes] = await Promise.all([
        supabase.from('profiles').select('id, username, is_public, created_at').eq('id', userData.user.id).single(),
        supabase.from('habits').select('*').eq('user_id', userData.user.id)
      ]);

      if (profileRes.data) set({ profile: profileRes.data });
      
      if (habitsRes.data) {
        set({ habits: habitsRes.data });
        
        // Efficiently fetch check-ins only for the user's habits
        const habitIds = habitsRes.data.map(h => h.id);
        if (habitIds.length > 0) {
          const { data: checkInsData, error: checkInsError } = await supabase
            .from('check_ins')
            .select('*')
            .in('habit_id', habitIds);
          
          if (checkInsError) {
            console.error("Error fetching check-ins:", checkInsError);
          } else if (checkInsData) {
            set({ checkIns: checkInsData });
          }
        } else {
          // No habits, so definitely no check-ins
          set({ checkIns: [] });
        }
      }
    } catch (e) {
      console.error("Error in fetchData:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfileVisibility: async (is_public) => {
    const { profile } = get();
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_public })
      .eq('id', profile.id);

    if (error) {
      console.error("Update visibility error:", error);
      alert("Failed to update privacy settings.");
    } else {
      set({ profile: { ...profile, is_public } });
    }
  },

  addHabitDB: async (habit) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        alert("Session lost! Please log out and back in.");
        return;
    }

    const { data, error } = await supabase.from('habits').insert([
       { ...habit, user_id: userData.user.id }
    ]).select().single();

    if (error) {
       console.error("Supabase insert habit error:", error);
       alert("Failed to save habit to database: " + error.message);
    }

    if (data) {
       set((state) => ({ habits: [...state.habits, data] }));
    }
  },

  deleteHabitDB: async (habitId) => {
    // Delete in supabase
    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    if (error) {
       console.error("Supabase delete habit error:", error);
       alert("Failed to delete habit from database: " + error.message);
    }
    
    // Cleanup state
    set((state) => ({
      habits: state.habits.filter(h => h.id !== habitId),
      checkIns: state.checkIns.filter(c => c.habit_id !== habitId)
    }));
  },

  toggleCheckInDB: async (habitId, date) => {
    const state = get();
    const existing = state.checkIns.find(c => c.habit_id === habitId && c.date === date);

    if (existing) {
       // Optimistic UI updates
       set((state) => ({ checkIns: state.checkIns.filter(c => c.id !== existing.id) }));
       const { error } = await supabase.from('check_ins').delete().eq('id', existing.id);
       if(error) {
           console.error("Remove checkin err:", error);
           alert("Failed to remove check-in: " + error.message);
       }
    } else {
       const { data, error } = await supabase.from('check_ins').insert([
         { habit_id: habitId, date, completed: true }
       ]).select().single();
       
       if (error) {
           console.error("Toggle checkin err:", error);
           alert("Failed to check-in: " + error.message);
       }
       
       if (data) {
         set((state) => ({ checkIns: [...state.checkIns, data] }));
       }
    }
  }
}));

export const calculateStreak = (checkIns: CheckIn[], habitId: string): number => {
  const habitCheckIns = checkIns.filter(c => c.habit_id === habitId && c.completed).sort((a, b) => b.date.localeCompare(a.date));
  return habitCheckIns.length;
};

export const calculateConsecutiveStreak = (checkIns: CheckIn[], habitId: string): number => {
  const habitCheckIns = checkIns
    .filter(c => c.habit_id === habitId && c.completed)
    .map(c => c.date)
    .sort((a, b) => b.localeCompare(a)); // Newest first

  if (habitCheckIns.length === 0) return 0;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDate(today);
  const yesterdayStr = formatDate(yesterday);

  // If no check-in today and no check-in yesterday, streak is zero
  if (habitCheckIns[0] !== todayStr && habitCheckIns[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let current = new Date(habitCheckIns[0]);

  for (let i = 0; i < habitCheckIns.length; i++) {
    const checkDate = habitCheckIns[i];
    const expectedStr = formatDate(current);

    if (checkDate === expectedStr) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
