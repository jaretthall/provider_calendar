import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New user form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('view_only');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Admin user creation requires backend API - contact system administrator');
    // In production, this should call a backend API or Edge Function
    // that has access to the service role key
  };

  const resetUserPassword = async (userId: string, email: string) => {
    setError('');
    setSuccess('');

    try {
      // Send password reset email
      if (!supabase) throw new Error('Supabase client not available');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(`Password reset email sent to ${email}`);
    } catch (err: any) {
      setError(`Failed to send reset email: ${err.message}`);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;
      
      loadUsers();
      setSuccess(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <button
          onClick={() => setShowNewUserForm(!showNewUserForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {showNewUserForm && (
        <form onSubmit={createUser} className="mb-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="px-3 py-2 border rounded-md"
              required
              minLength={6}
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="view_only">View Only</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => setShowNewUserForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Role</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Created</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2">{u.email}</td>
                <td className="py-2">
                  {u.first_name || u.last_name
                    ? `${u.first_name || ''} ${u.last_name || ''}`
                    : '-'}
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => resetUserPassword(u.id, u.email)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      disabled={u.id === user?.id}
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => toggleUserStatus(u.id, u.is_active)}
                      className="text-orange-600 hover:text-orange-800 text-sm"
                      disabled={u.id === user?.id}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;