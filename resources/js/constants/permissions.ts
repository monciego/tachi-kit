import type {
    PermissionGroupName,
    PermissionLabels,
    PermissionName,
} from "@/types/permissions";

export const PERMISSIONS = {
    USERS_VIEW: "users.view",
    USERS_CREATE: "users.create",
    USERS_EDIT: "users.edit",
    USERS_DELETE: "users.delete",
    ROLES_VIEW: "roles.view",
    ROLES_CREATE: "roles.create",
    ROLES_EDIT: "roles.edit",
    ROLES_DELETE: "roles.delete",
} as const;

export const PERMISSION_LABELS: PermissionLabels = {
    "users.view": "View Users",
    "users.create": "Create Users",
    "users.edit": "Edit Users",
    "users.delete": "Delete Users",
    "roles.view": "View Roles",
    "roles.create": "Create Roles",
    "roles.edit": "Edit Roles",
    "roles.delete": "Delete Roles",
};

export const PERMISSION_GROUPS: Record<
    PermissionGroupName,
    readonly PermissionName[]
> = {
    Users: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_EDIT,
        PERMISSIONS.USERS_DELETE,
    ],
    Roles: [
        PERMISSIONS.ROLES_VIEW,
        PERMISSIONS.ROLES_CREATE,
        PERMISSIONS.ROLES_EDIT,
        PERMISSIONS.ROLES_DELETE,
    ],
};

// Permissions only superadmin can assign (because system roles are locked)
export const SUPERADMIN_ONLY_PERMISSIONS: readonly PermissionName[] = [
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_EDIT,
    PERMISSIONS.ROLES_DELETE,
];

export function getPermissionLabel(permission: PermissionName): string {
    return PERMISSION_LABELS[permission];
}

export function isSuperadminOnlyPermission(
    permission: PermissionName,
): boolean {
    return SUPERADMIN_ONLY_PERMISSIONS.includes(permission);
}