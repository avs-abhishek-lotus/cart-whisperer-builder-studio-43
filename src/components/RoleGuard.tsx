
import React, { ReactNode } from 'react';
import { useRole, UserRole } from '@/context/RoleContext';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  inverse?: boolean; // Show content for roles NOT in the allowed list
};

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null,
  inverse = false
}) => {
  const { hasPermission } = useRole();
  
  const shouldRender = inverse 
    ? !hasPermission(allowedRoles)
    : hasPermission(allowedRoles);
  
  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
