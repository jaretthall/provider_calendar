import React, { useState } from 'react';
import { useSupabaseAuth } from './SupabaseAuthProvider';

interface SupabaseLoginFormProps {
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const SupabaseLoginForm: React.FC<SupabaseLoginFormProps> = ({ onClose }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, resetPassword, isOnline } = useSupabaseAuth();

  const validateForm = (): boolean => {
    setError('');
    
    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (mode !== 'reset') {
      if (!password) {
        setError('Password is required');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (mode === 'signup' && password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      setError('Supabase authentication is not configured. The application will run in demo mode.');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      switch (mode) {
        case 'signin':
          const { user: signInUser, error: signInError } = await signIn(email, password);
          if (signInError) {
            setError(signInError.message || 'Failed to sign in');
          } else if (signInUser) {
            setSuccess('Successfully signed in!');
            setTimeout(() => onClose(), 1000);
          }
          break;

        case 'signup':
          const { user: signUpUser, error: signUpError } = await signUp(email, password);
          if (signUpError) {
            setError(signUpError.message || 'Failed to create account');
          } else {
            setSuccess('Account created! Please check your email to verify your account.');
            setTimeout(() => setMode('signin'), 2000);
          }
          break;

        case 'reset':
          const { error: resetError } = await resetPassword(email);
          if (resetError) {
            setError(resetError.message || 'Failed to send reset email');
          } else {
            setSuccess('Password reset email sent! Check your inbox.');
            setTimeout(() => setMode('signin'), 2000);
          }
          break;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
    }
  };

  const getSubmitText = () => {
    if (isLoading) return 'Please wait...';
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'reset': return 'Send Reset Email';
    }
  };

  if (!isOnline) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Demo Mode</h3>
        <p className="text-amber-700 mb-4">
          Supabase is not configured. The application is running in demo mode with local storage.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Continue in Demo Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
                disabled={isLoading}
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  minLength={6}
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  minLength={6}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {getSubmitText()}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => setMode('signup')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                  disabled={isLoading}
                >
                  Don't have an account? Sign up
                </button>
                <br />
                <button
                  onClick={() => setMode('reset')}
                  className="text-sm text-gray-600 hover:text-gray-500"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                onClick={() => setMode('signin')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Already have an account? Sign in
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => setMode('signin')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseLoginForm; 