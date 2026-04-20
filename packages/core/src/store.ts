import { create } from 'zustand';
import { supabase } from './supabase';
import { useToastStore } from './toastStore';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  color: string;
  target_days: number;
  display_order: number;
  is_archived: boolean;
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
  addHabitDB: (habit: Omit<Habit, 'id' | 'user_id' | 'display_order' | 'is_archived'>) => Promise<void>;
  deleteHabitDB: (habitId: string) => Promise<void>;
  archiveHabitDB: (habitId: string, isArchived: boolean) => Promise<void>;
  reorderHabitsDB: (newHabits: Habit[]) => Promise<void>;
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
        supabase.from('habits').select('*').eq('user_id', userData.user.id).order('display_order', { ascending: true })
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
      useToastStore.getState().addToast({ message: "Failed to update privacy settings", type: 'error' });
    } else {
      set({ profile: { ...profile, is_public } });
      useToastStore.getState().addToast({ message: `Profile is now ${is_public ? 'public' : 'private'}`, type: 'success' });
    }
  },

  addHabitDB: async (habit) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        useToastStore.getState().addToast({ message: "Session lost! Please log in again.", type: 'error' });
        return;
    }

    // Optimistic UI: Add local state with temp ID
    const optimisticHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      user_id: userData.user.id,
      display_order: get().habits.length,
      is_archived: false
    };

    set(state => ({ habits: [...state.habits, optimisticHabit] }));

    const { data, error } = await supabase.from('habits').insert([
       { ...habit, user_id: userData.user.id }
    ]).select().single();

    if (error) {
       console.error("Supabase insert habit error:", error);
       // Rollback: Remove the optimistic habit
       set(state => ({ habits: state.habits.filter(h => h.id !== optimisticHabit.id) }));
       useToastStore.getState().addToast({ message: "Failed to save habit: " + error.message, type: 'error' });
    }

    if (data) {
       // Replace optimistic record with real DB record (maintaining local collection)
       set((state) => ({ 
         habits: state.habits.map(h => h.id === optimisticHabit.id ? data : h) 
       }));
       useToastStore.getState().addToast({ message: `Habit "${data.title}" launched!`, type: 'success' });
    }
  },

  archiveHabitDB: async (habitId, is_archived) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_archived })
      .eq('id', habitId);

    if (error) {
      console.error("Archive habit error:", error);
      useToastStore.getState().addToast({ message: "Failed to archive habit", type: 'error' });
    } else {
      set((state) => ({
        habits: state.habits.map(h => h.id === habitId ? { ...h, is_archived } : h)
      }));
      useToastStore.getState().addToast({ 
        message: is_archived ? "Habit archived" : "Habit restored", 
        type: 'success' 
      });
    }
  },

  reorderHabitsDB: async (newHabits) => {
    // Optimistic UI update
    set({ habits: newHabits });

    // Update orders in DB
    const updates = newHabits.map((h, index) => ({
      id: h.id,
      display_order: index,
      user_id: h.user_id, // Required for upsert sometimes depending on RLS
      title: h.title,
      color: h.color,
      target_days: h.target_days,
      is_archived: h.is_archived
    }));

    const { error } = await supabase.from('habits').upsert(updates);
    
    if (error) {
      console.error("Reorder error:", error);
      useToastStore.getState().addToast({ message: "Failed to save new order", type: 'error' });
      // Rollback? Usually re-fetch is safer
      get().fetchData();
    }
  },

  deleteHabitDB: async (habitId) => {
    const backupHabit = get().habits.find(h => h.id === habitId);
    const backupCheckIns = get().checkIns.filter(c => c.habit_id === habitId);

    // Optimistic UI: Cleanup state immediately
    set((state) => ({
      habits: state.habits.filter(h => h.id !== habitId),
      checkIns: state.checkIns.filter(c => c.habit_id !== habitId)
    }));

    // Delete in supabase
    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    
    if (error) {
       console.error("Supabase delete habit error:", error);
       // Rollback
       if (backupHabit) {
         set(state => ({
           habits: [...state.habits, backupHabit],
           checkIns: [...state.checkIns, ...backupCheckIns]
         }));
       }
       useToastStore.getState().addToast({ message: "Failed to delete habit: " + error.message, type: 'error' });
    } else {
       useToastStore.getState().addToast({ message: "Habit deleted successfully", type: 'success' });
    }
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
           useToastStore.getState().addToast({ message: "Failed to remove check-in: " + error.message, type: 'error' });
       }
    } else {
       const { data, error } = await supabase.from('check_ins').insert([
         { habit_id: habitId, date, completed: true }
       ]).select().single();
       
       if (error) {
           console.error("Toggle checkin err:", error);
           useToastStore.getState().addToast({ message: "Failed to check-in: " + error.message, type: 'error' });
       }
       
       if (data) {
         set((state) => ({ checkIns: [...state.checkIns, data] }));
       }
    }
  }
}));

export const calculateStreak = (checkIns: CheckIn[], habitId: string): number => {
  return checkIns.filter(c => c.habit_id === habitId && c.completed).length;
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
