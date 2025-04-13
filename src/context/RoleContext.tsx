
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define available roles
export type UserRole = 'owner' | 'admin' | 'visitor';

type RoleContextType = {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('visitor');

  // Function to check if the current role has permission
  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    // Owner has all permissions
    if (role === 'owner') return true;
    
    // Check if current role is in the required roles
    return requiredRoles.includes(role);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
