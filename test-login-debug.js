// Debug login issues for specific users
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing login for jarett@clinicamedicos.org...\n');

async function testLogin() {
  const testEmail = 'jarett@clinicamedicos.org';
  
  console.log('1️⃣ Attempting to sign in...');
  
  // Test different password scenarios
  const testPasswords = [
    'your_actual_password_here', // Replace with the actual password you set
    'password123',
    'Password123',
    'Password123!',
  ];
  
  for (const password of testPasswords) {
    console.log(`\nTrying password: ${password.substring(0, 3)}***`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: password
    });
    
    if (error) {
      console.log('❌ Failed:', error.message);
      
      // Check specific error types
      if (error.message.includes('Invalid login credentials')) {
        console.log('   → Wrong email/password combination');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('   → Email needs to be confirmed');
      } else if (error.message.includes('User not found')) {
        console.log('   → User account does not exist');
      } else {
        console.log('   → Other error:', error.code);
      }
    } else {
      console.log('✅ SUCCESS! User signed in:', data.user?.email);
      
      // Check if profile can be loaded
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile load failed:', profileError.message);
      } else {
        console.log('✅ Profile loaded:', profile);
      }
      
      // Sign out for next test
      await supabase.auth.signOut();
      break;
    }
  }
  
  console.log('\n2️⃣ Checking user status in database...');
  
  // Check if user profile exists
  const { data: profileCheck, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', testEmail)
    .single();
  
  if (profileError) {
    console.log('❌ Profile not found:', profileError.message);
  } else {
    console.log('✅ Profile exists:', {
      id: profileCheck.id,
      email: profileCheck.email,
      role: profileCheck.role,
      is_active: profileCheck.is_active
    });
  }
}

async function checkEmailConfirmation() {
  console.log('\n3️⃣ Email confirmation troubleshooting...');
  console.log('If login keeps failing, check:');
  console.log('1. Supabase Dashboard → Authentication → Users');
  console.log('2. Look for jarett@clinicamedicos.org');
  console.log('3. Check if "Email Confirmed" column shows a date');
  console.log('4. If not confirmed, click the user and manually confirm');
  console.log('5. Or disable email confirmation in Auth Settings');
}

testLogin()
  .then(() => checkEmailConfirmation())
  .catch(console.error);