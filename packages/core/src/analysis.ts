import { CheckIn, Habit } from './store';

export interface DayStats {
  dayName: string;
  count: number;
  total: number;
  percentage: number;
}

export interface HabitInsightData {
  habitId: string;
  habitTitle: string;
  weakestDays: string[];
  strongestDays: string[];
  overallConsistency: number;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function analyzeHabitPatterns(habits: Habit[], checkIns: CheckIn[]): HabitInsightData[] {
  // We only look at the last 30 days for fresh analysis
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0];

  const recentCheckIns = checkIns.filter(c => c.date >= cutoff);

  return habits.map(habit => {
    const habitCheckIns = recentCheckIns.filter(c => c.habit_id === habit.id && c.completed);
    
    // Group by weekday
    const dayStats: Record<number, { count: number, total: number }> = {};
    for (let i = 0; i < 7; i++) dayStats[i] = { count: 0, total: 30 / 7 }; // Estimated total days in month for that weekday

    habitCheckIns.forEach(c => {
      const day = new Date(c.date).getDay();
      if (dayStats[day]) dayStats[day].count++;
    });

    const processedStats = Object.entries(dayStats).map(([day, stat]) => ({
      dayName: WEEKDAYS[parseInt(day)],
      percentage: (stat.count / 4.3) * 100 // Avg 4.3 weeks in a month
    }));

    const weakestDays = processedStats
      .filter(s => s.percentage < 40)
      .map(s => s.dayName);

    const strongestDays = processedStats
      .filter(s => s.percentage > 80)
      .map(s => s.dayName);

    const totalDays = 30;
    const overallConsistency = (habitCheckIns.length / totalDays) * 100;

    return {
      habitId: habit.id,
      habitTitle: habit.title,
      weakestDays,
      strongestDays,
      overallConsistency
    };
  });
}
