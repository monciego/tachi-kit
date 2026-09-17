import { Form, Head } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import { ArrowLeft, Shield, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

import InputError from "@/components/input-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERMISSION_GROUPS, getPermissionLabel } from "@/constants/permissions";
import roles, { edit, index, update } from "@/routes/roles";
import type { PermissionName } from "@/types/permissions";
import type { Role } from "@/types/role";
import type { BreadcrumbItem } from "@/types";

interface Props {
    role: Role;
    permissions: PermissionName[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Roles",
        href: "/roles",
    },
    {
        title: "Edit Role",
        href: roles.edit(0),
    },
];

export default function Edit({ role, permissions }: Props) {
    const isSuperadmin = role.name === "superadmin";
    const isSystemRole = role.is_system_role;

    const initialPermissions = [...role.permissions];

    const [selectedPermissions, setSelectedPermissions] = useState<
        PermissionName[]
    >(initialPermissions);
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        setSelectAll(selectedPermissions.length === permissions.length);
    }, [selectedPermissions, permissions]);

    const handlePermissionToggle = (permission: PermissionName) => {
        if (isSuperadmin) return;

        setSelectedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission],
        );
    };

    const handleSelectAll = () => {
        if (isSuperadmin) return;

        if (selectAll) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...permissions]);
        }
        setSelectAll(!selectAll);
    };

    return (
        <>
            <Head title={`Edit ${role.name}`} />

            <div className="container mx-auto max-w-3xl">
                <Link href={index().url}>
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Roles
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                    isSuperadmin
                                        ? "bg-destructive/10"
                                        : "bg-primary/10"
                                }`}
                            >
                                {isSuperadmin ? (
                                    <ShieldAlert className="h-6 w-6 text-destructive" />
                                ) : (
                                    <Shield className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle>Edit Role</CardTitle>
                                    {isSystemRole && (
                                        <Badge variant="outline">
                                            System Role
                                        </Badge>
                                    )}
                                    {isSuperadmin && (
                                        <Badge variant="destructive">
                                            Protected
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {isSuperadmin
                                        ? "This role is protected and cannot be modified"
                                        : isSystemRole
                                          ? "Update permissions for this system role"
                                          : "Update role name and permissions"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Superadmin Warning */}
                        {isSuperadmin && (
                            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Protected Role:</strong> The
                                    superadmin role cannot be modified for
                                    security reasons.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Form
                            action={update(role).url}
                            method={update(role).method}
                            disableWhileProcessing
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Basic Information
                                            </h3>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Role Name{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g., Editor"
                                                required
                                                autoFocus
                                                defaultValue={role.name}
                                                readOnly={isSystemRole}
                                                disabled={isSuperadmin}
                                                className={
                                                    isSystemRole || isSuperadmin
                                                        ? "bg-muted"
                                                        : ""
                                                }
                                            />
                                            {isSystemRole && !isSuperadmin && (
                                                <p className="text-xs text-muted-foreground">
                                                    System role names cannot be
                                                    changed
                                                </p>
                                            )}
                                            <InputError message={errors.name} />
                                        </div>
                                    </div>

                                    {/* Permissions */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    Permissions{" "}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {isSuperadmin
                                                        ? "Permissions are protected"
                                                        : "Select what this role can do"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isSuperadmin &&
                                                    selectedPermissions.length >
                                                        0 && (
                                                        <Badge variant="secondary">
                                                            {
                                                                selectedPermissions.length
                                                            }{" "}
                                                            selected
                                                        </Badge>
                                                    )}
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="select-all"
                                                        checked={selectAll}
                                                        onCheckedChange={
                                                            handleSelectAll
                                                        }
                                                        disabled={isSuperadmin}
                                                    />
                                                    <label
                                                        htmlFor="select-all"
                                                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Select All
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`space-y-6 rounded-lg border p-4 ${
                                                isSuperadmin
                                                    ? "bg-muted/50 opacity-60"
                                                    : ""
                                            }`}
                                        >
                                            {Object.entries(
                                                PERMISSION_GROUPS,
                                            ).map(([group, perms]) => (
                                                <div
                                                    key={group}
                                                    className="space-y-3"
                                                >
                                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        {group}
                                                    </h4>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {perms.map(
                                                            (permission) => {
                                                                const isSelected =
                                                                    selectedPermissions.includes(
                                                                        permission,
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            permission
                                                                        }
                                                                        className={`flex items-start space-x-3 rounded-md border p-3 transition-colors ${
                                                                            isSelected
                                                                                ? "border-primary bg-primary/5"
                                                                                : "border-transparent hover:border-border hover:bg-muted/50"
                                                                        }`}
                                                                    >
                                                                        <Checkbox
                                                                            id={
                                                                                permission
                                                                            }
                                                                            name="permissions[]"
                                                                            value={
                                                                                permission
                                                                            }
                                                                            checked={
                                                                                isSelected
                                                                            }
                                                                            onCheckedChange={() =>
                                                                                handlePermissionToggle(
                                                                                    permission,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isSuperadmin
                                                                            }
                                                                            className="mt-0.5"
                                                                        />
                                                                        <label
                                                                            htmlFor={
                                                                                permission
                                                                            }
                                                                            className={`flex-1 text-sm leading-none font-medium ${
                                                                                isSuperadmin
                                                                                    ? "cursor-not-allowed"
                                                                                    : "cursor-pointer"
                                                                            }`}
                                                                        >
                                                                            {getPermissionLabel(
                                                                                permission,
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError
                                            message={errors.permissions}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row">
                                        <Link
                                            href={index().url}
                                            className="flex-1"
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                disabled={processing}
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={
                                                processing || isSuperadmin
                                            }
                                        >
                                            {processing
                                                ? "Updating..."
                                                : isSuperadmin
                                                  ? "Protected Role"
                                                  : "Update Role"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs,
};
