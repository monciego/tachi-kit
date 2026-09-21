<?php

namespace App\Enums;

enum Permission: string
{
    // Users
    case UsersView = 'users.view';

    case UsersCreate = 'users.create';

    case UsersEdit = 'users.edit';

    case UsersDelete = 'users.delete';

    case UsersStatus = 'users.status';

    // Roles
    case RolesView = 'roles.view';

    case RolesCreate = 'roles.create';

    case RolesEdit = 'roles.edit';

    case RolesDelete = 'roles.delete';

    /**
     * Human-readable label for this permission.
     */
    public function label(): string
    {
        return match ($this) {
            self::UsersView => 'View Users',
            self::UsersCreate => 'Create Users',
            self::UsersEdit => 'Edit Users',
            self::UsersDelete => 'Delete Users',
            self::UsersStatus => 'Change User Status',
            self::RolesView => 'View Roles',
            self::RolesCreate => 'Create Roles',
            self::RolesEdit => 'Edit Roles',
            self::RolesDelete => 'Delete Roles',
        };
    }

    /**
     * Every permission as a flat list of DB values.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $permission) => $permission->value,
            self::cases(),
        );
    }
}
