import { Form, Head, Link } from "@inertiajs/react";
import { ArrowLeft, HelpCircle, UserPlus } from "lucide-react";
import { useState } from "react";

import UserController from "@/actions/App/Http/Controllers/UserController";
import InputError from "@/components/input-error";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import users from "@/routes/users";
import type { BreadcrumbItem } from "@/types";
import { getRoleBadgeVariant, getRoleColor } from "@/utils/role-color";

interface CreateUserProps {
    roles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Users",
        href: users.index(),
    },
    {
        title: "Create User",
        href: users.create(),
    },
];

export default function Create({ roles }: CreateUserProps) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const hasSuperAdmin = selectedRoles.includes("superadmin");

    const handleRoleToggle = (roleName: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleName)
                ? prev.filter((role) => role !== roleName)
                : [...prev, roleName],
        );
    };

    const titleCase = (roleName: string) =>
        roleName.charAt(0).toUpperCase() + roleName.slice(1);

    return (
        <>
            <Head title="Create User" />

            <div className="mx-auto max-w-2xl">
                <Link href={users.index()}>
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Users
                    </Button>
                </Link>

                <Card>
                    <CardHeader className="px-4 py-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600">
                                <UserPlus className="h-5 w-5 text-gray-100" />
                            </div>
                            <div>
                                <CardTitle>Create New User</CardTitle>
                                <CardDescription>
                                    Add a new user to the system with roles
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 px-0">
                        <Form
                            {...UserController.store.form()}
                            resetOnSuccess={[
                                "password",
                                "password_confirmation",
                            ]}
                            disableWhileProcessing
                            className="space-y-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-4">
                                            <h3 className="text-foreground text-sm font-semibold">
                                                Basic Information
                                            </h3>
                                        </div>

                                        <div className="space-y-2 px-4">
                                            <Label
                                                htmlFor="name"
                                                className="mb-2 block"
                                            >
                                                Full Name{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                name="name"
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder="Enter full name"
                                                required
                                                autoFocus
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2 px-4">
                                            <Label
                                                htmlFor="email"
                                                className="mb-2 block"
                                            >
                                                Email Address{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                placeholder="user@tachikit.com"
                                                tabIndex={2}
                                                autoComplete="email"
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-4">
                                            <div>
                                                <h3 className="text-foreground text-sm font-semibold">
                                                    User Roles{" "}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </h3>
                                                <p className="text-muted-foreground text-xs">
                                                    Assign one or more roles to
                                                    this user
                                                </p>
                                            </div>
                                            {selectedRoles.length > 0 && (
                                                <Badge variant="secondary">
                                                    {selectedRoles.length}{" "}
                                                    selected
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="mx-4 grid gap-3 rounded-lg border p-2 sm:grid-cols-4">
                                            {roles.map((role) => {
                                                const isSelected =
                                                    selectedRoles.includes(
                                                        role,
                                                    );

                                                return (
                                                    <div
                                                        key={role}
                                                        className={`flex items-center space-x-2 rounded-md border p-2 transition-colors ${
                                                            isSelected
                                                                ? "border-primary bg-primary/5"
                                                                : "hover:border-border hover:bg-muted/50 border-transparent"
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            id={role}
                                                            name="roles[]"
                                                            value={role}
                                                            checked={isSelected}
                                                            onCheckedChange={() =>
                                                                handleRoleToggle(
                                                                    role,
                                                                )
                                                            }
                                                            className="mt-0.5"
                                                        />
                                                        <Label
                                                            htmlFor={role}
                                                            className="cursor-pointer leading-none font-medium"
                                                        >
                                                            <Badge
                                                                variant={getRoleBadgeVariant(
                                                                    role,
                                                                )}
                                                                className={`${getRoleColor(role)} text-xs`}
                                                            >
                                                                {titleCase(
                                                                    role,
                                                                )}
                                                            </Badge>
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError
                                            message={errors.roles}
                                            className="mx-4"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-4">
                                            <h3 className="text-foreground text-sm font-semibold">
                                                Security
                                            </h3>
                                        </div>

                                        <div className="mx-4 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="password">
                                                    {hasSuperAdmin
                                                        ? "Password"
                                                        : "Temporary Password"}{" "}
                                                    <span className="text-destructive">
                                                        *
                                                    </span>
                                                </Label>
                                                {!hasSuperAdmin && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p>
                                                                    This
                                                                    temporary
                                                                    password
                                                                    lets the
                                                                    user log in.
                                                                    They can
                                                                    change it
                                                                    after
                                                                    logging into
                                                                    their
                                                                    account.
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Min. 8 characters"
                                                required
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                Password must be at least 8
                                                characters long
                                            </p>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="mx-4 space-y-2">
                                            <Label htmlFor="password_confirmation">
                                                {hasSuperAdmin
                                                    ? "Confirm Password"
                                                    : "Confirm Temporary Password"}{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Re-enter password"
                                                required
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="mx-4 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row">
                                        <Link
                                            href={users.index()}
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
                                            tabIndex={5}
                                            disabled={
                                                processing ||
                                                selectedRoles.length === 0
                                            }
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Create User"
                                            )}
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

Create.layout = {
    breadcrumbs,
};
