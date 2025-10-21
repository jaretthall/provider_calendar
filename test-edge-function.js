// Test script for create-user edge function
const SUPABASE_URL = 'https://fgqhclnsndiwdecxvcxi.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncWhjbG5zbmRpd2RlY3h2Y3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODQ4ODYsImV4cCI6MjA2NTE2MDg4Nn0.Q5KbeUgj4buVQL1SE4K1YB6cVpKf3MxNRAw0w-8Uzug';

async function testEdgeFunction() {
  try {
    // First, we need to login as an admin user to get a session token
    console.log('Please ensure you are logged in as an admin user in your app');
    console.log('Or provide a valid session token to test the edge function');

    // Test the edge function endpoint
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
      method: 'OPTIONS',
      headers: {
        'apikey': ANON_KEY,
      }
    });

    if (response.ok) {
      console.log('✓ Edge function is responding to OPTIONS (CORS check passed)');
    } else {
      console.log('✗ Edge function CORS check failed:', response.status, response.statusText);
    }

    // Test with GET to see if function exists
    const getResponse = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
      }
    });

    const text = await getResponse.text();
    console.log('\nFunction response to GET:', text);

  } catch (error) {
    console.error('Error testing edge function:', error);
  }
}

testEdgeFunction();