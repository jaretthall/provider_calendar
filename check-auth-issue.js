#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthIssue() {
  console.log('🔍 DIAGNOSING AUTHENTICATION & PROFILE ISSUES\n');
  console.log('================================================\n');

  try {
    // 1. Check if user_profiles table exists
    console.log('1️⃣ Checking user_profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profileError) {
      if (profileError.message.includes('relation "user_profiles" does not exist')) {
        console.log('❌ user_profiles table does NOT exist!');
        console.log('   Solution: Run create-user-profiles-table.sql in Supabase SQL editor\n');
      } else {
        console.log('❌ Error querying user_profiles:', profileError.message, '\n');
      }
    } else {
      console.log(`✅ user_profiles table exists with ${profiles?.length || 0} records`);
      if (profiles && profiles.length > 0) {
        console.log('   Sample user profiles:');
        profiles.forEach(p => {
          console.log(`   - ${p.email} (${p.role})`);
        });
      }
      console.log();
    }

    // 2. Check auth.users table
    console.log('2️⃣ Checking authenticated users...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('❌ No authenticated user session');
      console.log('   You need to sign in first\n');
    } else if (user) {
      console.log(`✅ Current authenticated user: ${user.email}`);
      console.log(`   User ID: ${user.id}\n`);

      // Check if this user has a profile
      if (!profileError) {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userProfileError) {
          console.log(`❌ No user profile found for ${user.email}`);
          console.log('   This is why you see "Profile loading timed out"');
          console.log('   Solution: Create a user profile in the database\n');
        } else if (userProfile) {
          console.log(`✅ User profile found for ${user.email}`);
          console.log(`   Role: ${userProfile.role}`);
          console.log(`   Active: ${userProfile.is_active}\n`);
        }
      }
    }

    // 3. Check user_settings table
    console.log('3️⃣ Checking user_settings table...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);

    if (settingsError) {
      if (settingsError.message.includes('relation "user_settings" does not exist')) {
        console.log('❌ user_settings table does NOT exist!');
        console.log('   This is expected - table is referenced but not critical\n');
      } else {
        console.log('❌ Error querying user_settings:', settingsError.message, '\n');
      }
    } else {
      console.log(`✅ user_settings table exists\n`);
    }

    // 4. Check shifts access with limit
    console.log('4️⃣ Checking shifts access...');
    const { data: shifts1000, error: shiftsError1000 } = await supabase
      .from('shifts')
      .select('*', { count: 'exact' });

    const { data: shiftsAll, error: shiftsErrorAll } = await supabase
      .from('shifts')
      .select('*', { count: 'exact' })
      .limit(10000);

    if (shiftsError1000 || shiftsErrorAll) {
      console.log('❌ Error accessing shifts:', shiftsError1000?.message || shiftsErrorAll?.message);
    } else {
      console.log(`📊 Shifts without limit: ${shifts1000?.length || 0} records`);
      console.log(`📊 Shifts with 10000 limit: ${shiftsAll?.length || 0} records`);

      if (shifts1000?.length !== shiftsAll?.length) {
        console.log(`\n⚠️ DEFAULT LIMIT IS CUTTING OFF ${shiftsAll?.length - shifts1000?.length} SHIFTS!`);
        console.log('   The limit(10000) fix in useSupabaseData.ts is necessary\n');
      }
    }

    // 5. Summary and recommendations
    console.log('================================================');
    console.log('📋 SUMMARY & RECOMMENDATIONS:\n');

    console.log('Browser Extension Errors:');
    console.log('  The "listener indicated an asynchronous response" errors are from browser extensions.');
    console.log('  Try: 1) Disable browser extensions, or 2) Use incognito mode\n');

    console.log('Profile Timeout Issue:');
    console.log('  The timeout was increased from 3 to 10 seconds.');
    console.log('  If user_profiles table is missing or empty, you need to:');
    console.log('  1) Run create-user-profiles-table.sql in Supabase');
    console.log('  2) Create a user profile for your authenticated user\n');

    console.log('Missing Shifts Issue:');
    console.log('  The app was limited to 1000 shifts (Supabase default).');
    console.log('  The fix to add .limit(10000) should resolve this.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkAuthIssue();