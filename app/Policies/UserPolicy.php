<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Http\Request;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(Permission::UsersView->value);
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermissionTo(Permission::UsersView->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::UsersCreate->value);
    }

    public function update(User $user, User $model, ?Request $request = null): bool
    {
        if ($model->hasRole('superadmin') && ! $user->hasRole('superadmin')) {
            return false;
        }

        $roles = $request?->input('roles');

        $isDemotingSelf = $user->id === $model->id
            && $model->hasRole('superadmin')
            && is_array($roles)
            && ! in_array('superadmin', $roles, true);

        if ($isDemotingSelf) {
            return false;
        }

        return $user->hasPermissionTo(Permission::UsersEdit->value);
    }

    public function updateStatus(User $user, User $model, ?Request $request = null): Response
    {
        if ($user->id === $model->id) {
            return Response::deny('You cannot change your own account status.');
        }

        $isActive = $request?->boolean('is_active') ?? false;

        if (! $isActive && $model->hasRole('superadmin')) {
            return Response::deny('Superadmin accounts cannot be deactivated.');
        }

        return $user->hasPermissionTo(Permission::UsersStatus->value)
            ? Response::allow()
            : Response::deny();
    }

    public function delete(User $user, User $model): Response
    {
        if ($user->id === $model->id) {
            return Response::deny('You cannot delete your own account.');
        }

        if ($model->hasRole('superadmin')) {
            return Response::deny('Superadmin accounts cannot be deleted.');
        }

        return $user->hasPermissionTo(Permission::UsersDelete->value)
            ? Response::allow()
            : Response::deny();
    }

    public function restore(User $user, User $model): bool
    {
        return $user->hasPermissionTo(Permission::UsersDelete->value);
    }

    public function forceDelete(User $user, User $model): bool
    {
        return $user->hasPermissionTo(Permission::UsersDelete->value);
    }
}
