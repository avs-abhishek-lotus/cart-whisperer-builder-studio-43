
import React from 'react';
import { useRole, UserRole } from '@/context/RoleContext';
import { Button } from '@/components/ui/button';
import { Shield, User, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const roleIcons = {
  owner: <Shield className="h-4 w-4 text-red-500" />,
  admin: <Users className="h-4 w-4 text-blue-500" />,
  visitor: <User className="h-4 w-4 text-green-500" />
};

const roleLabels = {
  owner: 'Shop Owner',
  admin: 'Admin',
  visitor: 'Visitor'
};

const RoleSelector: React.FC = () => {
  const { role, setRole } = useRole();
  const { toast } = useToast();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    toast({
      title: "Role Changed",
      description: `You are now a ${roleLabels[newRole]}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {roleIcons[role]}
          <span>{roleLabels[role]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => handleRoleChange('owner')}
        >
          <Shield className="h-4 w-4 text-red-500" />
          Shop Owner
          <span className="text-xs text-muted-foreground ml-2">(Full Control)</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => handleRoleChange('admin')}
        >
          <Users className="h-4 w-4 text-blue-500" />
          Admin
          <span className="text-xs text-muted-foreground ml-2">(Manage Products)</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2" 
          onClick={() => handleRoleChange('visitor')}
        >
          <User className="h-4 w-4 text-green-500" />
          Visitor
          <span className="text-xs text-muted-foreground ml-2">(Shopping Only)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleSelector;
