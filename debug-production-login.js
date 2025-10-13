// Debug production login issues - Enhanced version
// Run this in browser console on your production site

console.log('🔍 Enhanced debugging for production login...');

// Check if Supabase is accessible
if (window.supabase) {
  console.log('✅ Supabase client found');
  
  // Test basic connection
  window.supabase.from('providers').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Database connection failed:', error);
      } else {
        console.log('✅ Database connection works');
      }
    });
  
  // Check auth configuration
  console.log('Testing authentication...');
  
  // Try to get current session
  window.supabase.auth.getSession()
    .then(({ data, error }) => {
      console.log('Session check:', { session: data.session, error });
    });
  
  // Check multiple tables to understand the database state
  const tables = ['user_profiles', 'providers', 'shifts', 'locations'];
  tables.forEach(table => {
    window.supabase.from(table).select('*').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error(`❌ ${table} table issue:`, error);
          if (error.code === '42P01') {
            console.error(`→ ${table} table does not exist!`);
          }
        } else {
          console.log(`✅ ${table} table accessible, sample:`, data);
        }
      });
  });
  
  // Test specific login with common credentials
  console.log('\n🔐 Testing login with common credentials...');
  const testLogin = async (email, password) => {
    console.log(`Testing login: ${email}`);
    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        console.error(`❌ Login failed for ${email}:`, error);
        console.error('Error code:', error.status);
        console.error('Error message:', error.message);
      } else {
        console.log(`✅ Login successful for ${email}!`);
        // Sign out immediately after test
        await window.supabase.auth.signOut();
      }
    } catch (err) {
      console.error(`💥 Exception during login for ${email}:`, err);
    }
  };
  
  // Test common credentials
  setTimeout(() => {
    testLogin('admin@example.com', 'securepass123');
  }, 1000);
  
  setTimeout(() => {
    testLogin('admin@company.com', 'securepass123');
  }, 2000);
    
} else {
  console.error('❌ Supabase client not found - check environment variables');
}

// Check environment
console.log('Environment check:');
console.log('- URL:', window.location.href);
console.log('- User agent:', navigator.userAgent);

// Check for authentication setup
console.log('\n🔧 Checking authentication setup...');
if (typeof window !== 'undefined') {
  console.log('- localStorage auth keys:', Object.keys(localStorage).filter(k => k.includes('supabase')));
  console.log('- sessionStorage auth keys:', Object.keys(sessionStorage).filter(k => k.includes('supabase')));
}

console.log('\n💡 Watch the network tab for the actual 400 error details');