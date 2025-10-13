// Debug script to check Supabase database contents
// Run this with: node debug-supabase-data.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (hardcoded from vite.config.ts)
const SUPABASE_URL = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSupabaseData() {
  console.log('🔍 Checking Supabase Database Contents...\n');
  
  try {
    // Check connection
    console.log('📡 Testing connection...');
    const { data: authData } = await supabase.auth.getUser();
    console.log('Auth Status:', authData.user ? 'Authenticated' : 'Anonymous');
    
    // Check tables exist and get counts
    const tables = ['providers', 'clinic_types', 'medical_assistants', 'shifts'];
    
    for (const table of tables) {
      try {
        console.log(`\n📊 Table: ${table}`);
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' });
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`);
        } else {
          console.log(`  ✅ Records found: ${count || 0}`);
          if (data && data.length > 0) {
            console.log(`  📝 Sample record:`, data[0]);
          }
        }
      } catch (err) {
        console.log(`  ❌ Table error: ${err.message}`);
      }
    }
    
    // Check user profiles
    try {
      console.log('\n👥 User Profiles:');
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('email, role, is_active');
        
      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
      } else {
        console.log(`  ✅ Found ${profiles.length} user profiles:`);
        profiles.forEach(profile => {
          console.log(`    - ${profile.email} (${profile.role}) - ${profile.is_active ? 'Active' : 'Inactive'}`);
        });
      }
    } catch (err) {
      console.log(`  ❌ Profiles error: ${err.message}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
  }
}

checkSupabaseData(); 