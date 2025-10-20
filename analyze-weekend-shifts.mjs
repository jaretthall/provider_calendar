#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Read the exported file
const exportedData = JSON.parse(fs.readFileSync('./clinica_schedule_export_2025-10-20.json', 'utf8'));

console.log('📋 ANALYZING EXPORTED SHIFTS VS DATABASE\n');
console.log('================================================');
console.log(`📁 Shifts in exported file: ${exportedData.shifts.length}`);

// Group exported shifts by creation date
const exportedByDate = {};
exportedData.shifts.forEach(shift => {
  const createdDate = new Date(shift.createdAt);
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()];
  const dateKey = createdDate.toISOString().split('T')[0];

  if (!exportedByDate[dateKey]) {
    exportedByDate[dateKey] = {
      dayName,
      shifts: []
    };
  }
  exportedByDate[dateKey].shifts.push(shift);
});

// Find weekend-created shifts in export
const weekendExported = exportedData.shifts.filter(shift => {
  const createdDate = new Date(shift.createdAt);
  const dayOfWeek = createdDate.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
});

console.log(`🗓️ Weekend-created shifts in export: ${weekendExported.length}\n`);

// Show recent shifts from export
const sortedDates = Object.keys(exportedByDate).sort().reverse();
console.log('📅 Recent creation dates in export:');
sortedDates.slice(0, 7).forEach(date => {
  const data = exportedByDate[date];
  const isWeekend = data.dayName === 'Saturday' || data.dayName === 'Sunday';
  const marker = isWeekend ? '🔴 WEEKEND' : '';
  console.log(`  ${date} (${data.dayName}): ${data.shifts.length} shifts ${marker}`);
});

// Now compare with database
if (!supabaseAnonKey) {
  console.error('\n❌ Cannot compare with database - missing VITE_SUPABASE_ANON_KEY');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n================================================');
console.log('🔍 CHECKING DATABASE FOR MISSING SHIFTS\n');

try {
  const { data: dbShifts, error } = await supabase
    .from('shifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  console.log(`📊 Total shifts in database: ${dbShifts.length}`);

  // Find shifts that are in database but not in export
  const exportedIds = new Set(exportedData.shifts.map(s => s.id));
  const missingFromExport = dbShifts.filter(dbShift => !exportedIds.has(dbShift.id));

  console.log(`❓ Shifts in database but NOT in export: ${missingFromExport.length}\n`);

  if (missingFromExport.length > 0) {
    console.log('🚨 MISSING SHIFTS (most recent first):');
    console.log('================================================');

    // Show first 10 missing shifts
    missingFromExport.slice(0, 10).forEach(shift => {
      const createdDate = new Date(shift.created_at);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()];
      const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

      console.log(`
ID: ${shift.id}
Provider: ${shift.provider_id}
Shift Date: ${shift.start_date}
Created: ${dayName}, ${createdDate.toLocaleString()} ${isWeekend ? '🔴 WEEKEND' : ''}
Title: ${shift.title || 'N/A'}
      `);
    });

    // Group missing shifts by creation day
    const missingByDay = {};
    missingFromExport.forEach(shift => {
      const createdDate = new Date(shift.created_at);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][createdDate.getDay()];
      missingByDay[dayName] = (missingByDay[dayName] || 0) + 1;
    });

    console.log('\n📊 Missing shifts by day of week created:');
    Object.entries(missingByDay).forEach(([day, count]) => {
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      console.log(`  ${day}: ${count} shifts ${isWeekend ? '🔴' : ''}`);
    });
  }

  // Check for date filtering issues
  console.log('\n📅 Date range analysis:');
  const today = new Date().toISOString().split('T')[0];

  const exportedFuture = exportedData.shifts.filter(s => s.startDate > today).length;
  const exportedPast = exportedData.shifts.filter(s => s.startDate < today).length;
  const exportedToday = exportedData.shifts.filter(s => s.startDate === today).length;

  const dbFuture = dbShifts.filter(s => s.start_date > today).length;
  const dbPast = dbShifts.filter(s => s.start_date < today).length;
  const dbToday = dbShifts.filter(s => s.start_date === today).length;

  console.log(`  Export: Today=${exportedToday}, Future=${exportedFuture}, Past=${exportedPast}`);
  console.log(`  Database: Today=${dbToday}, Future=${dbFuture}, Past=${dbPast}`);

} catch (error) {
  console.error('❌ Error:', error.message);
}