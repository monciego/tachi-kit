import { usePage } from '@inertiajs/react';

import type { PermissionName } from '@/types/permissions';

export function usePermissions() {
    const { auth } = usePage().props;

    const can = (permission: PermissionName): boolean => {
        return auth.can?.[permission] ?? false;
    };

    const canAny = (permissions: PermissionName[]): boolean => {
        return permissions.some((permission) => can(permission));
    };

    const canAll = (permissions: PermissionName[]): boolean => {
        return permissions.every((permission) => can(permission));
    };

    const cannot = (permission: PermissionName): boolean => {
        return !can(permission);
    };

    const hasRole = (roleName: string): boolean => {
        return auth.roles?.some((role) => role.name === roleName) ?? false;
    };

    const isTalent = (): boolean => hasRole('talent');

    return {
        can,
        canAny,
        canAll,
        cannot,
        hasRole,
        isTalent,
    };
}
