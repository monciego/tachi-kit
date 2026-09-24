import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import RoleController from '@/actions/App/Http/Controllers/RoleController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PERMISSION_GROUPS, getPermissionLabel } from '@/constants/permissions';
import { index } from '@/routes/roles';
import type { PermissionName } from '@/types/permissions';
import type { BreadcrumbItem } from '@/types';

interface Props {
    permissions: PermissionName[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
    {
        title: 'Create Role',
        href: '/roles/create',
    },
];

export default function Create({ permissions }: Props) {
    const [selectedPermissions, setSelectedPermissions] = useState<
        PermissionName[]
    >([]);
    const [selectAll, setSelectAll] = useState(false);

    const handlePermissionToggle = (permission: PermissionName) => {
        const newPermissions = selectedPermissions.includes(permission)
            ? selectedPermissions.filter((p) => p !== permission)
            : [...selectedPermissions, permission];

        setSelectedPermissions(newPermissions);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...permissions]);
        }
        setSelectAll(!selectAll);
    };

    return (
        <>
            <Head title="Create Role" />

            <Link href={index().url}>
                <Button variant="ghost" className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Roles
                </Button>
            </Link>

            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                <CardHeader>
                    <CardTitle>Create New Role</CardTitle>
                    <CardDescription>
                        Add a new role and assign permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        {...RoleController.store.form()}
                        disableWhileProcessing
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g., Editor"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Permissions</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectAll}
                                                onCheckedChange={
                                                    handleSelectAll
                                                }
                                            />
                                            <label
                                                htmlFor="select-all"
                                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Select All
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-sidebar-border/70 dark:border-sidebar-border space-y-4 rounded-lg border p-4">
                                        {Object.entries(PERMISSION_GROUPS).map(
                                            ([group, perms]) => (
                                                <div
                                                    key={group}
                                                    className="space-y-2"
                                                >
                                                    <h4 className="text-sm font-semibold">
                                                        {group}
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                        {perms.map(
                                                            (permission) => (
                                                                <div
                                                                    key={
                                                                        permission
                                                                    }
                                                                    className="flex items-center space-x-2"
                                                                >
                                                                    <Checkbox
                                                                        id={
                                                                            permission
                                                                        }
                                                                        name="permissions[]"
                                                                        value={
                                                                            permission
                                                                        }
                                                                        checked={selectedPermissions.includes(
                                                                            permission,
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            handlePermissionToggle(
                                                                                permission,
                                                                            )
                                                                        }
                                                                    />
                                                                    <label
                                                                        htmlFor={
                                                                            permission
                                                                        }
                                                                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                    >
                                                                        {getPermissionLabel(
                                                                            permission,
                                                                        )}
                                                                    </label>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <InputError message={errors.permissions} />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" disabled={processing}>
                                        Create Role
                                    </Button>
                                    <Link href={index().url}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

Create.layout = {
    breadcrumbs,
};
