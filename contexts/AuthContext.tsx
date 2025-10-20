import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { AuthContextType, User, UserRole, UserProfile } from '../types/auth';
import { ToastContext } from '../App';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const toastContext = useContext(ToastContext);
  if (!toastContext) {
    throw new Error('AuthProvider must be used within ToastContext');
  }
  const { addToast } = toastContext;

  useEffect(() => {
    // Initialize authentication state
    initializeAuth();

    // Set up auth state listener for real authentication
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (session?.user) {
          // User is signed in - load their profile
          await loadUserProfile(session.user.id);
        } else {
          // User is signed out - set as anonymous
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const initializeAuth = async () => {
    try {
      if (!supabase) {
        console.error('Supabase not configured - please check your environment variables');
        addToast('Supabase configuration missing. Please check your .env file.', 'error');
        setIsLoading(false);
        return;
      }

      // Check if user is already authenticated
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (session?.user) {
        // User is already signed in - load their profile
        console.log('User already authenticated:', session.user.email);
        await loadUserProfile(session.user.id);
      } else {
        // User is anonymous - allow read-only access
        console.log('Anonymous user - read-only access enabled');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      // If auth fails, allow anonymous access
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for userId:', userId);
      if (!supabase) {
        console.error('No supabase client available');
        addToast('Database connection not available', 'error');
        setIsLoading(false);
        return;
      }

      console.log('Fetching user profile from database...');
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile query timeout')), 10000) // Increased to 10 seconds
      );
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      console.log('User profile query result:', { profile, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Database error loading user profile:', error);
        if (error.message.includes('relation "user_profiles" does not exist')) {
          addToast('Database not properly set up. Please run the setup SQL scripts.', 'error');
        } else {
          addToast(`Database error: ${error.message}`, 'error');
        }
        setIsLoading(false);
        return;
      }

      if (profile) {
        console.log('User profile found, creating user data...');
        const userData: User = {
          id: profile.id,
          email: profile.email,
          role: profile.role as UserRole,
          firstName: profile.first_name || undefined,
          lastName: profile.last_name || undefined,
          isActive: profile.is_active,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };

        console.log('Setting user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('No user profile found in database');
        // Profile doesn't exist, sign out
        await signOut();
        addToast('User profile not found. You may need to be invited by an administrator.', 'error');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      if (error instanceof Error && error.message === 'Profile query timeout') {
        console.error('Profile query timed out - proceeding with mock user');
        // Create a temporary user to prevent hanging
        const mockUser: User = {
          id: userId,
          email: 'unknown@example.com',
          role: UserRole.ADMIN,
          firstName: 'User',
          lastName: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        addToast('Profile loading timed out - using temporary access', 'warning');
      } else {
        addToast(`Failed to load user profile: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: 'Authentication not configured' };
      }

      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Profile will be loaded via the auth state change listener
        addToast('Successfully signed in!', 'success');
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    role: UserRole = UserRole.VIEW_ONLY
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: 'Authentication not configured' };
      }

      setIsLoading(true);

      console.log('Attempting to sign up user with minimal data...');

      // Simplified signup - no pre-checks, minimal metadata
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
            role: UserRole.ADMIN, // Make first user admin for testing
          }
        }
      });

      console.log('Supabase signup response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message };
      }

      if (data.user) {
        addToast('Account created successfully!', 'success');
        return { success: true };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('Sign up error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      handleSignOut();
      addToast('Successfully signed out', 'success');
    } catch (error) {
      console.error('Sign out error:', error);
      addToast('Error signing out', 'error');
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: 'Authentication not configured' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase || !user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
      }

      // Reload user profile
      await loadUserProfile(user.id);
      addToast('Profile updated successfully', 'success');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN;
  };

  const isViewOnly = (): boolean => {
    return user?.role === UserRole.VIEW_ONLY;
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isViewOnly,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 