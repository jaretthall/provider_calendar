import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useSupabaseAuth } from '../components/SupabaseAuthProvider';
import { 
  UserProfile, 
  UserManagementContextType, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserRole,
  UserStatus 
} from '../types/userManagement';

// User Management Context
export const UserManagementContext = createContext<UserManagementContextType | null>(null);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
};

// Custom hook for user management operations
export const useUserManagementOperations = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user: supabaseUser } = useSupabaseAuth();
  const isOnline = isSupabaseConfigured();

  // Check if current user is approved
  const isApproved = currentUserProfile?.status === 'approved';
  
  // Check if current user is super admin
  const isSuperAdmin = currentUserProfile?.role === 'super_admin' && isApproved;

  // Fetch all users (super admin only)
  const fetchUsers = useCallback(async () => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase!
        .from('user_management_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin]);

  // Fetch current user's profile
  const fetchCurrentUserProfile = useCallback(async () => {
    if (!isOnline || !supabaseUser) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase!
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setCurrentUserProfile(data || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user profile';
      setError(message);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser]);

  // Approve a user
  const approveUser = useCallback(async (userId: string, notes?: string) => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) {
      throw new Error('Not authorized to approve users');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase!
        .from('user_profiles')
        .update({
          status: 'approved' as UserStatus,
          approved_by: supabaseUser.id,
          approved_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Refresh users list
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin, fetchUsers]);

  // Deny a user
  const denyUser = useCallback(async (userId: string, notes?: string) => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) {
      throw new Error('Not authorized to deny users');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase!
        .from('user_profiles')
        .update({
          status: 'denied' as UserStatus,
          approved_by: supabaseUser.id,
          approved_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deny user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin, fetchUsers]);

  // Suspend a user
  const suspendUser = useCallback(async (userId: string, notes?: string) => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) {
      throw new Error('Not authorized to suspend users');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase!
        .from('user_profiles')
        .update({
          status: 'suspended' as UserStatus,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to suspend user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin, fetchUsers]);

  // Update user profile
  const updateUser = useCallback(async (updates: UpdateUserRequest) => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) {
      throw new Error('Not authorized to update users');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase!
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', updates.id);

      if (updateError) {
        throw updateError;
      }

      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin, fetchUsers]);

  // Create new user (super admin only)
  const createUser = useCallback(async (userData: CreateUserRequest) => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) {
      throw new Error('Not authorized to create users');
    }

    try {
      setLoading(true);
      setError(null);

      // Create auth user
      const { data: authData, error: authError } = await supabase!.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true // Auto-confirm email for admin-created users
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update the user profile that was automatically created by trigger
      const { error: profileError } = await supabase!
        .from('user_profiles')
        .update({
          full_name: userData.full_name,
          role: userData.role || 'scheduler',
          status: 'approved', // Admin-created users are auto-approved
          approved_by: supabaseUser.id,
          approved_at: new Date().toISOString(),
          notes: userData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (profileError) {
        throw profileError;
      }

      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin, fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    if (!isOnline || !supabaseUser || !isSuperAdmin) {
      throw new Error('Not authorized to delete users');
    }

    try {
      setLoading(true);
      setError(null);

      // Delete from auth.users (will cascade to user_profiles)
      const { error: deleteError } = await supabase!.auth.admin.deleteUser(userId);

      if (deleteError) {
        throw deleteError;
      }

      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseUser, isSuperAdmin, fetchUsers]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (supabaseUser) {
      fetchCurrentUserProfile();
    }
  }, [supabaseUser, fetchCurrentUserProfile]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin, fetchUsers]);

  return {
    users,
    currentUserProfile,
    loading,
    error,
    isApproved,
    isSuperAdmin,
    fetchUsers,
    fetchCurrentUserProfile,
    approveUser,
    denyUser,
    suspendUser,
    updateUser,
    createUser,
    deleteUser
  };
};

// Permission checking utilities
export const usePermissions = () => {
  const { currentUserProfile, isApproved, isSuperAdmin } = useUserManagement();

  return {
    canManageUsers: isSuperAdmin,
    canManageSettings: isSuperAdmin,
    canViewAllData: isApproved,
    canExportData: isApproved,
    canImportData: isSuperAdmin, // Only super admin can import
    canManageProviders: isApproved,
    canManageClinics: isApproved,
    canManageShifts: isApproved,
    currentRole: currentUserProfile?.role || 'scheduler',
    currentStatus: currentUserProfile?.status || 'pending'
  };
}; 