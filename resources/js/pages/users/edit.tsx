import { Form, Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Shield, UserCog } from "lucide-react";
import { useState } from "react";

import UserController from "@/actions/App/Http/Controllers/UserController";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import users from "@/routes/users";
import type { BreadcrumbItem } from "@/types";
import RolePicker from "./roles-picker";
import security from "@/routes/security";

interface EditUserProps {
    user: {
        id: number;
        name: string;
        email: string;
        roles: string[];
        is_superadmin: boolean;
    };
    roles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Users",
        href: users.index(),
    },
    {
        title: "Edit User",
        href: users.edit(0),
    },
];

export default function EditUser({ user, roles }: EditUserProps) {
    const { auth } = usePage().props;
    const protectedAccount = user.is_superadmin;
    const isOwnAccount = user.id === auth.user.id;
    const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);

    return (
        <>
            <Head title={`Edit ${user.name}`} />

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
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-md ${protectedAccount ? "bg-destructive" : "bg-indigo-600"}`}
                            >
                                {protectedAccount ? (
                                    <Shield className="h-5 w-5 text-white" />
                                ) : (
                                    <UserCog className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle>Edit User</CardTitle>
                                    {protectedAccount && (
                                        <Badge variant="destructive">
                                            Superadmin
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {protectedAccount
                                        ? "This is a protected superadmin account"
                                        : "Update user information and assigned roles"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-0">
                        {protectedAccount && (
                            <div className="px-4">
                                <Alert className="border-destructive/50 bg-destructive/10 mb-4">
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription>
                                        {isOwnAccount ? (
                                            <span>
                                                <strong>
                                                    Protected Account:
                                                </strong>{" "}
                                                Superadmin accounts are managed
                                                through profile settings. To
                                                update your profile, visit the{" "}
                                                <Link
                                                    className="text-primary underline whitespace-nowrap"
                                                    href={security.edit()}
                                                >
                                                    security settings
                                                </Link>{" "}
                                                page.
                                            </span>
                                        ) : (
                                            <span>
                                                <strong>
                                                    Protected Account:
                                                </strong>{" "}
                                                Superadmin accounts are
                                                protected.
                                            </span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        <Form
                            {...UserController.update.form(user)}
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
                                            <Label>User ID</Label>
                                            <Badge
                                                variant="outline"
                                                className="font-mono"
                                            >
                                                {user.id}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 px-4">
                                            <Label htmlFor="name">
                                                Full Name{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={user.name}
                                                required
                                                disabled={protectedAccount}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2 px-4">
                                            <Label htmlFor="email">
                                                Email Address{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={user.email}
                                                required
                                                autoComplete="username"
                                                disabled={protectedAccount}
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
                                                    User Roles
                                                </h3>
                                                <p className="text-muted-foreground text-xs">
                                                    {protectedAccount
                                                        ? "Roles cannot be modified"
                                                        : "Assign one or more roles"}
                                                </p>
                                            </div>

                                            {!protectedAccount &&
                                                selectedRoles.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {selectedRoles.length}{" "}
                                                        selected
                                                    </Badge>
                                                )}
                                        </div>

                                        <RolePicker
                                            roles={roles}
                                            selected={selectedRoles}
                                            onChange={setSelectedRoles}
                                            disabled={protectedAccount}
                                        />

                                        <InputError
                                            message={errors.roles}
                                            className="mx-4"
                                        />
                                    </div>

                                    {!protectedAccount && (
                                        <>
                                            <Separator />
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 px-4">
                                                    <h3 className="text-foreground text-sm font-semibold">
                                                        Security
                                                    </h3>
                                                </div>

                                                <div className="mx-4 space-y-2">
                                                    <Label htmlFor="password">
                                                        New Password (optional)
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        placeholder="Leave blank to keep current password"
                                                        autoComplete="new-password"
                                                    />
                                                    <p className="text-muted-foreground text-xs">
                                                        Password must be at
                                                        least 8 characters long
                                                    </p>
                                                    <InputError
                                                        message={
                                                            errors.password
                                                        }
                                                    />
                                                </div>

                                                <div className="mx-4 space-y-2">
                                                    <Label htmlFor="password_confirmation">
                                                        Confirm New Password
                                                    </Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

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
                                            disabled={
                                                processing || protectedAccount
                                            }
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Updating...
                                                </>
                                            ) : protectedAccount ? (
                                                "Protected Account"
                                            ) : (
                                                "Update User"
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

EditUser.layout = {
    breadcrumbs,
};
