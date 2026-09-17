<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(Permission::RolesView->value);
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo(Permission::RolesView->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::RolesCreate->value);
    }

    public function update(User $user, Role $role): bool
    {
        if ($role->isSystemRole()) {
            return false;
        }

        return $user->hasPermissionTo(Permission::RolesEdit->value);
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->isSystemRole()) {
            return false;
        }

        if ($role->users()->count() > 0) {
            return false;
        }

        return $user->hasPermissionTo(Permission::RolesDelete->value);
    }

    public function restore(User $user, Role $role): bool
    {
        return $user->hasPermissionTo(Permission::RolesDelete->value);
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return $user->hasPermissionTo(Permission::RolesDelete->value);
    }
}
