import { Head, Link, router } from "@inertiajs/react";

import { DataTable } from "@/components/data-table";
import { columns, type User } from "./columns";
import users from "@/routes/users";
import { type Paginator } from "@/types/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface IndexProps {
    users: Paginator<User>;
    roleOptions: string[];
    canCreateUsers: boolean;
}

export default function Index({
    users: paginator,
    roleOptions,
    canCreateUsers,
}: IndexProps) {
    return (
        <>
            <Head title="Users" />
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Users
                    </h2>
                    <p className="text-muted-foreground">
                        Manage system users and their roles
                    </p>
                </div>

                {canCreateUsers && (
                    <Link href={users.create().url}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
                )}
            </div>
            <DataTable
                columns={columns}
                data={paginator.data}
                paginator={paginator}
                enableRowSelection
                bulkActions={[
                    {
                        label: "Delete",
                        noun: "users",
                        isProtected: (user) => !user.deletable,
                        confirmTitle: "Delete selected users",
                        confirmDescription:
                            "This will permanently delete the selected users and remove their access to the app.",
                        onConfirm: (selectedUsers) => {
                            router.post(users.bulkDelete().url, {
                                ids: selectedUsers.map((user) => user.id),
                            });
                        },
                    },
                ]}
                server={{
                    route: users.index().url,
                    searchPlaceholder: "Search users...",
                    filters: [
                        {
                            column: "roles",
                            param: "role",
                            title: "Role",
                            options: roleOptions.map((role) => ({
                                label: role,
                                value: role,
                            })),
                        },
                        {
                            column: "is_active",
                            param: "status",
                            title: "Status",
                            options: [
                                { label: "Active", value: "active" },
                                { label: "Inactive", value: "inactive" },
                            ],
                        },
                    ],
                }}
            />
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: "Users",
            href: users.index(),
        },
    ],
};
