import { Habit, CheckIn } from './store';

export const MOCK_HABITS: Habit[] = [
  { id: 'h1', user_id: 'u1', title: 'Read 10 pages of a book', color: '#ffb6c1', target_days: 7, display_order: 0, is_archived: false }, 
  { id: 'h2', user_id: 'u1', title: 'Drink 8 glasses of water', color: '#87cefa', target_days: 7, display_order: 1, is_archived: false }, 
  { id: 'h3', user_id: 'u1', title: 'Exercise for 30 minutes', color: '#98fb98', target_days: 5, display_order: 2, is_archived: false }, 
  { id: 'h4', user_id: 'u1', title: 'Japanese assignment', color: '#dda0dd', target_days: 3, display_order: 3, is_archived: false }, 
  { id: 'h5', user_id: 'u1', title: 'Review flashcards', color: '#f0e68c', target_days: 7, display_order: 4, is_archived: false }, 
];

const generateMockCheckIns = (): CheckIn[] => {
  const checkIns: CheckIn[] = [];
  const today = new Date();
  
  MOCK_HABITS.forEach(habit => {
    // Generate checkins for the last 30 days
    for (let i = 0; i < 30; i++) {
       const date = new Date(today);
       date.setDate(date.getDate() - i);
       // randomly complete
       if (Math.random() > 0.3) {
         checkIns.push({
           id: `c_${habit.id}_${i}`,
           habit_id: habit.id,
           date: date.toISOString().split('T')[0],
           completed: true
         });
       }
    }
  });

  return checkIns;
};

export const MOCK_CHECKINS = generateMockCheckIns();
