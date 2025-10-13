import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

// Re-export the useAuth hook from the context
export { useAuth } from '../contexts/AuthContext';

// Additional utility hooks for common authentication patterns
export const usePermissions = () => {
  const { user, isAuthenticated, isAdmin, isViewOnly } = useAuthContext();

  return {
    user,
    isAuthenticated,
    isAdmin: isAdmin(),
    isViewOnly: isViewOnly(),
    canEdit: isAdmin(),
    canView: isAuthenticated,
    canManageUsers: isAdmin(),
    canExportData: isAdmin(),
    canImportData: isAdmin(),
    canManageSettings: isAdmin(),
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => user ? roles.includes(user.role) : false,
  };
};

export const useAuthGuard = () => {
  const { isAuthenticated, isAdmin, isViewOnly } = useAuthContext();

  const requireAuth = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    }
  };

  const requireAdmin = (callback: () => void) => {
    if (isAdmin()) {
      callback();
    }
  };

  const requireViewOrAdmin = (callback: () => void) => {
    if (isAuthenticated && (isAdmin() || isViewOnly())) {
      callback();
    }
  };

  return {
    requireAuth,
    requireAdmin,
    requireViewOrAdmin,
  };
}; 