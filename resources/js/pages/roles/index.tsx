import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/constants/permissions';
import { usePermissions } from '@/hooks/use-permissions';
import roles, { create } from '@/routes/roles';
import type { Paginator } from '@/types/table';
import type { Role } from '@/types/role';
import type { BreadcrumbItem } from '@/types';

interface IndexProps {
    roles: Paginator<Role>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: roles.index(),
    },
];

export default function Index({ roles: paginator }: IndexProps) {
    const { can } = usePermissions();

    return (
        <>
            <Head title="Roles" />
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Roles
                    </h2>
                    <p className="text-muted-foreground">
                        Manage system roles and their permissions
                    </p>
                </div>

                {can(PERMISSIONS.ROLES_CREATE) && (
                    <Link href={create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Role
                        </Button>
                    </Link>
                )}
            </div>

            <DataTable
                columns={columns}
                data={paginator.data}
                paginator={paginator}
                server={{
                    route: roles.index().url,
                    searchPlaceholder: 'Search roles...',
                }}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs,
};
