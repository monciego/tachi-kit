import { Link, router } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { Edit, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { type DataTableFeatures } from '@/components/data-table-features';
import { UserAvatarStack } from '@/components/user-avatar-stack';
import { PERMISSIONS, getPermissionLabel } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { destroy, edit } from '@/routes/roles';
import type { PermissionName } from '@/types/permissions';
import type { Role } from '@/types/role';

const columnHelper = createColumnHelper<DataTableFeatures, Role>();

export const columns = columnHelper.columns([
    columnHelper.accessor('name', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role Name" />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Shield className="text-muted-foreground h-4 w-4" />
                <span className="font-medium capitalize">
                    {row.getValue('name')}
                </span>
                {row.original.is_system_role && (
                    <Badge variant="outline" className="text-xs">
                        System
                    </Badge>
                )}
            </div>
        ),
        enableHiding: false,
    }),
    columnHelper.accessor('permissions', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Permissions" />
        ),
        cell: ({ row }) => {
            const permissions = row.getValue<PermissionName[]>('permissions');

            return (
                <div className="flex flex-wrap gap-1">
                    {permissions.slice(0, 3).map((permission) => (
                        <Badge
                            key={permission}
                            variant="secondary"
                            className="text-xs"
                        >
                            {getPermissionLabel(permission)}
                        </Badge>
                    ))}
                    {permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{permissions.length - 3} more
                        </Badge>
                    )}
                </div>
            );
        },
    }),
    columnHelper.accessor('users', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Users" />
        ),
        cell: ({ row }) => (
            <UserAvatarStack
                users={row.original.users}
                count={row.original.users_count}
                maxVisible={3}
            />
        ),
    }),
    columnHelper.accessor('created_at', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
            const value = row.getValue<string>('created_at');

            if (!value) {
                return null;
            }

            return (
                <span className="text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, {
                        dateStyle: 'medium',
                    }).format(new Date(value))}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => <RoleRowActions role={row.original} />,
    }),
]);

function RoleRowActions({ role }: { role: Role }) {
    const { can } = usePermissions();

    const handleDelete = () => {
        router.delete(destroy(role.id).url);
    };

    return (
        <div className="flex items-center gap-2">
            {can(PERMISSIONS.ROLES_EDIT) && (
                <Link href={edit(role.id).url}>
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                </Link>
            )}
            {!role.is_system_role && can(PERMISSIONS.ROLES_DELETE) && (
                <DeleteDialog
                    item={role}
                    onDelete={handleDelete}
                    type="role"
                    title={`Delete ${role.name}`}
                    description={
                        <>
                            Are you sure you want to delete the{' '}
                            <span className="font-semibold">{role.name}</span>{' '}
                            role? This action cannot be undone.
                        </>
                    }
                    canDelete={role.users_count === 0}
                    warningMessage={
                        role.users_count > 0
                            ? `Cannot delete this role because ${role.users_count} ${
                                  role.users_count === 1
                                      ? 'user is'
                                      : 'users are'
                              } currently assigned to it. Please reassign them first.`
                            : undefined
                    }
                />
            )}
        </div>
    );
}
