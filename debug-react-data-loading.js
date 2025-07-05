// DEBUG REACT DATA LOADING ISSUE
// Run this in your browser's developer console while on the dynamic app

// 1. Check if Supabase client is available
console.log('🔍 Checking Supabase client...');
console.log('Window.supabase:', window.supabase);

// 2. Test direct Supabase query
console.log('🔄 Testing direct Supabase query...');
if (window.supabase) {
    window.supabase
        .from('shifts')
        .select('*')
        .then(({ data, error }) => {
            console.log('📊 Direct query result:');
            console.log('Data:', data);
            console.log('Error:', error);
            
            if (data) {
                console.log(`✅ Found ${data.length} shifts in database`);
                data.forEach(shift => {
                    console.log(`- Shift ${shift.id}: ${shift.start_date} (Provider: ${shift.provider_id})`);
                });
            }
        });
} else {
    console.log('❌ Supabase client not available on window');
}

// 3. Check React component state (if available)
console.log('🔍 Checking React component state...');

// Instructions for manual debugging:
console.log(`
🛠️  MANUAL DEBUGGING STEPS:

1. Open Developer Tools (F12)
2. Go to Console tab  
3. Paste and run the code above
4. Check Network tab for failed requests
5. Look for errors in Console tab

EXPECTED RESULTS:
- Should see 2 shifts in database (Kelly Arnold + Philip Sutherland)
- No error messages
- If no data returned, there's a connection issue
- If data returned but not showing in UI, it's a React state issue

NEXT STEPS BASED ON RESULTS:
- If no data: Check network connectivity
- If data but no UI: React state sync issue
- If errors: Check console for specific error messages
`);

// 4. Force refresh the data hooks (if accessible)
setTimeout(() => {
    console.log('🔄 Attempting to trigger data refresh...');
    // Try to access React dev tools or component state
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools detected - check Components tab');
    }
}, 1000); 