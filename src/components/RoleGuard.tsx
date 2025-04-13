
import React, { ReactNode } from 'react';
import { useRole, UserRole } from '@/context/RoleContext';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = useRole();
  
  return hasPermission(allowedRoles) ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
