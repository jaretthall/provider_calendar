import React, { useEffect, useState } from 'react';
import { supabase, testSupabaseConnection, checkSupabaseStatus } from '../utils/supabase';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

const SupabaseTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Environment Variables
    results.push({
      test: 'Environment Variables',
      status: process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY ? 'success' : 'error',
      message: process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY 
        ? 'Environment variables are set' 
        : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
      details: {
        url: process.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    });

    // Test 2: Supabase Client Initialization
    try {
      const status = await checkSupabaseStatus();
      results.push({
        test: 'Supabase Client',
        status: status.isConfigured ? 'success' : 'error',
        message: status.isConfigured ? 'Client initialized successfully' : 'Client not configured',
        details: status
      });
    } catch (error) {
      results.push({
        test: 'Supabase Client',
        status: 'error',
        message: 'Failed to initialize client',
        details: error
      });
    }

    // Test 3: Database Connection
    try {
      const connectionTest = await testSupabaseConnection();
      results.push({
        test: 'Database Connection',
        status: connectionTest.success ? 'success' : 'error',
        message: connectionTest.message,
        details: connectionTest.details
      });
    } catch (error) {
      results.push({
        test: 'Database Connection',
        status: 'error',
        message: 'Connection test failed',
        details: error
      });
    }

    // Test 4: Authentication Check
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      results.push({
        test: 'Authentication',
        status: error ? 'error' : 'success',
        message: user ? `Logged in as: ${user.email}` : 'Not authenticated (this is normal)',
        details: { user: user?.email || 'None', error: error?.message }
      });
    } catch (error) {
      results.push({
        test: 'Authentication',
        status: 'error',
        message: 'Auth check failed',
        details: error
      });
    }

    // Test 5: Database Schema Check
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('count')
        .limit(1);
      
      results.push({
        test: 'Database Schema',
        status: error ? 'error' : 'success',
        message: error ? `Schema error: ${error.message}` : 'Tables accessible',
        details: { error: error?.message, data }
      });
    } catch (error) {
      results.push({
        test: 'Database Schema',
        status: 'error',
        message: 'Schema check failed',
        details: error
      });
    }

    setTests(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Supabase Connection Test</h2>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Re-run Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {tests.map((test, index) => (
          <div key={index} className={`p-4 rounded-md border ${getStatusColor(test.status)}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{getStatusIcon(test.status)}</span>
              <h3 className="font-semibold">{test.test}</h3>
            </div>
            <p className="mb-2">{test.message}</p>
            {test.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• If all tests pass ✅, Supabase is working correctly!</li>
          <li>• If environment variables fail ❌, create/check your .env.local file</li>
          <li>• If database connection fails ❌, verify your Supabase project is active</li>
          <li>• If schema fails ❌, run the database schema in Supabase SQL Editor</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseTest; 