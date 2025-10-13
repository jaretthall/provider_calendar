// Database Status Checker
// This script shows you exactly what exists in your Supabase database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking Supabase Database Status...\n');

// Expected tables for the Calendar application
const expectedTables = [
  'user_profiles',
  'providers', 
  'clinic_types',
  'medical_assistants',
  'shifts',
  'user_settings'
];

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        return { exists: false, error: 'Table does not exist' };
      } else if (error.code === 'PGRST116') {
        return { exists: true, empty: true, error: null };
      } else {
        return { exists: false, error: error.message };
      }
    }
    
    return { exists: true, empty: false, recordCount: data?.length || 0, error: null };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkAuthTables() {
  console.log('🔐 Checking Supabase Auth Tables...');
  
  // Try to access auth schema (this might not work with anon key)
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error && !error.message.includes('not authenticated')) {
      console.log('❌ Auth system issue:', error.message);
    } else {
      console.log('✅ Auth system accessible');
    }
  } catch (err) {
    console.log('❌ Auth system error:', err.message);
  }
}

async function getTableCounts() {
  console.log('\n📊 Table Status:');
  console.log('='.repeat(50));
  
  for (const tableName of expectedTables) {
    const status = await checkTableExists(tableName);
    
    if (status.exists) {
      if (status.empty) {
        console.log(`✅ ${tableName.padEnd(20)} | EXISTS (empty)`);
      } else {
        // Try to get actual count
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.log(`✅ ${tableName.padEnd(20)} | EXISTS (count unknown)`);
          } else {
            console.log(`✅ ${tableName.padEnd(20)} | EXISTS (${count} records)`);
          }
        } catch {
          console.log(`✅ ${tableName.padEnd(20)} | EXISTS (accessible)`);
        }
      }
    } else {
      console.log(`❌ ${tableName.padEnd(20)} | MISSING - ${status.error}`);
    }
  }
}

async function checkPolicies() {
  console.log('\n🛡️  Checking RLS Policies...');
  
  // This requires elevated permissions, so we'll try but expect it might fail
  for (const tableName of expectedTables) {
    const status = await checkTableExists(tableName);
    if (status.exists) {
      // Try a write operation to see if RLS is working
      try {
        const { error } = await supabase
          .from(tableName)
          .insert({ test: 'value' });
        
        if (error) {
          if (error.message.includes('policy')) {
            console.log(`🔒 ${tableName.padEnd(20)} | RLS ACTIVE (write blocked)`);
          } else if (error.message.includes('column')) {
            console.log(`🔓 ${tableName.padEnd(20)} | NO RLS (schema error - would write)`);
          } else {
            console.log(`❓ ${tableName.padEnd(20)} | RLS STATUS UNKNOWN`);
          }
        } else {
          console.log(`🔓 ${tableName.padEnd(20)} | NO RLS (write succeeded!)`);
        }
      } catch (err) {
        console.log(`❓ ${tableName.padEnd(20)} | RLS CHECK FAILED`);
      }
    }
  }
}

async function showSampleData() {
  console.log('\n📋 Sample Data:');
  console.log('='.repeat(50));
  
  for (const tableName of expectedTables) {
    const status = await checkTableExists(tableName);
    if (status.exists && !status.empty) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);
        
        if (!error && data && data.length > 0) {
          console.log(`\n📄 ${tableName.toUpperCase()}:`);
          console.log('Sample record keys:', Object.keys(data[0]).join(', '));
          
          // Show first record (but hide sensitive data)
          const sample = { ...data[0] };
          if (sample.email) sample.email = sample.email.replace(/(.{2}).*@/, '$1***@');
          if (sample.password) sample.password = '***';
          console.log('First record:', JSON.stringify(sample, null, 2));
        }
      } catch (err) {
        // Skip if can't access
      }
    }
  }
}

async function checkConnection() {
  console.log('🌐 Testing Connection...');
  try {
    // Simple connection test
    const { data, error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);
    
    // We expect this to fail, but it tells us if we can connect
    if (error && error.code === '42P01') {
      console.log('✅ Connection successful (can reach database)');
      return true;
    } else if (error) {
      console.log('❌ Connection issue:', error.message);
      return false;
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

// Run all checks
async function runDatabaseCheck() {
  const canConnect = await checkConnection();
  
  if (!canConnect) {
    console.log('\n❌ Cannot connect to database. Check your credentials.');
    return;
  }
  
  await checkAuthTables();
  await getTableCounts();
  await checkPolicies();
  await showSampleData();
  
  console.log('\n' + '='.repeat(60));
  console.log('DATABASE STATUS SUMMARY:');
  console.log('='.repeat(60));
  
  let allTablesExist = true;
  for (const tableName of expectedTables) {
    const status = await checkTableExists(tableName);
    if (!status.exists) {
      allTablesExist = false;
      break;
    }
  }
  
  if (allTablesExist) {
    console.log('✅ All required tables exist');
    console.log('🔄 Ready for RLS policy setup');
  } else {
    console.log('❌ Missing tables - need to run database schema setup');
    console.log('📋 Run supabase-schema.sql in your Supabase SQL Editor');
  }
}

runDatabaseCheck().catch(console.error);