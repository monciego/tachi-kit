<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Enums\RoleName;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Http\Request;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->checkPermissionTo(Permission::UsersView->value);
    }

    public function view(User $user, User $model): bool
    {
        return $user->checkPermissionTo(Permission::UsersView->value);
    }

    public function create(User $user): bool
    {
        return $user->checkPermissionTo(Permission::UsersCreate->value);
    }

    public function update(User $user, User $model, ?Request $request = null): bool
    {
        if ($model->isSuperadmin() && ! $user->isSuperadmin()) {
            return false;
        }

        $roles = $request?->input('roles');

        $isDemotingSelf = $user->id === $model->id
            && $model->isSuperadmin()
            && is_array($roles)
            && ! in_array(RoleName::Superadmin->value, $roles, true);

        if ($isDemotingSelf) {
            return false;
        }

        return $user->checkPermissionTo(Permission::UsersEdit->value);
    }

    public function updateStatus(User $user, User $model, ?Request $request = null): Response
    {
        if ($user->id === $model->id) {
            return Response::deny('You cannot change your own account status.');
        }

        $isActive = $request?->boolean('is_active') ?? false;

        if (! $isActive && $model->isSuperadmin()) {
            return Response::deny('Superadmin accounts cannot be deactivated.');
        }

        return $user->checkPermissionTo(Permission::UsersStatus->value)
            ? Response::allow()
            : Response::deny();
    }

    public function delete(User $user, User $model): Response
    {
        if ($user->id === $model->id) {
            return Response::deny('You cannot delete your own account.');
        }

        if ($model->isSuperadmin()) {
            return Response::deny('Superadmin accounts cannot be deleted.');
        }

        return $user->checkPermissionTo(Permission::UsersDelete->value)
            ? Response::allow()
            : Response::deny();
    }

    public function restore(User $user, User $model): bool
    {
        return $user->checkPermissionTo(Permission::UsersDelete->value);
    }

    public function forceDelete(User $user, User $model): bool
    {
        return $user->checkPermissionTo(Permission::UsersDelete->value);
    }
}
