// Direct test of the edge function
const SUPABASE_URL = 'https://fgqhclnsndiwdecxvcxi.supabase.co';

async function testEdgeFunctionDirect() {
  try {
    console.log('Testing edge function directly...\n');

    // Test 1: Check if function exists with GET
    console.log('1. Testing GET request (should return 401 - expected):');
    const getResponse = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
      method: 'GET',
    });
    console.log(`   Status: ${getResponse.status} ${getResponse.statusText}`);
    const getText = await getResponse.text();
    console.log(`   Response: ${getText}\n`);

    // Test 2: Check OPTIONS (CORS preflight)
    console.log('2. Testing OPTIONS request (CORS preflight):');
    const optionsResponse = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://jaretthall.github.io',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type,apikey',
      }
    });
    console.log(`   Status: ${optionsResponse.status} ${optionsResponse.statusText}`);
    console.log(`   CORS Headers:`);
    console.log(`   - Allow-Origin: ${optionsResponse.headers.get('access-control-allow-origin')}`);
    console.log(`   - Allow-Headers: ${optionsResponse.headers.get('access-control-allow-headers')}`);
    console.log(`   - Allow-Methods: ${optionsResponse.headers.get('access-control-allow-methods')}`);

    if (optionsResponse.status === 503) {
      console.log('\n   ⚠️  503 Error: Edge Function might be down or having issues');
      console.log('   Possible causes:');
      console.log('   - Environment variables not set correctly');
      console.log('   - Function runtime error');
      console.log('   - Function needs redeployment');
    }

    // Test 3: Check function logs hint
    console.log('\n3. To check Edge Function logs:');
    console.log('   Go to: https://supabase.com/dashboard/project/fgqhclnsndiwdecxvcxi/functions/create-user/logs');
    console.log('   Look for any runtime errors or missing environment variables\n');

  } catch (error) {
    console.error('Error testing edge function:', error.message);
  }
}

testEdgeFunctionDirect();