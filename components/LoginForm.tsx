import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
  onClose: () => void;
}

// Predefined credentials for demo purposes
const DEMO_CREDENTIALS = {
  admin: { password: 'CPS2025!Secure', role: UserRole.ADMIN }
};

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (onLogin(username, password)) {
        onClose();
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDemoLogin = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword(DEMO_CREDENTIALS[demoUsername as keyof typeof DEMO_CREDENTIALS].password);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sign In to Clinica Provider Schedule
        </h2>
        <p className="text-sm text-gray-600">
          Please enter your credentials to access the scheduling system.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your username"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Account</h3>
        <button
          type="button"
          onClick={() => handleDemoLogin('admin')}
          className="w-full text-sm bg-blue-100 text-blue-800 py-2 px-4 rounded border hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Use Admin Demo Account<br/>
                          <span className="text-xs text-blue-600">Username: admin | Password: CPS2025!Secure</span>
        </button>
        
        <div className="mt-3 text-xs text-gray-500">
          <p><strong>Note:</strong> This is a demo application. In production, use secure authentication.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 