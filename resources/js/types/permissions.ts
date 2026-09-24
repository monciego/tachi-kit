import type {
    PermissionGroupName,
    PermissionName,
} from '@/constants/access.generated';

export type {
    PermissionGroupName,
    PermissionName,
} from '@/constants/access.generated';

export type PermissionsMap = Record<PermissionName, boolean>;

export type PermissionLabels = Record<PermissionName, string>;

export type PermissionGroup = {
    name: PermissionGroupName;
    permissions: readonly PermissionName[];
};
