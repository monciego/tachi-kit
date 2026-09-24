import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { UserStatusBadge } from '@/components/user-status-badge';
import { useInitials } from '@/hooks/use-initials';
import users from '@/routes/users';
import type { RecentUser } from '@/types';
import { getRoleBadgeVariant, getRoleColor } from '@/utils/role-color';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
});

export function RecentUsersTable({
    recentUsers,
}: {
    recentUsers: RecentUser[];
}) {
    const getInitials = useInitials();

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <CardTitle>Recent users</CardTitle>
                    <CardDescription>The newest accounts</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={users.index()}>
                        View all
                        <ArrowRight />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {recentUsers.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        No users yet.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Joined
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="size-8">
                                                <AvatarImage
                                                    className="object-cover"
                                                    src={
                                                        user.avatar ?? undefined
                                                    }
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate font-medium">
                                                    {user.name}
                                                </span>
                                                <span className="text-muted-foreground truncate text-xs">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant={getRoleBadgeVariant(
                                                        role,
                                                    )}
                                                    className={getRoleColor(
                                                        role,
                                                    )}
                                                >
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <UserStatusBadge
                                            active={user.is_active}
                                        />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-right">
                                        {user.created_at &&
                                            dateFormatter.format(
                                                new Date(user.created_at),
                                            )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

export function RecentUsersTableSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full" />
                        <div className="flex flex-1 flex-col gap-1.5">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
