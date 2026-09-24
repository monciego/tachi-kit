import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { useInitials } from '@/hooks/use-initials';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { UserStatusBadge } from '@/components/user-status-badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { type DataTableFeatures } from '@/components/data-table-features';
import users from '@/routes/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRoleBadgeVariant, getRoleColor } from '@/utils/role-color';
import { PERMISSIONS } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import { ROLES } from '@/constants/roles';

export interface User {
    id: number;
    user_code: string;
    name: string;
    email: string;
    avatar?: string;
    roles: string[];
    created_at: string;
    is_active: boolean;
    deletable: boolean;
}

const columnHelper = createColumnHelper<DataTableFeatures, User>();

function UserNameCell({ user }: { user: User }) {
    const { auth } = usePage().props;
    const isCurrentUser = user.id === auth.user.id;
    const getInitials = useInitials();

    return (
        <div className="flex max-w-55 items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage
                    className="object-cover"
                    src={user.avatar ? `/storage/${user.avatar}` : undefined}
                    alt={user.name}
                />
                <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{user.name}</span>
            {isCurrentUser && (
                <Badge
                    variant="secondary"
                    className="shrink-0 rounded-sm px-1.5 font-normal"
                >
                    You
                </Badge>
            )}
        </div>
    );
}

export const columns = columnHelper.columns([
    columnHelper.accessor('user_code', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
            <Badge variant="outline" className="font-mono text-xs">
                {row.getValue('user_code')}
            </Badge>
        ),
        enableHiding: false,
    }),
    columnHelper.accessor('name', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => <UserNameCell user={row.original} />,
    }),
    columnHelper.accessor('email', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground max-w-65 truncate">
                {row.getValue('email')}
            </div>
        ),
    }),
    columnHelper.accessor('roles', {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Roles" />
        ),
        enableSorting: false,
        cell: ({ row }) => {
            const roles = row.getValue<string[]>('roles');
            const visible = roles.slice(0, 2);
            const extra = roles.length - visible.length;

            return (
                <div className="flex flex-wrap items-center gap-1">
                    {visible.map((role) => (
                        <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role)}
                            className={getRoleColor(role)}
                        >
                            {role}
                        </Badge>
                    ))}
                    {extra > 0 && (
                        <span className="text-muted-foreground text-xs">
                            +{extra}
                        </span>
                    )}
                </div>
            );
        },
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
    columnHelper.accessor('is_active', {
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => (
            <UserStatusBadge active={row.getValue<boolean>('is_active')} />
        ),
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => <UserRowActions user={row.original} />,
    }),
]);

function UserRowActions({ user }: { user: User }) {
    const { can } = usePermissions();
    const { auth } = usePage().props;
    const [open, setOpen] = React.useState(false);

    const canChangeStatus =
        user.id !== auth.user.id &&
        !user.roles.includes(ROLES.SUPERADMIN) &&
        can(PERMISSIONS.USERS_STATUS);
    const canDelete = user.deletable;

    const canDoAllActions =
        can(PERMISSIONS.USERS_EDIT) ||
        can(PERMISSIONS.USERS_STATUS) ||
        can(PERMISSIONS.USERS_DELETE);

    const handleDelete = () => {
        router.delete(users.destroy(user.id).url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const handleStatusChange = (isActive: boolean) => {
        router.patch(
            users.updateStatus(user.id).url,
            { is_active: isActive },
            { preserveScroll: true },
        );
    };

    return (
        <>
            {canDoAllActions && (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="data-[state=open]:bg-muted size-8"
                            >
                                <MoreHorizontal />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {can(PERMISSIONS.USERS_EDIT) && (
                                <DropdownMenuItem asChild>
                                    <Link href={users.edit(user.id).url}>
                                        <Pencil />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {canChangeStatus && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusChange(!user.is_active)
                                        }
                                    >
                                        {user.is_active ? (
                                            <UserX />
                                        ) : (
                                            <UserCheck />
                                        )}
                                        {user.is_active
                                            ? 'Deactivate'
                                            : 'Activate'}
                                    </DropdownMenuItem>
                                </>
                            )}
                            {can(PERMISSIONS.USERS_DELETE) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => setOpen(true)}
                                    >
                                        <Trash2 />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DeleteDialog
                        item={{ id: user.id, name: user.name }}
                        open={open}
                        onOpenChange={setOpen}
                        onDelete={handleDelete}
                        type="user"
                        title={`Delete ${user.name}`}
                        description={
                            <>
                                This will permanently delete{' '}
                                <span className="text-primary font-semibold">
                                    {user.name}
                                </span>{' '}
                                ({user.email}) and remove their access to the
                                app.
                            </>
                        }
                        canDelete={canDelete}
                        warningMessage={
                            !canDelete
                                ? 'This user is a protected account and cannot be deleted.'
                                : undefined
                        }
                    />
                </>
            )}
        </>
    );
}
