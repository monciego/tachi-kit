import type { PermissionName } from './permissions';

export type SystemRoleName = 'superadmin' | 'admin' | 'user';

export type RoleMeta = {
    id: number;
    name: string;
    is_system_role: boolean;
    [key: string]: unknown;
};

export type RoleUser = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
};

export type Role = {
    id: number;
    name: string;
    guard_name?: string;
    permissions: PermissionName[];
    users?: RoleUser[];
    users_count: number;
    is_system_role: boolean;
    created_at: string;
    updated_at?: string;
};
