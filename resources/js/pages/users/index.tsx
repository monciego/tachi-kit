import { Head, router } from "@inertiajs/react";

import { DataTable } from "@/components/data-table";
import { columns, type User } from "./columns";
import users from "@/routes/users";
import { type Paginator } from "@/types/table";

interface IndexProps {
    users: Paginator<User>;
    roleOptions: string[];
}

export default function Index({ users: paginator, roleOptions }: IndexProps) {
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
