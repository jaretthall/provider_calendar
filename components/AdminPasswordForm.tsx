import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';

interface AdminPasswordFormProps {
  onAuthenticate: () => void;
  onClose: () => void;
}

const AdminPasswordForm: React.FC<AdminPasswordFormProps> = ({ onAuthenticate, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext not found');
  }

  const { login } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = login(password);
      if (success) {
        onAuthenticate();
      } else {
        setError('Invalid password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Admin Access Required</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        This action requires admin privileges. Please enter the admin password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Admin Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter admin password"
            required
            autoFocus
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !password.trim()}
          >
            {isSubmitting ? 'Authenticating...' : 'Authenticate'}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Admin access allows you to create, edit, and delete providers, clinics, medical assistants, and shifts.
        </p>
      </div>
    </div>
  );
};

export default AdminPasswordForm; 