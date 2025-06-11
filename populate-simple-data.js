// Script to populate Supabase database with simple schema (no user_id columns)
// Run this with: node populate-simple-data.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (hardcoded from vite.config.ts)
const SUPABASE_URL = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample data based on constants.ts
const PREDEFINED_COLORS = [
  'bg-red-500', 'bg-red-600', 'bg-orange-500', 'bg-orange-400',
  'bg-amber-500', 'bg-amber-400', 'bg-yellow-500', 'bg-yellow-400',
  'bg-lime-500', 'bg-lime-600', 'bg-green-500', 'bg-green-600',
  'bg-emerald-500', 'bg-emerald-400', 'bg-teal-500', 'bg-teal-600',
  'bg-cyan-500', 'bg-cyan-400', 'bg-sky-500', 'bg-sky-600',
  'bg-blue-500', 'bg-blue-600', 'bg-indigo-500', 'bg-indigo-400',
  'bg-violet-500', 'bg-violet-600', 'bg-purple-500', 'bg-purple-600',
  'bg-fuchsia-500', 'bg-fuchsia-400', 'bg-pink-500', 'bg-pink-400',
  'bg-rose-500', 'bg-rose-400', 'bg-slate-500', 'bg-gray-500'
];

const VACATION_COLOR = 'bg-red-600';

// Sample data to insert (simplified - no user_id)
const sampleProviders = [
  { id: 'prov1', name: 'Dr. Smith', color: PREDEFINED_COLORS[0], is_active: true },
  { id: 'prov2', name: 'Dr. Jones', color: PREDEFINED_COLORS[1], is_active: true },
  { id: 'prov3', name: 'Nurse K.', color: PREDEFINED_COLORS[2], is_active: false },
  { id: 'prov4', name: 'Dr. Garcia', color: PREDEFINED_COLORS[3], is_active: true },
  { id: 'prov5', name: 'Dr. Brown', color: PREDEFINED_COLORS[4], is_active: true },
  { id: 'prov6', name: 'Philip Sutherland', color: PREDEFINED_COLORS[5], is_active: true },
  { id: 'prov7', name: 'Julia Friederich', color: PREDEFINED_COLORS[6], is_active: true },
  { id: 'prov8', name: 'Kelly Arnold', color: PREDEFINED_COLORS[7], is_active: true },
  { id: 'prov9', name: 'John Pound', color: PREDEFINED_COLORS[8], is_active: true },
  { id: 'prov10', name: 'Heidi Kelly', color: PREDEFINED_COLORS[9], is_active: true },
];

const sampleClinicTypes = [
  { id: 'clinic1', name: 'Emergency', color: PREDEFINED_COLORS[10], is_active: true },
  { id: 'clinic2', name: 'Pediatrics', color: PREDEFINED_COLORS[11], is_active: true },
  { id: 'clinic3', name: 'Surgery', color: PREDEFINED_COLORS[12], is_active: false },
  { id: 'clinic4', name: 'Cardiology', color: PREDEFINED_COLORS[13], is_active: true },
  { id: 'clinic5', name: 'Orthopedics', color: PREDEFINED_COLORS[14], is_active: true },
  { id: 'clinic6', name: 'Clinica Centro', color: PREDEFINED_COLORS[15], is_active: true },
  { id: 'clinic7', name: 'Urgente', color: PREDEFINED_COLORS[16], is_active: true },
];

const sampleMedicalAssistants = [
  { id: 'ma1', name: 'Alex Chen', color: PREDEFINED_COLORS[20], is_active: true },
  { id: 'ma2', name: 'Maria Garcia', color: PREDEFINED_COLORS[21], is_active: true },
  { id: 'ma3', name: 'Sam Lee', color: PREDEFINED_COLORS[22], is_active: false },
  { id: 'ma4', name: 'Jordan Kim', color: PREDEFINED_COLORS[23], is_active: true },
  { id: 'ma5', name: 'Riley Johnson', color: PREDEFINED_COLORS[24], is_active: true },
  { id: 'ma6', name: 'Juan', color: PREDEFINED_COLORS[25], is_active: true },
  { id: 'ma7', name: 'Oscar', color: PREDEFINED_COLORS[26], is_active: true },
  { id: 'ma8', name: 'Lupita', color: PREDEFINED_COLORS[27], is_active: true },
  { id: 'ma9', name: 'Maira', color: PREDEFINED_COLORS[28], is_active: true },
  { id: 'ma10', name: 'Quana', color: PREDEFINED_COLORS[29], is_active: true },
  { id: 'ma11', name: 'Kenneth', color: PREDEFINED_COLORS[30], is_active: true },
];

// Function to get current date and future dates
function getDateString(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Sample shifts - mix of current and future dates (simplified - no user_id)
const sampleShifts = [
  {
    id: 'shift1',
    provider_id: 'prov1',
    clinic_type_id: 'clinic1',
    medical_assistant_ids: ['ma1'],
    start_date: getDateString(0), // Today
    end_date: getDateString(0),
    start_time: '09:00',
    end_time: '17:00',
    is_vacation: false,
    notes: 'Morning shift with Alex',
    color: PREDEFINED_COLORS[0]
  },
  {
    id: 'shift2',
    provider_id: 'prov2',
    clinic_type_id: 'clinic2',
    medical_assistant_ids: ['ma1', 'ma2'],
    start_date: getDateString(1), // Tomorrow
    end_date: getDateString(1),
    start_time: '10:00',
    end_time: '18:00',
    is_vacation: false,
    notes: 'Pediatrics coverage with Alex and Maria',
    color: PREDEFINED_COLORS[1]
  },
  {
    id: 'shift3',
    provider_id: 'prov1',
    clinic_type_id: null,
    medical_assistant_ids: null,
    start_date: getDateString(2), // Day after tomorrow
    end_date: getDateString(4), // 4 days from now
    start_time: null,
    end_time: null,
    is_vacation: true,
    notes: 'Annual leave',
    color: VACATION_COLOR
  },
  {
    id: 'shift4',
    provider_id: 'prov6', // Philip Sutherland
    clinic_type_id: 'clinic6', // Clinica Centro
    medical_assistant_ids: ['ma6'], // Juan
    start_date: getDateString(3),
    end_date: getDateString(3),
    start_time: '08:00',
    end_time: '16:00',
    is_vacation: false,
    notes: 'Clinica Centro with Juan',
    color: PREDEFINED_COLORS[5]
  },
  {
    id: 'shift5',
    provider_id: 'prov7', // Julia Friederich
    clinic_type_id: 'clinic7', // Urgente
    medical_assistant_ids: ['ma7', 'ma8'], // Oscar, Lupita
    start_date: getDateString(5),
    end_date: getDateString(5),
    start_time: '07:00',
    end_time: '15:00',
    is_vacation: false,
    notes: 'Early urgent care shift',
    color: PREDEFINED_COLORS[6]
  },
  {
    id: 'shift6',
    provider_id: 'prov8', // Kelly Arnold
    clinic_type_id: 'clinic1', // Emergency
    medical_assistant_ids: ['ma9'], // Maira
    start_date: getDateString(7),
    end_date: getDateString(7),
    start_time: '12:00',
    end_time: '20:00',
    is_vacation: false,
    notes: 'Emergency evening shift',
    color: PREDEFINED_COLORS[7]
  }
];

async function populateSimpleData() {
  console.log('🚀 Populating Supabase Database with Simple Schema Data...\n');
  
  try {
    // Step 1: Insert Providers
    console.log('📋 Inserting Providers...');
    const { data: providersData, error: providersError } = await supabase
      .from('providers')
      .insert(sampleProviders)
      .select();
    
    if (providersError) {
      console.log(`  ❌ Providers Error: ${providersError.message}`);
    } else {
      console.log(`  ✅ Inserted ${providersData.length} providers`);
    }

    // Step 2: Insert Clinic Types
    console.log('🏥 Inserting Clinic Types...');
    const { data: clinicsData, error: clinicsError } = await supabase
      .from('clinic_types')
      .insert(sampleClinicTypes)
      .select();
    
    if (clinicsError) {
      console.log(`  ❌ Clinic Types Error: ${clinicsError.message}`);
    } else {
      console.log(`  ✅ Inserted ${clinicsData.length} clinic types`);
    }

    // Step 3: Insert Medical Assistants
    console.log('👩‍⚕️ Inserting Medical Assistants...');
    const { data: masData, error: masError } = await supabase
      .from('medical_assistants')
      .insert(sampleMedicalAssistants)
      .select();
    
    if (masError) {
      console.log(`  ❌ Medical Assistants Error: ${masError.message}`);
    } else {
      console.log(`  ✅ Inserted ${masData.length} medical assistants`);
    }

    // Step 4: Insert Shifts
    console.log('📅 Inserting Shifts...');
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .insert(sampleShifts)
      .select();
    
    if (shiftsError) {
      console.log(`  ❌ Shifts Error: ${shiftsError.message}`);
    } else {
      console.log(`  ✅ Inserted ${shiftsData.length} shifts`);
    }

    console.log('\n🎉 Database population completed!');
    console.log('📊 Summary:');
    console.log(`   - Providers: ${providersData?.length || 0}`);
    console.log(`   - Clinic Types: ${clinicsData?.length || 0}`);
    console.log(`   - Medical Assistants: ${masData?.length || 0}`);
    console.log(`   - Shifts: ${shiftsData?.length || 0}`);
    
    // Also verify data was inserted
    console.log('\n🔍 Verification:');
    const { data: verifyProviders } = await supabase.from('providers').select('*');
    const { data: verifyClinicTypes } = await supabase.from('clinic_types').select('*');
    const { data: verifyMAs } = await supabase.from('medical_assistants').select('*');
    const { data: verifyShifts } = await supabase.from('shifts').select('*');
    
    console.log(`   - Providers in DB: ${verifyProviders?.length || 0}`);
    console.log(`   - Clinic Types in DB: ${verifyClinicTypes?.length || 0}`);
    console.log(`   - Medical Assistants in DB: ${verifyMAs?.length || 0}`);
    console.log(`   - Shifts in DB: ${verifyShifts?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Failed to populate database:', error.message);
  }
}

populateSimpleData(); 