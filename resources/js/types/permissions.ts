export type PermissionName =
    | 'users.view'
    | 'users.create'
    | 'users.edit'
    | 'users.delete'
    | 'users.status'
    | 'roles.view'
    | 'roles.create'
    | 'roles.edit'
    | 'roles.delete';

export type PermissionGroupName = 'Users' | 'Roles';

export type PermissionsMap = Record<PermissionName, boolean>;

export type PermissionLabels = Record<PermissionName, string>;

export type PermissionGroup = {
    name: PermissionGroupName;
    permissions: readonly PermissionName[];
};
