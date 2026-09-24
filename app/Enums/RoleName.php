<?php

namespace App\Enums;

/**
 * The built-in system roles. They are seeded, cannot be edited or deleted,
 * and are always listed before custom roles.
 */
enum RoleName: string
{
    case Superadmin = 'superadmin';

    case Admin = 'admin';

    case User = 'user';

    /**
     * Every system role as a flat list of DB values, in display order.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $role) => $role->value,
            self::cases(),
        );
    }
}
