import { Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getRoleBadgeVariant, getRoleColor } from "@/utils/role-color";

interface RolePickerProps {
    roles: string[];
    selected: string[];
    onChange: (roles: string[]) => void;
    disabled?: boolean;
}

const SUPERADMIN_ROLE = "superadmin";

export default function RolePicker({
    roles,
    selected,
    onChange,
    disabled = false,
}: RolePickerProps) {
    const hasSuperadmin = selected.includes(SUPERADMIN_ROLE);

    const toggle = (role: string) => {
        if (disabled) return;

        if (role === SUPERADMIN_ROLE) {
            onChange(hasSuperadmin ? [] : [SUPERADMIN_ROLE]);

            return;
        }

        if (hasSuperadmin) return;

        onChange(
            selected.includes(role)
                ? selected.filter((r) => r !== role)
                : [...selected, role],
        );
    };

    const isLocked = (role: string) =>
        disabled || (hasSuperadmin && role !== SUPERADMIN_ROLE);

    const titleCase = (name: string) =>
        name.charAt(0).toUpperCase() + name.slice(1);

    return (
        <div
            className={`mx-4 grid gap-3 rounded-lg border p-2 sm:grid-cols-4 ${
                disabled ? "pointer-events-none opacity-60" : ""
            }`}
        >
            {roles.map((role) => {
                const isSelected = selected.includes(role);
                const locked = isLocked(role);

                return (
                    <div
                        key={role}
                        className={`flex items-center space-x-2 rounded-md border p-2 transition-colors ${
                            isSelected
                                ? "border-primary bg-primary/5"
                                : "hover:border-border hover:bg-muted/50 border-transparent"
                        } ${locked ? "opacity-50" : ""}`}
                    >
                        <Checkbox
                            id={role}
                            name="roles[]"
                            value={role}
                            checked={isSelected}
                            disabled={locked}
                            onCheckedChange={() => toggle(role)}
                            className="mt-0.5"
                        />
                        <Label
                            htmlFor={role}
                            className="cursor-pointer leading-none font-medium"
                        >
                            <Badge
                                variant={getRoleBadgeVariant(role)}
                                className={`${getRoleColor(role)} text-xs`}
                            >
                                {titleCase(role)}
                            </Badge>
                        </Label>
                    </div>
                );
            })}

            {hasSuperadmin && (
                <div className="sm:col-span-4">
                    <Alert variant="default" className="border-indigo-500/40">
                        <Info className="text-indigo-500" />
                        <AlertDescription>
                            Superadmin has unrestricted access and cannot be
                            combined with other roles.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
}
