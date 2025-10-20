import { supabase } from './supabase';

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'admin' | 'scheduler' | 'view_only';
  firstName?: string;
  lastName?: string;
}

export interface CreateUserResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Creates a new user using Edge Function (preferred) or fallback method
 */
export async function createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not available' };
    }

    // Get current user's session for authorization
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'You must be logged in to create users' };
    }

    // Try Edge Function first (preferred method)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          email: userData.email.toLowerCase().trim(),
          password: userData.password,
          role: userData.role
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          user: result.user
        };
      }

      // If Edge Function fails, fall back to profile-only creation
      console.warn('Edge Function failed, falling back to profile-only creation:', result.error);

    } catch (edgeFunctionError) {
      console.warn('Edge Function not available, using fallback method:', edgeFunctionError);
    }

    // Fallback: Create user profile only (user must sign up separately)
    return await createUserProfileOnly(userData);

  } catch (error) {
    console.error('Error in createUser:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    };
  }
}

/**
 * Fallback method: Creates user profile only (auth user must be created separately)
 */
async function createUserProfileOnly(userData: CreateUserRequest): Promise<CreateUserResponse> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Check if profile already exists with this email
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('email', userData.email.toLowerCase().trim())
      .single();

    if (existingProfile) {
      return {
        success: false,
        error: `User profile already exists for ${userData.email}. They can sign up with this email.`
      };
    }

    // Create user profile with placeholder user_id
    const profileData = {
      id: crypto.randomUUID(),
      user_id: crypto.randomUUID(), // Temporary - will be updated when user signs up
      email: userData.email.toLowerCase().trim(),
      first_name: userData.firstName || userData.email.split('@')[0],
      last_name: userData.lastName || '',
      role: userData.role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([profileData]);

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    return {
      success: true,
      user: {
        id: profileData.user_id,
        email: profileData.email,
        role: profileData.role
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user profile'
    };
  }
}

/**
 * Sends a password reset email to a user
 */
export async function resetUserPassword(email: string): Promise<CreateUserResponse> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not available' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset email'
    };
  }
}

/**
 * Toggles user active status
 */
export async function toggleUserStatus(userId: string, currentStatus: boolean): Promise<CreateUserResponse> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not available' };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user status'
    };
  }
}