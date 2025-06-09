import React from 'react';
import { UserManagementContext, useUserManagementOperations } from '../hooks/useUserManagement';

interface UserManagementProviderProps {
  children: React.ReactNode;
}

const UserManagementProvider: React.FC<UserManagementProviderProps> = ({ children }) => {
  const userManagementOps = useUserManagementOperations();

  return (
    <UserManagementContext.Provider value={userManagementOps}>
      {children}
    </UserManagementContext.Provider>
  );
};

export default UserManagementProvider; 