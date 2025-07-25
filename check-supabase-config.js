// Check current Supabase configuration and test connectivity
import { createClient } from '@supabase/supabase-js';

console.log('🔍 Checking Supabase Configuration...\n');

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Environment Variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : 'MISSING');

// Validate URL format
if (supabaseUrl) {
  const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
  if (urlPattern.test(supabaseUrl)) {
    console.log('✅ URL format is correct');
  } else {
    console.log('❌ URL format may be incorrect. Expected: https://your-project-id.supabase.co');
  }
} else {
  console.log('❌ VITE_SUPABASE_URL is missing');
}

// Validate key format
if (supabaseAnonKey) {
  if (supabaseAnonKey.startsWith('eyJ')) {
    console.log('✅ Anon key format looks correct (JWT token)');
  } else {
    console.log('❌ Anon key format may be incorrect. Should start with "eyJ"');
  }
} else {
  console.log('❌ VITE_SUPABASE_ANON_KEY is missing');
}

// Test connection
if (supabaseUrl && supabaseAnonKey) {
  console.log('\n🔗 Testing connection...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      
      if (error.message.includes('Invalid API key')) {
        console.log('💡 Solution: Check your VITE_SUPABASE_ANON_KEY in Supabase Settings → API');
      } else if (error.message.includes('not found')) {
        console.log('💡 Solution: Check your VITE_SUPABASE_URL in Supabase Settings → API');
      }
    } else {
      console.log('✅ Connection successful!');
      
      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.log('⚠️  Auth test failed:', authError.message);
      } else {
        console.log('✅ Auth system accessible');
      }
    }
  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
  }
} else {
  console.log('\n❌ Cannot test connection - missing environment variables');
}

console.log('\n📋 Next steps:');
console.log('1. Go to your Supabase project: https://supabase.com/dashboard');
console.log('2. Navigate to Settings → API');
console.log('3. Copy the Project URL and anon/public key');
console.log('4. Update your .env file with the correct values');
console.log('5. Restart your development server (npm run dev)');