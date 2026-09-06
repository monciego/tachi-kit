import * as React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useInitials } from "@/hooks/use-initials";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { type DataTableFeatures } from "@/components/data-table-features";
import users from "@/routes/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRoleBadgeVariant, getRoleColor } from "@/utils/role-color";

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    roles: string[];
    created_at: string;
    deletable: boolean;
}

const columnHelper = createColumnHelper<DataTableFeatures, User>();

function UserNameCell({ user }: { user: User }) {
    const { auth } = usePage().props;
    const isCurrentUser = user.id === auth.user.id;
    const getInitials = useInitials();

    return (
        <div className="flex max-w-[220px] items-center gap-2">
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
    columnHelper.accessor("id", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground w-[80px] font-mono text-sm">
                {row.getValue("id")}
            </div>
        ),
        enableHiding: false,
    }),
    columnHelper.accessor("name", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => <UserNameCell user={row.original} />,
    }),
    columnHelper.accessor("email", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground max-w-[260px] truncate">
                {row.getValue("email")}
            </div>
        ),
    }),
    columnHelper.accessor("roles", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Roles" />
        ),
        enableSorting: false,
        cell: ({ row }) => {
            const roles = row.getValue<string[]>("roles");
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
    columnHelper.accessor("created_at", {
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
            const value = row.getValue<string>("created_at");

            if (!value) {
                return null;
            }

            return (
                <span className="text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                    }).format(new Date(value))}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => <UserRowActions user={row.original} />,
    }),
]);

function UserRowActions({ user }: { user: User }) {
    const [open, setOpen] = React.useState(false);
    const [pending, setPending] = React.useState(false);

    const handleDelete = () => {
        setPending(true);
        router.delete(users.destroy(user.id).url, {
            preserveScroll: true,
            onFinish: () => setPending(false),
        });
    };

    return (
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
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem asChild>
                        <Link href={users.edit(user.id).url}>
                            <Pencil />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setOpen(true)}
                    >
                        <Trash2 />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete user</DialogTitle>
                        <DialogDescription>
                            This will permanently delete {user.name} (
                            {user.email}) and remove their access to the app.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={pending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={pending}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
