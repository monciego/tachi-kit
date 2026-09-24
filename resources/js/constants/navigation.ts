import { BookOpen, FolderGit2, LayoutGrid, Shield, Users } from 'lucide-react';

import { PERMISSIONS } from '@/constants/permissions';
import { dashboard } from '@/routes';
import roles from '@/routes/roles';
import users from '@/routes/users';
import type { NavItem } from '@/types';
import type { PermissionName } from '@/types/permissions';

export function isNavItemVisible(
    item: NavItem,
    can: (permission: PermissionName) => boolean,
    userRoles: string[],
): boolean {
    return (
        (!item.permission || can(item.permission)) &&
        (!item.role || userRoles.includes(item.role))
    );
}

export const MAIN_NAV_ITEMS: NavItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        description: 'Overview of your day and progress',
        category: 'Platform',
    },
];

export const ACCESS_CONTROL_NAV_ITEMS: NavItem[] = [
    {
        id: 'users',
        title: 'Users',
        href: users.index(),
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
        description: 'Manage system users and their roles',
        category: 'Access Control',
    },
    {
        id: 'roles',
        title: 'Roles',
        href: roles.index(),
        icon: Shield,
        permission: PERMISSIONS.ROLES_VIEW,
        description: 'Manage system roles and their permissions',
        category: 'Access Control',
    },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
    {
        id: 'repository',
        title: 'Repository',
        href: 'https://github.com/monciego/tachi-kit',
        icon: FolderGit2,
    },
    {
        id: 'documentation',
        title: 'Documentation',
        href: 'https://github.com/monciego/tachi-kit',
        icon: BookOpen,
    },
];

export const APP_NAV_ITEMS: NavItem[] = [
    ...MAIN_NAV_ITEMS,
    ...ACCESS_CONTROL_NAV_ITEMS,
];
