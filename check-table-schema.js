// Script to check actual table columns in Supabase
// Run this with: node check-table-schema.js

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (hardcoded from vite.config.ts)
const SUPABASE_URL = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTableSchema() {
  console.log('🔍 Checking Table Schema in Supabase...\n');
  
  const tables = ['providers', 'clinic_types', 'medical_assistants', 'shifts'];
  
  for (const table of tables) {
    console.log(`\n📊 Table: ${table.toUpperCase()}`);
    console.log('=' .repeat(40));
    
    try {
      // Try to insert a dummy record to see what columns are expected
      const { data, error } = await supabase
        .from(table)
        .insert({})
        .select();
      
      if (error) {
        console.log(`❌ Error trying to insert into ${table}:`);
        console.log(`   ${error.message}`);
        
        // Extract column names from error message if possible
        if (error.message.includes('null value in column')) {
          const match = error.message.match(/null value in column "([^"]+)"/);
          if (match) {
            console.log(`   🔍 Required column found: ${match[1]}`);
          }
        }
      } else {
        console.log(`✅ Successfully inserted into ${table} (unexpected)`);
        console.log(`   Data:`, data);
      }
      
      // Try to get the actual structure by selecting from the table
      const { data: selectData, error: selectError } = await supabase
        .from(table)
        .select('*')
        .limit(0);
        
      if (selectError) {
        console.log(`❌ Select Error: ${selectError.message}`);
      } else {
        console.log(`✅ Table ${table} is accessible for SELECT`);
      }
      
    } catch (err) {
      console.log(`❌ Unexpected error with ${table}: ${err.message}`);
    }
  }
  
  // Let's try a different approach - check what a minimal insert would look like
  console.log('\n🧪 Testing Minimal Inserts...\n');
  
  // Test providers with minimal data
  console.log('Testing providers minimal insert...');
  try {
    const { data, error } = await supabase
      .from('providers')
      .insert({ 
        name: 'Test Provider',
        color: 'bg-blue-500'
      })
      .select();
      
    if (error) {
      console.log(`❌ Providers minimal insert error: ${error.message}`);
    } else {
      console.log(`✅ Providers minimal insert successful:`, data);
      
      // Clean up the test record
      if (data && data[0]) {
        await supabase.from('providers').delete().eq('id', data[0].id);
        console.log(`🧹 Cleaned up test provider`);
      }
    }
  } catch (err) {
    console.log(`❌ Providers test error: ${err.message}`);
  }
}

checkTableSchema(); 