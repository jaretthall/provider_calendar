import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import CalendarIcon from './icons/CalendarIcon';

interface LoginScreenProps {
  onSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Predefined accounts
  const viewerAccount = {
    email: 'viewer@clinicamedicos.org',
    password: 'ViewerPass2025!'
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError('Check your email for the confirmation link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userEmail: string, userPassword: string) => {
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });
      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-clinica-crimson" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Clínica Médicos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Create your account' : 'Sign in to access schedules'}
          </p>
        </div>

        {/* Quick Login Options */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500 font-medium">Quick Login Options</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">👁️ Viewer Account</h3>
                <span className="text-xs text-gray-500">View schedules only</span>
              </div>
              <div className="text-xs text-gray-600 mb-3 space-y-1">
                <div>Email: <code className="bg-gray-100 px-1 rounded">{viewerAccount.email}</code></div>
                <div>Password: <code className="bg-gray-100 px-1 rounded">{viewerAccount.password}</code></div>
              </div>
              <button
                type="button"
                onClick={() => quickLogin(viewerAccount.email, viewerAccount.password)}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in as Viewer'}
              </button>
            </div>
          </div>
        </div>

        {/* Manual Login Form */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or sign in manually</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-clinica-crimson focus:border-clinica-crimson focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-clinica-crimson focus:border-clinica-crimson focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-clinica-crimson hover:bg-clinica-scarlet focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinica-crimson disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-clinica-crimson hover:text-clinica-scarlet text-sm"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Note: All authenticated users have full editing privileges. <br />
          Contact administrator for access if you don't have an account.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
