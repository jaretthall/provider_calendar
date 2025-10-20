#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkWeekendShifts() {
  console.log('🔍 Checking for weekend-created shifts...\n');

  try {
    // 1. Get all shifts with their timestamps
    const { data: allShifts, error: allError } = await supabase
      .from('shifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) throw allError;

    console.log(`📊 Total shifts in database: ${allShifts.length}\n`);

    // 2. Check for weekend-created shifts
    const weekendShifts = allShifts.filter(shift => {
      const createdDate = new Date(shift.created_at);
      const dayOfWeek = createdDate.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    });

    console.log(`🗓️ Shifts created on weekends: ${weekendShifts.length}`);

    if (weekendShifts.length > 0) {
      console.log('\n📅 Weekend-created shifts (most recent first):');
      console.log('================================================');

      weekendShifts.slice(0, 10).forEach(shift => {
        const createdDate = new Date(shift.created_at);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()];

        console.log(`
ID: ${shift.id}
Provider: ${shift.provider_id}
Shift Date: ${shift.start_date}
Created: ${dayName}, ${createdDate.toLocaleString()}
Title: ${shift.title || 'N/A'}
Time: ${shift.start_time} - ${shift.end_time}
        `);
      });
    }

    // 3. Check shifts from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentShifts = allShifts.filter(shift => {
      return new Date(shift.created_at) >= sevenDaysAgo;
    });

    console.log(`\n📆 Shifts created in the last 7 days: ${recentShifts.length}`);

    if (recentShifts.length > 0) {
      console.log('\nRecent shifts breakdown:');
      const dayCount = {};

      recentShifts.forEach(shift => {
        const createdDate = new Date(shift.created_at);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()];
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      });

      Object.entries(dayCount).forEach(([day, count]) => {
        console.log(`  ${day}: ${count} shifts`);
      });
    }

    // 4. Check for any date anomalies
    console.log('\n🔍 Checking for date anomalies...');

    const today = new Date().toISOString().split('T')[0];
    const futureShifts = allShifts.filter(s => s.start_date > today);
    const pastShifts = allShifts.filter(s => s.start_date < today);
    const todayShifts = allShifts.filter(s => s.start_date === today);

    console.log(`  Today's shifts: ${todayShifts.length}`);
    console.log(`  Future shifts: ${futureShifts.length}`);
    console.log(`  Past shifts: ${pastShifts.length}`);

    // Check for null dates
    const nullStartDates = allShifts.filter(s => !s.start_date);
    const nullEndDates = allShifts.filter(s => !s.end_date);

    if (nullStartDates.length > 0) {
      console.log(`  ⚠️ Shifts with NULL start_date: ${nullStartDates.length}`);
    }
    if (nullEndDates.length > 0) {
      console.log(`  ⚠️ Shifts with NULL end_date: ${nullEndDates.length}`);
    }

    // 5. Show most recent 5 shifts regardless of when created
    console.log('\n📋 Most recent 5 shifts (by creation date):');
    console.log('================================================');

    allShifts.slice(0, 5).forEach(shift => {
      const createdDate = new Date(shift.created_at);
      console.log(`
ID: ${shift.id}
Provider: ${shift.provider_id}
Shift Date: ${shift.start_date}
Created: ${createdDate.toLocaleString()}
Updated: ${new Date(shift.updated_at).toLocaleString()}
      `);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkWeekendShifts();