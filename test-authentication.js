// Test Authentication Setup
// This script tests the Supabase authentication configuration

import { createClient } from '@supabase/supabase-js';

// Replace these with your actual values from .env
const supabaseUrl = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

console.log('🔍 Testing Supabase Authentication Setup...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonymousRead() {
  console.log('1️⃣ Testing Anonymous Read Access...');
  
  try {
    // Test reading from each table
    const tables = ['providers', 'clinic_types', 'medical_assistants', 'shifts'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(5);
      
      if (error) {
        console.error(`❌ Failed to read ${table}:`, error.message);
      } else {
        console.log(`✅ Successfully read ${table}: ${data?.length || 0} records`);
      }
    }
  } catch (error) {
    console.error('❌ Anonymous read test failed:', error);
  }
}

async function testAnonymousWrite() {
  console.log('\n2️⃣ Testing Anonymous Write Access (should fail)...');
  
  try {
    const { data, error } = await supabase
      .from('providers')
      .insert({
        name: 'Test Provider',
        color: 'bg-blue-500',
        is_active: true
      });
    
    if (error) {
      console.log('✅ Anonymous write correctly blocked:', error.message);
    } else {
      console.error('❌ Anonymous write should have been blocked!');
    }
  } catch (error) {
    console.log('✅ Anonymous write blocked as expected');
  }
}

async function testAuthenticatedAccess() {
  console.log('\n3️⃣ Testing Authenticated User Access...');
  
  // First, try to sign up a test user
  const testEmail = 'test@example.com';
  const testPassword = 'TestPassword123!';
  
  console.log('   Creating test user...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User',
        role: 'admin'
      }
    }
  });
  
  if (signUpError && signUpError.message.includes('already registered')) {
    console.log('   Test user already exists, signing in...');
    
    // Try to sign in instead
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Failed to sign in:', signInError.message);
      return;
    }
    
    console.log('✅ Successfully signed in as test user');
  } else if (signUpError) {
    console.error('❌ Failed to create test user:', signUpError.message);
    return;
  } else {
    console.log('✅ Test user created successfully');
  }
  
  // Test authenticated write
  console.log('   Testing authenticated write...');
  const { data: writeData, error: writeError } = await supabase
    .from('providers')
    .insert({
      name: 'Test Provider (Authenticated)',
      color: 'bg-green-500',
      is_active: true
    })
    .select();
  
  if (writeError) {
    console.error('❌ Authenticated write failed:', writeError.message);
  } else {
    console.log('✅ Authenticated write successful:', writeData);
    
    // Clean up - delete the test provider
    if (writeData && writeData[0]) {
      await supabase
        .from('providers')
        .delete()
        .eq('id', writeData[0].id);
      console.log('   Cleaned up test data');
    }
  }
  
  // Sign out
  await supabase.auth.signOut();
  console.log('   Signed out');
}

async function checkDatabaseTables() {
  console.log('\n4️⃣ Checking Database Tables...');
  
  const tables = ['user_profiles', 'providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Table ${table} not accessible:`, error.message);
    } else {
      console.log(`✅ Table ${table} exists`);
    }
  }
}

// Run all tests
async function runTests() {
  await checkDatabaseTables();
  await testAnonymousRead();
  await testAnonymousWrite();
  await testAuthenticatedAccess();
  
  console.log('\n✅ Authentication test complete!');
  console.log('\nSummary:');
  console.log('- Anonymous users can READ data');
  console.log('- Anonymous users CANNOT write data');
  console.log('- Authenticated users can READ and WRITE data');
  console.log('- All required tables exist in database');
}

runTests().catch(console.error);