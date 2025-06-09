// User Management Types for Clinica Provider Schedule

export type UserRole = 'super_admin' | 'scheduler';

export type UserStatus = 'pending' | 'approved' | 'denied' | 'suspended';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  last_login?: string;
  notes?: string;
  approved_by_email?: string; // From the view
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
  notes?: string;
}

export interface UpdateUserRequest {
  id: string;
  full_name?: string;
  role?: UserRole;
  status?: UserStatus;
  notes?: string;
}

export interface UserManagementContextType {
  users: UserProfile[];
  currentUserProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isApproved: boolean;
  isSuperAdmin: boolean;
  fetchUsers: () => Promise<void>;
  fetchCurrentUserProfile: () => Promise<void>;
  approveUser: (userId: string, notes?: string) => Promise<void>;
  denyUser: (userId: string, notes?: string) => Promise<void>;
  suspendUser: (userId: string, notes?: string) => Promise<void>;
  updateUser: (updates: UpdateUserRequest) => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export interface PendingApprovalProps {
  userProfile: UserProfile | null;
  onRefresh: () => void;
}

export interface UserManagementDashboardProps {
  onClose: () => void;
}

export interface CreateUserFormProps {
  onClose: () => void;
  onUserCreated: () => void;
}

export interface UserDetailsModalProps {
  user: UserProfile;
  onClose: () => void;
  onUserUpdated: () => void;
}

// Permission checking utility types
export interface PermissionCheck {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAllData: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canManageProviders: boolean;
  canManageClinics: boolean;
  canManageShifts: boolean;
}

// UI State types
export interface UserTableRow extends UserProfile {
  statusColor: string;
  roleLabel: string;
  timeAgo: string;
}

export interface UserActionButton {
  label: string;
  action: string;
  color: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
  icon?: string;
  confirmMessage?: string;
} 