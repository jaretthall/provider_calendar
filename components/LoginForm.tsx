import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { isSupabaseConfigured } from '../utils/supabase';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.VIEW_ONLY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp, resetPassword, isLoading } = useAuth();

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
      } else if (mode === 'signup') {
        if (!email || !password || !confirmPassword) {
          setError('Please fill in all required fields');
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        const result = await signUp(email, password, firstName, lastName, role);
        if (result.success) {
          setMessage('Account created successfully! Please check your email to verify your account.');
          setMode('signin');
          // Clear form
          setPassword('');
          setConfirmPassword('');
          setFirstName('');
          setLastName('');
        } else {
          setError(result.error || 'Sign up failed');
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
            {mode === 'signup' && 'Create Account'}
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

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                  disabled={isFormDisabled}
                  required
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="First name"
                    disabled={isFormDisabled}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last name"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isFormDisabled}
                >
                  <option value={UserRole.VIEW_ONLY}>View Only</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: The first user will automatically become an admin regardless of this setting.
                </p>
              </div>
            </>
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
                {mode === 'signup' && 'Create Account'}
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
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="w-full text-sm text-blue-600 hover:text-blue-700 underline"
                disabled={isFormDisabled}
              >
                Don't have an account? Sign up
              </button>
            </>
          )}

          {(mode === 'signup' || mode === 'reset') && (
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