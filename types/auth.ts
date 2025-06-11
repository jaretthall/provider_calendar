export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  VIEW_ONLY = 'view_only',
  ADMIN = 'admin'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: () => boolean;
  isViewOnly: () => boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
    created_at: string;
    updated_at: string;
  };
} 