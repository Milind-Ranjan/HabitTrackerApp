
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxgdqtbuhspwgsdrobmp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Z2RxdGJ1aHNwd2dzZHJvYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Nzk3NjAsImV4cCI6MjA5MjA1NTc2MH0.cenlfo9nXvNa7IIFcxOFgCoLtsBdWCq6zygAKRafq4A'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
  console.log('--- FETCHING PROFILES ---')
  const { data: profiles } = await supabase.from('profiles').select('*').limit(5)
  console.log('Profiles:', JSON.stringify(profiles, null, 2))

  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id
    console.log(`--- FETCHING HABITS FOR ${profiles[0].username} ---`)
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId)
    console.log('Habits:', JSON.stringify(habits, null, 2))

    if (habits && habits.length > 0) {
      const habitIds = habits.map(h => h.id)
      console.log('--- FETCHING CHECK-INS ---')
      const { data: checkIns } = await supabase.from('check_ins').select('*').in('habit_id', habitIds).limit(10)
      console.log('Check-ins:', JSON.stringify(checkIns, null, 2))
    }
  }
}

debug()
