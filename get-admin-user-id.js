// Script to get the admin user ID from Supabase
// Run this with: node get-admin-user-id.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (hardcoded from vite.config.ts)
const SUPABASE_URL = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getAdminUserId() {
  console.log('🔍 Finding Admin User ID...\n');
  
  try {
    // Check user profiles
    console.log('📋 Checking user_profiles table...');
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, role, is_active');
      
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Found ${profiles.length} user profiles:`);
      profiles.forEach(profile => {
        console.log(`    - Email: ${profile.email}`);
        console.log(`    - User ID: ${profile.user_id}`);
        console.log(`    - Role: ${profile.role}`);
        console.log(`    - Active: ${profile.is_active}`);
        console.log('    ---');
      });
      
      // Find admin user
      const adminUser = profiles.find(p => p.role === 'admin' && p.is_active);
      if (adminUser) {
        console.log(`\n🎯 Admin User Found!`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   User ID: ${adminUser.user_id}`);
        return adminUser.user_id;
      } else {
        console.log('\n❌ No active admin user found');
        return null;
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to get admin user ID:', error.message);
    return null;
  }
}

getAdminUserId(); 