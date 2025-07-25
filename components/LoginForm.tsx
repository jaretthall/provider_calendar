import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { isSupabaseConfigured } from '../utils/supabase';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, resetPassword, isLoading } = useAuth();

  if (!isSupabaseConfigured()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication Not Available</h2>
            <p className="text-gray-600 mb-4">
              Supabase authentication is not configured. The application will run in demo mode 
              with localStorage persistence.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue in Demo Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          setError('Please fill in all fields');
          return;
        }

        const result = await signIn(email, password);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Sign in failed');
        }
      } else if (mode === 'reset') {
        if (!email) {
          setError('Please enter your email address');
          return;
        }

        const result = await resetPassword(email);
        if (result.success) {
          setMessage('Password reset email sent! Check your inbox for instructions.');
          setMode('signin');
        } else {
          setError(result.error || 'Password reset failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'signin' && 'Sign In'}
            {mode === 'reset' && 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isFormDisabled}
            title="Close"
            aria-label="Close dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{message}</p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              disabled={isFormDisabled}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                disabled={isFormDisabled}
                required
                minLength={6}
              />
            </div>
          )}


          <button
            type="submit"
            disabled={isFormDisabled}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFormDisabled ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'reset' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="w-full text-sm text-blue-600 hover:text-blue-700 underline"
                disabled={isFormDisabled}
              >
                Forgot your password?
              </button>
            </>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="w-full text-sm text-blue-600 hover:text-blue-700 underline"
              disabled={isFormDisabled}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 