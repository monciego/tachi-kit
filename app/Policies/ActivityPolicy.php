<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->checkPermissionTo(Permission::ActivityView->value);
    }
}
